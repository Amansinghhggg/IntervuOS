import Interview from "../models/interview.model.js";
import MockInterview from "../models/MockInterview.js";
import InterviewResult from "../models/InterviewResult.js";
import { cacheService } from "../../../shared/services/cacheService.js";

/**
 * InterviewRepository Abstraction
 * Unified data access repository encapsulating queries for both Employer and Mock Interviews.
 * Prevents upper service layers from containing database location or collection-specific logic.
 * Employs Redis query caching for ultra-low database load during peak interview traffic.
 */
class InterviewRepository {
  /**
   * Find an interview document by ID across both Interview and MockInterview collections.
   * @param {string} id 
   * @returns {Promise<Object|null>} Interview or MockInterview document
   */
  async findById(id) {
    if (!id) return null;
    return await cacheService.getOrSetCache(`interview:id:${id}`, 120, async () => {
      let interview = await Interview.findById(id);
      if (!interview) {
        interview = await MockInterview.findById(id);
      }
      return interview;
    });
  }

  /**
   * Find an interview document by code across both collections.
   * Cached in Redis for 300s to handle high-frequency link clicks.
   * @param {string} code 
   * @returns {Promise<Object|null>}
   */
  async findByCode(code) {
    if (!code) return null;
    const formattedCode = code.toUpperCase();
    return await cacheService.getOrSetCache(`interview:code:${formattedCode}`, 300, async () => {
      let interview = await Interview.findOne({ interviewCode: formattedCode });
      if (!interview) {
        interview = await MockInterview.findOne({ interviewCode: formattedCode });
      }
      return interview;
    });
  }

  /**
   * Find all active employer interviews for an employer.
   * @param {string} employerId 
   * @returns {Promise<Array>}
   */
  async findEmployerInterviews(employerId) {
    if (!employerId) return [];
    return await cacheService.getOrSetCache(`employer:interviews:${employerId}`, 60, async () => {
      return await Interview.find({ employer: employerId }).sort({ createdAt: -1 });
    });
  }

  /**
   * Find candidate assigned interviews from employer campaigns.
   * @param {string} candidateEmail 
   * @returns {Promise<Array>}
   */
  async findCandidateAssignedInterviews(candidateEmail) {
    if (!candidateEmail) return [];
    const emailLower = candidateEmail.toLowerCase();

    return await cacheService.getOrSetCache(`candidate:assigned:${emailLower}`, 60, async () => {
      const interviews = await Interview.find({
        "assignedCandidates.email": emailLower,
        status: { $in: ["active", "completed", "CREATED", "IN_PROGRESS", "COMPLETED"] },
        isVerified: true,
      })
        .populate("employer", "name")
        .sort({ createdAt: -1 })
        .lean();

      return interviews.map((interview) => {
        const candidateInfo = interview.assignedCandidates?.find(
          c => c.email && c.email.toLowerCase().trim() === emailLower
        );
        delete interview.assignedCandidates;
        delete interview.customQuestions; // Protect question bank from candidate Network tab inspection
        return {
          ...interview,
          candidateStatus: candidateInfo?.status || "Pending",
        };
      });
    });
  }

  /**
   * Find completed mock evaluation history for a candidate with pagination.
   * @param {string} candidateId 
   * @param {Object} options { page, limit }
   * @returns {Promise<Object>} { evaluations, total, page, totalPages }
   */
  async findCandidateMockHistory(candidateId, { page = 1, limit = 1000 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const query = { candidateId, mode: "MOCK" };

    const total = await InterviewResult.countDocuments(query);
    const results = await InterviewResult.find(query)
      .populate("sessionId", "recording questions createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      evaluations: results,
      total,
      page: pageNum,
      totalPages,
    };
  }

  /**
   * Save a new mock interview document.
   * @param {Object} data 
   * @returns {Promise<Object>} Created MockInterview document
   */
  async saveMock(data) {
    const mock = await MockInterview.create(data);
    await cacheService.invalidateCachePattern("admin:mocks:*");
    return mock;
  }

  /**
   * Update candidate assignment status inside an interview or mock interview.
   * @param {string} interviewId 
   * @param {string} candidateEmail 
   * @param {string} status 
   * @param {string} [resultId] 
   */
  async updateCandidateStatus(interviewId, candidateEmail, status, resultId = null) {
    let interview = await Interview.findById(interviewId);
    if (!interview) {
      interview = await MockInterview.findById(interviewId);
    }
    if (!interview) return null;

    const emailLower = (candidateEmail || "").toLowerCase();
    interview.assignedCandidates = interview.assignedCandidates || [];
    let candidate = interview.assignedCandidates.find(c => c.email && c.email.toLowerCase() === emailLower);

    if (candidate) {
      candidate.status = status;
      if (status === "In Progress" || status === "IN_PROGRESS") candidate.joinedAt = candidate.joinedAt || new Date();
      if (status === "Completed" || status === "COMPLETED") candidate.submittedAt = new Date();
      if (resultId) candidate.resultId = resultId;
    } else if (emailLower) {
      interview.assignedCandidates.push({
        email: emailLower,
        status,
        joinedAt: (status === "In Progress" || status === "IN_PROGRESS") ? new Date() : null,
        submittedAt: (status === "Completed" || status === "COMPLETED") ? new Date() : null,
        resultId: resultId || null
      });
    }

    await interview.save();

    // Invalidate relevant caches
    await Promise.all([
      cacheService.invalidateCache(`interview:id:${interviewId}`),
      interview.interviewCode ? cacheService.invalidateCache(`interview:code:${interview.interviewCode.toUpperCase()}`) : Promise.resolve(),
      emailLower ? cacheService.invalidateCache(`candidate:assigned:${emailLower}`) : Promise.resolve(),
      cacheService.invalidateCachePattern("candidate:assigned:*"),
      interview.employer ? cacheService.invalidateCache(`employer:interviews:${interview.employer}`) : Promise.resolve(),
      cacheService.invalidateCachePattern("admin:campaigns:*"),
    ]);

    return interview;
  }

  /**
   * Invalidate cached interview entries
   */
  async invalidateInterview(interviewId, interviewCode, employerId) {
    const promises = [];
    if (interviewId) promises.push(cacheService.invalidateCache(`interview:id:${interviewId}`));
    if (interviewCode) promises.push(cacheService.invalidateCache(`interview:code:${interviewCode.toUpperCase()}`));
    if (employerId) promises.push(cacheService.invalidateCache(`employer:interviews:${employerId}`));
    promises.push(cacheService.invalidateCachePattern("admin:campaigns:*"));
    promises.push(cacheService.invalidateCachePattern("candidate:assigned:*"));
    await Promise.all(promises);
  }

  /**
   * Find incomplete or in-progress mock interviews for candidate.
   * @param {string} candidateId 
   * @param {string} candidateEmail 
   * @returns {Promise<Array>}
   */
  async findCandidateIncompleteMocks(candidateId, candidateEmail) {
    const emailLower = (candidateEmail || "").toLowerCase();
    const mocks = await MockInterview.find({
      $or: [
        { candidate: candidateId },
        { "assignedCandidates.email": emailLower }
      ],
      mode: "MOCK"
    }).sort({ createdAt: -1 }).lean();

    const incomplete = [];
    for (const m of mocks) {
      const candidateInfo = m.assignedCandidates?.find(c => c.email?.toLowerCase() === emailLower) || {};
      const status = candidateInfo.status || m.status;
      if (status !== "Completed" && status !== "COMPLETED") {
        incomplete.push({
          ...m,
          candidateStatus: status
        });
      }
    }
    return incomplete;
  }
}

export default new InterviewRepository();
