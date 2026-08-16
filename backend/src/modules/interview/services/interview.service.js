import crypto from "crypto";
import Interview from "../models/interview.model.js";
import { createInterviewEngine } from "./interviewEngine.js";
import { InterviewConfig } from "./InterviewConfig.js";

const generateInterviewCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

class InterviewService {
  async createInterview(employerId, validatedData) {
    const uniqueEmails = [...new Set((validatedData.candidateEmails || []).map(e => e.toLowerCase()))];
    const assignedCandidates = uniqueEmails.map((email) => ({
      email,
      status: "Pending",
    }));

    let interviewCode;
    let isUnique = false;
    while (!isUnique) {
      interviewCode = generateInterviewCode();
      const existing = await Interview.findOne({ interviewCode });
      if (!existing) isUnique = true;
    }

    const created = await Interview.create({
      title: validatedData.title,
      jobRole: validatedData.jobRole,
      description: validatedData.description,
      topics: validatedData.topics || [],
      experienceLevel: validatedData.experienceLevel,
      difficulty: validatedData.difficulty,
      duration: validatedData.duration,
      instructions: validatedData.instructions,
      questionMode: validatedData.questionMode || "AI_GENERATED",
      customQuestions: validatedData.customQuestions || [],
      requireApproval: validatedData.requireApproval !== undefined ? validatedData.requireApproval : true,
      interviewCode,
      employer: employerId,
      assignedCandidates,
    });

    const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
    await InterviewRepository.invalidateInterview(created._id, created.interviewCode, employerId);

    return created;
  }

  async getEmployerInterviews(employerId) {
    const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
    return await InterviewRepository.findEmployerInterviews(employerId);
  }

  async getInterviewById(interviewId, userRole, userEmail, userId) {
    const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
    const interview = await InterviewRepository.findById(interviewId);

    if (!interview) return null;

    const emailLower = (userEmail || "").toLowerCase();
    const userIdStr = userId ? userId.toString() : "";

    if (userRole === "employer") {
      const employerIdStr = interview.employer ? interview.employer.toString() : "";
      if (employerIdStr && employerIdStr !== userIdStr) return null;
    } else if (userRole === "candidate") {
      const candidateOwnerStr = interview.candidate ? interview.candidate.toString() : "";
      const isAssigned = emailLower && interview.assignedCandidates?.some(
        (c) => c.email && c.email.toLowerCase() === emailLower
      );

      const isOwner = candidateOwnerStr && candidateOwnerStr === userIdStr;
      const isMockMode = interview.mode === "MOCK";

      if (!isAssigned && !isOwner && !isMockMode) {
        return null;
      }
    }

    if (!interview.interviewType) {
      interview.interviewType = process.env.QUESTION_PROVIDER || "gemini";
    }
    return interview;
  }

  async updateInterview(interviewId, employerId, validatedData) {
    const interview = await Interview.findOne({
      _id: interviewId,
      employer: employerId,
    });

    if (!interview) {
      return null;
    }

    // Merge new candidates if provided
    if (validatedData.candidateEmails) {
      const existingEmails = interview.assignedCandidates.map(c => c.email.toLowerCase());
      const uniqueNewEmails = [...new Set(validatedData.candidateEmails.map(e => e.toLowerCase()))];

      const newCandidates = uniqueNewEmails
        .filter(email => !existingEmails.includes(email))
        .map(email => ({ email, status: "Pending" }));

      interview.assignedCandidates.push(...newCandidates);
      delete validatedData.candidateEmails;
    }

    // Remove candidate if provided
    if (validatedData.removeCandidateEmail) {
      const emailToRemove = validatedData.removeCandidateEmail.toLowerCase();
      const targetCandidate = interview.assignedCandidates.find(
        (c) => c.email && c.email.toLowerCase() === emailToRemove
      );

      if (targetCandidate && (targetCandidate.status === "Completed" || targetCandidate.status === "In Progress")) {
        throw new Error("Candidates who have completed or attempted the interview cannot be removed. They can only be re-enrolled.");
      }

      interview.assignedCandidates = interview.assignedCandidates.filter(
        (c) => c.email.toLowerCase() !== emailToRemove
      );
      delete validatedData.removeCandidateEmail;
    }

    // Add single candidate if provided
    if (validatedData.addCandidateEmail) {
      const emailToAdd = validatedData.addCandidateEmail.toLowerCase();
      const existingEmails = interview.assignedCandidates.map(c => c.email.toLowerCase());
      if (!existingEmails.includes(emailToAdd)) {
        interview.assignedCandidates.push({ email: emailToAdd, status: "Pending" });
      }
      delete validatedData.addCandidateEmail;
    }

    Object.assign(interview, validatedData);
    await interview.save();

    const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
    await InterviewRepository.invalidateInterview(interview._id, interview.interviewCode, employerId);

    return interview;
  }

  async deleteInterview(interviewId, employerId) {
    const deleted = await Interview.findOneAndDelete({
      _id: interviewId,
      employer: employerId,
    });

    if (deleted) {
      const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
      await InterviewRepository.invalidateInterview(deleted._id, deleted.interviewCode, employerId);
    }

    return deleted;
  }

  async getAssignedInterviews(candidateEmail) {
    const interviews = await Interview.find({
      "assignedCandidates.email": candidateEmail,
      status: { $in: ["active", "completed"] },
      isVerified: true,
    })
      .populate("employer", "name")
      .sort({ createdAt: -1 })
      .lean();

    return interviews.map(interview => {
      const candidateInfo = interview.assignedCandidates?.find(c => c.email === candidateEmail);
      delete interview.assignedCandidates; // Protect other candidates' data
      delete interview.customQuestions; // Protect question bank from candidate Network tab inspection
      return {
        ...interview,
        candidateStatus: candidateInfo?.status || "Pending"
      };
    });
  }

  async joinInterview(interviewCode, candidateEmail) {
    const interview = await Interview.findOne({
      interviewCode: interviewCode.toUpperCase(),
      status: "active",
    }).populate("employer", "name");

    if (!interview) {
      throw new Error("Interview not found or inactive");
    }

    if (!interview.isVerified) {
      throw new Error("Interview is not verified by admin yet and cannot be joined");
    }

    const candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email.toLowerCase() === candidateEmail.toLowerCase()
    );
    const isAssigned = candidateIndex !== -1;
    let candidateStatus = "Pending";

    if (!isAssigned) {
      if (interview.maxCandidates !== null && interview.maxCandidates !== undefined && interview.maxCandidates > 0) {
        if (interview.assignedCandidates.length >= interview.maxCandidates) {
          throw new Error(`Maximum candidate limit reached for this interview (Maximum: ${interview.maxCandidates})`);
        }
      }

      candidateStatus = interview.requireApproval !== false ? "Requested" : "Pending";

      // Auto-enroll candidate if they have the code
      interview.assignedCandidates.push({
        email: candidateEmail,
        status: candidateStatus,
      });
      await interview.save();
    } else {
      candidateStatus = interview.assignedCandidates[candidateIndex].status;
    }

    if (candidateStatus === "Requested") {
      return {
        status: "Requested",
        message: "Join request sent. Awaiting employer approval.",
      };
    } else if (candidateStatus === "Rejected") {
      throw new Error("Your request to join this interview was rejected.");
    }

    const interviewData = interview.toObject();
    delete interviewData.assignedCandidates;
    delete interviewData.customQuestions; // Protect question bank from candidate Network tab inspection

    if (!interviewData.interviewType) {
      interviewData.interviewType = process.env.QUESTION_PROVIDER || "gemini";
    }

    return interviewData;
  }

  async handleJoinRequest(interviewId, employerId, candidateEmail, action) {
    const interview = await Interview.findOne({ _id: interviewId, employer: employerId });

    if (!interview) {
      throw new Error("Interview not found or unauthorized");
    }

    const candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email.toLowerCase() === candidateEmail.toLowerCase()
    );

    if (candidateIndex === -1) {
      throw new Error("Candidate request not found");
    }

    if (interview.assignedCandidates[candidateIndex].status !== "Requested") {
      throw new Error("Candidate is not in a requested state");
    }

    if (action === "approve") {
      interview.assignedCandidates[candidateIndex].status = "Pending";
    } else if (action === "reject") {
      interview.assignedCandidates[candidateIndex].status = "Rejected";
    } else {
      throw new Error("Invalid action");
    }

    await interview.save();
    return interview;
  }

  async startInterview(interviewId, candidateEmail) {
    const Interview = (await import("../models/interview.model.js")).default;
    const MockInterview = (await import("../models/MockInterview.js")).default;
    const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;

    let interview = await Interview.findById(interviewId);
    let isMock = false;
    if (!interview) {
      interview = await MockInterview.findById(interviewId);
      isMock = true;
    }

    if (!interview) {
      throw new Error("not_found");
    }

    if (!isMock && !interview.isVerified) {
      throw new Error("interview_unverified");
    }

    const emailLower = (candidateEmail || "").toLowerCase();

    // Assigned (non-mock) interviews require candidate to have uploaded a resume
    if (!isMock && interview.mode !== "MOCK") {
      const User = (await import("../../users/user.model.js")).default;
      const userDoc = await User.findOne({ email: emailLower }).select("resume");
      if (!userDoc?.resume?.url) {
        throw new Error("resume_required");
      }
    }

    interview.assignedCandidates = interview.assignedCandidates || [];
    const candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email && c.email.toLowerCase() === emailLower
    );

    if (candidateIndex === -1) {
      if (interview.maxCandidates !== null && interview.maxCandidates !== undefined && interview.maxCandidates > 0) {
        if (interview.assignedCandidates.length >= interview.maxCandidates) {
          throw new Error("max_candidates_reached");
        }
      }
      if (emailLower) {
        interview.assignedCandidates.push({ email: emailLower, status: "In Progress", joinedAt: new Date() });
        await interview.save();
        await InterviewRepository.invalidateInterview(interview._id, interview.interviewCode, interview.employer);
      }
      return true;
    }

    if (interview.assignedCandidates[candidateIndex].status === "Completed") {
      throw new Error("already_completed");
    }

    interview.assignedCandidates[candidateIndex].status = "In Progress";
    interview.assignedCandidates[candidateIndex].joinedAt = interview.assignedCandidates[candidateIndex].joinedAt || new Date();
    await interview.save();
    await InterviewRepository.invalidateInterview(interview._id, interview.interviewCode, interview.employer);

    return true;
  }

  async submitInterview(interviewId, candidateEmail) {
    const Interview = (await import("../models/interview.model.js")).default;
    const MockInterview = (await import("../models/MockInterview.js")).default;
    const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;

    let interview = await Interview.findById(interviewId);
    if (!interview) {
      interview = await MockInterview.findById(interviewId);
    }

    if (!interview) {
      throw new Error("not_found");
    }

    const emailLower = (candidateEmail || "").toLowerCase();
    interview.assignedCandidates = interview.assignedCandidates || [];
    const candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email && c.email.toLowerCase() === emailLower
    );

    if (candidateIndex !== -1) {
      interview.assignedCandidates[candidateIndex].status = "Completed";
      interview.assignedCandidates[candidateIndex].submittedAt = new Date();
      await interview.save();
    } else if (emailLower) {
      interview.assignedCandidates.push({
        email: emailLower,
        status: "Completed",
        submittedAt: new Date(),
      });
      await interview.save();
    }

    await InterviewRepository.invalidateInterview(interview._id, interview.interviewCode, interview.employer);
    return true;
  }

  async getInterviewQuestions(interviewId, candidateEmail) {
    const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
    const interview = await InterviewRepository.findById(interviewId);

    if (!interview) {
      throw new Error("not_found");
    }

    const emailLower = candidateEmail.toLowerCase();
    const isAssigned = interview.assignedCandidates?.some(
      (c) => c.email.toLowerCase() === emailLower
    ) || (interview.candidate && interview.candidate.toString());

    if (!isAssigned) {
      throw new Error("not_found");
    }

    return interview.questions || [];
  }
}

export default new InterviewService();
