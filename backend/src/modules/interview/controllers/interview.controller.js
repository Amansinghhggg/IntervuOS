import mongoose from "mongoose";
import interviewService from "../services/interview.service.js";
import InterviewSessionService from "../services/InterviewSessionService.js";
import { InterviewConfig } from "../services/InterviewConfig.js";
import { createInterviewEngine } from "../services/interviewEngine.js";
import {
  createInterviewSchema,
  updateInterviewSchema,
  joinInterviewSchema,
} from "../validation/interview.validation.js";
import { cacheService } from "../../../shared/services/cacheService.js";

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Employer only
const createInterview = async (req, res, next) => {
  try {
    // Strip admin-only fields if sender is not an admin
    if (req.user?.role !== "admin") {
      delete req.body.isVerified;
      delete req.body.maxCandidates;
    }

    const validated = createInterviewSchema.parse(req.body);
    const interview = await interviewService.createInterview(req.user._id, validated);

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Get interviews created by employer
// @route   GET /api/interviews
// @access  Employer only
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getEmployerInterviews(req.user._id);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Employer/Candidate
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewById(
      req.params.id,
      req.user.role,
      req.user.email,
      req.user._id
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const interviewData = interview.toObject ? interview.toObject() : { ...interview };

    // Strict Candidate Check: Candidate can ONLY see verified interviews
    if (req.user?.role === "candidate" && interviewData.mode !== "MOCK" && !interviewData.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Interview is not verified by admin yet and is unavailable.",
      });
    }

    if (req.user?.role === "candidate") {
      delete interviewData.customQuestions;
    }

    res.status(200).json({
      success: true,
      interview: interviewData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview details
// @route   PATCH /api/interviews/:id
// @access  Employer only
const updateInterview = async (req, res, next) => {
  try {
    // Strip admin-only fields if sender is not an admin
    if (req.user?.role !== "admin") {
      delete req.body.isVerified;
      delete req.body.maxCandidates;
    }

    const validated = updateInterviewSchema.parse(req.body);
    const interview = await interviewService.updateInterview(req.params.id, req.user._id, validated);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
// @access  Employer only
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.deleteInterview(req.params.id, req.user._id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate gets assigned interviews
// @route   GET /api/interviews/candidate/assigned
// @access  Candidate only
const getAssignedInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getAssignedInterviews(req.user.email);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate joins an interview via code
// @route   POST /api/interviews/join
// @access  Candidate only
const joinInterview = async (req, res, next) => {
  try {
    const validated = joinInterviewSchema.parse(req.body);
    const interviewData = await interviewService.joinInterview(validated.interviewCode, req.user.email);

    res.status(200).json({
      success: true,
      interview: interviewData,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    if (error.message === "unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to join this interview.",
      });
    }

    if (error.message && error.message.includes("not verified")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message && error.message.includes("limit reached")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Interview not found or inactive",
    });
  }
};

// @desc    Employer approves or rejects a candidate's join request
// @route   PATCH /api/interviews/:id/requests
// @access  Employer only
const handleJoinRequest = async (req, res, next) => {
  try {
    const { email, action } = req.body;

    if (!email || !action) {
      return res.status(400).json({ success: false, message: "Email and action are required." });
    }

    const interview = await interviewService.handleJoinRequest(req.params.id, req.user._id, email, action);

    res.status(200).json({
      success: true,
      message: `Candidate request ${action}d successfully.`,
      interview
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Candidate gets the current active interview session (ForkTalent)
// @route   GET /api/interviews/:id/session
// @access  Candidate only
const getInterviewSession = async (req, res, next) => {
  try {
    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;

    const session = await InterviewSessionService.getActiveSession(req.params.id, req.user._id);
    if (!session) {
      return res.status(404).json({ success: false, message: "No active session found." });
    }

    res.status(200).json({
      success: true,
      session,
      currentQuestion: session.questions[session.currentQuestionIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate starts an interview
// @route   POST /api/interviews/:id/start
// @access  Candidate only
const startInterview = async (req, res, next) => {
  try {
    // 1. Get interview details from the existing legacy service
    const interviewData = await interviewService.getInterviewById(req.params.id, "candidate", req.user.email, req.user._id);
    if (!interviewData) throw new Error("not_found");

    // If not a mock interview, candidate must have uploaded a resume
    const isMock = interviewData.isMock || interviewData.mode === "MOCK" || interviewData.interview?.mode === "MOCK";
    if (!isMock) {
      const User = (await import("../../users/user.model.js")).default;
      const userDoc = await User.findById(req.user._id).select("resume");
      if (!userDoc?.resume?.url) {
        return res.status(400).json({
          success: false,
          code: "RESUME_REQUIRED",
          message: "A resume is required to participate in employer assigned interviews. Please upload your resume first.",
        });
      }
    }

    // Check if it's an AI or Session interview
    const provider = process.env.QUESTION_PROVIDER || "gemini";
    const qMode = interviewData.questionMode || interviewData.interview?.questionMode;
    const isAiInterview = provider === "gemini" || provider === "groq" ||
      interviewData.interviewType === "gemini" || interviewData.interviewType === "groq" ||
      qMode === "EMPLOYER_PRESET" || qMode === "HYBRID";

    if (isAiInterview) {
      let session = await InterviewSessionService.getOrCreateSession(req.params.id, req.user._id);

      if (session.status === "ACTIVE") {
        // Ensure legacy status is marked correctly even if resumed
        await interviewService.startInterview(req.params.id, req.user.email);
        return res.status(200).json({ success: true, session, message: "Session resumed." });
      }

      if (session.status === "COMPLETED") {
        return res.status(409).json({ success: false, message: "Interview already completed." });
      }

      // Initialize AI Engine
      const config = InterviewConfig.fromInterview(interviewData.interview || interviewData);

      const engine = createInterviewEngine(process.env.QUESTION_PROVIDER || "gemini", config);
      const questions = await engine.generateFirstQuestion(config);
      const firstQuestion = questions[0];

      session = await InterviewSessionService.startSession(session._id, firstQuestion, config.duration);

      // Update candidate status to "In Progress" in the main interview document
      await interviewService.startInterview(req.params.id, req.user.email);

      return res.status(200).json({
        success: true,
        message: "ForkTalent started.",
        session,
        currentQuestion: firstQuestion
      });
    }

    // Static legacy flow fallback
    await interviewService.startInterview(req.params.id, req.user.email);
    res.status(200).json({
      success: true,
      message: "Interview started successfully.",
    });
  } catch (error) {
    if (error.message === "resume_required") {
      return res.status(400).json({
        success: false,
        code: "RESUME_REQUIRED",
        message: "A resume is required to participate in employer assigned interviews. Please upload your resume first.",
      });
    }
    if (error.message === "interview_unverified") {
      return res.status(403).json({
        success: false,
        message: "Interview campaign is not verified by Admin and cannot be started.",
      });
    }
    if (error.message === "max_candidates_reached") {
      return res.status(400).json({
        success: false,
        message: "Maximum candidate limit reached for this interview.",
      });
    }
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or you are not assigned.",
      });
    }
    if (error.message === "already_completed") {
      return res.status(409).json({
        success: false,
        message: "Interview already completed.",
      });
    }
    next(error);
  }
};

// @desc    Candidate submits an answer for the current question
// @route   POST /api/interviews/:id/answer
// @access  Candidate only
const submitAnswer = async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ success: false, message: "Answer text is required." });
    }

    const session = await InterviewSessionService.getActiveSession(req.params.id, req.user._id);
    if (!session || session.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: "No active session found." });
    }

    const interviewData = await interviewService.getInterviewById(req.params.id, "candidate", req.user.email, req.user._id);

    // Map actual config from the database
    const config = InterviewConfig.fromInterview(interviewData?.interview || interviewData);
    const engine = createInterviewEngine(process.env.QUESTION_PROVIDER || "gemini", config);

    const result = await InterviewSessionService.submitAnswer({
      session,
      answer,
      interviewConfig: config,
      interviewEngine: engine
    });

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

// @desc    Candidate submits an interview
// @route   POST /api/interviews/:id/submit
// @access  Candidate only
const submitInterview = async (req, res, next) => {
  try {
    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;
    const session = await InterviewSessionService.getActiveSession(req.params.id, req.user._id);

    if (session) {
      await InterviewSessionService.completeSession(session._id);
    }

    await interviewService.submitInterview(req.params.id, req.user.email);

    // Trigger AI evaluation (truly non-blocking — fire and forget)
    // Send the response FIRST so the frontend can navigate immediately.
    res.status(200).json({
      success: true,
      message: "Interview submitted successfully.",
      evaluationStatus: "PENDING",
    });

    // Run evaluation in the background AFTER response is sent
    if (session) {
      try {
        const InterviewSession = (await import("../models/InterviewSession.js")).default;
        const freshSession = await InterviewSession.findById(session._id);

        const interviewDoc = await interviewService.getInterviewById(
          req.params.id,
          "candidate",
          req.user.email,
          req.user._id
        );

        if (interviewDoc && freshSession && freshSession.questions?.length > 0) {
          // Do NOT await — let this run in the background
          InterviewSessionService.evaluateAndSaveResult(
            freshSession,
            interviewDoc
          ).then(evalResult => {
            console.log(`[Evaluation] Background evaluation ${evalResult.success ? "succeeded" : "failed"} for interview ${req.params.id}`);
          }).catch(err => {
            console.error(`[Evaluation] Background evaluation error for interview ${req.params.id}:`, err.message);
          });
        }
      } catch (bgErr) {
        console.error("[Evaluation] Could not start background evaluation:", bgErr.message);
      }
    }
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or you are not assigned.",
      });
    }
    if (error.message === "already_completed") {
      return res.status(409).json({
        success: false,
        message: "Interview already completed.",
      });
    }
    if (error.message === "not_started") {
      return res.status(403).json({
        success: false,
        message: "Interview must be started before submitting.",
      });
    }
    next(error);
  }
};

// @desc    Candidate gets interview questions (Legacy Static only)
// @route   GET /api/interviews/:id/questions
// @access  Candidate only
const getInterviewQuestions = async (req, res, next) => {
  try {
    const questions = await interviewService.getInterviewQuestions(req.params.id, req.user.email);
    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or you are not assigned.",
      });
    }
    if (error.message === "not_started") {
      return res.status(403).json({
        success: false,
        message: "You must start the interview before viewing questions.",
      });
    }
    next(error);
  }
};

// @desc    Employer gets interview result for a candidate
// @route   GET /api/interviews/:id/results/:resultId
// @access  Employer only
const getInterviewResult = async (req, res, next) => {
  try {
    const InterviewResultService = (await import("../services/InterviewResultService.js")).default;

    const resultDTO = await InterviewResultService.getCandidateResult(
      req.params.id,
      req.params.resultId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      result: resultDTO,
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or unauthorized",
      });
    }
    if (error.message === "candidate_not_found") {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }
    if (error.message === "result_not_found") {
      return res.status(404).json({
        success: false,
        message: "Evaluation result not found",
      });
    }
    next(error);
  }
};

// @desc    Candidate uploads a recording for a session
// @route   POST /api/interviews/:sessionId/recording
// @access  Candidate only
const uploadRecording = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No recording file provided." });
    }

    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;

    const result = await InterviewSessionService.uploadRecordingToCloudinary(
      req.params.sessionId,
      req.user._id,
      req.file
    );

    res.status(200).json({
      success: true,
      recording: result.recording,
      message: "Recording uploaded successfully.",
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }
    next(error);
  }
};
// @desc    Employer re-enrolls a candidate, deleting their current result and session
// @route   POST /api/interviews/:id/candidates/:candidateId/re-enroll
// @access  Employer only
const isValidObjectId = (id) => id && typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// Helper for re-enrolling a candidate cleanly
const performCandidateReEnrollment = async (interview, targetCandidateId, targetResultId) => {
  const InterviewSession = (await import("../models/InterviewSession.js")).default;
  const InterviewResult = (await import("../models/InterviewResult.js")).default;
  const CloudinaryService = (await import("../services/CloudinaryService.js")).default;
  const User = (await import("../../users/user.model.js")).default;

  let candidateEmail = null;
  let candidateUser = null;
  let candidateUserId = null;
  let resultDoc = null;
  const validResultId = isValidObjectId(targetResultId) ? targetResultId : null;
  const validCandidateId = isValidObjectId(targetCandidateId) ? targetCandidateId : null;

  // 1. If targetCandidateId is passed as an email address
  if (typeof targetCandidateId === "string" && targetCandidateId.includes("@")) {
    candidateEmail = targetCandidateId.toLowerCase().trim();
    candidateUser = await User.findOne({ email: candidateEmail }).catch(() => null);
    if (candidateUser) {
      candidateUserId = candidateUser._id.toString();
    }
  }

  // 2. Identify result document if validResultId is provided
  if (validResultId) {
    resultDoc = await InterviewResult.findById(validResultId).catch(() => null);
    if (resultDoc) {
      if (resultDoc.candidateId) {
        candidateUserId = resultDoc.candidateId.toString();
        candidateUser = await User.findById(resultDoc.candidateId).catch(() => null);
        if (candidateUser) {
          candidateEmail = candidateUser.email.toLowerCase().trim();
        }
      }
    }
  }

  // 3. If targetCandidateId is an ObjectId, check if it's a User ID or subdocument ID
  if (validCandidateId && !candidateUser) {
    candidateUser = await User.findById(validCandidateId).catch(() => null);
    if (candidateUser) {
      candidateUserId = candidateUser._id.toString();
      candidateEmail = candidateUser.email.toLowerCase().trim();
    } else {
      // Check subdocument ID in assignedCandidates
      const subdoc = interview.assignedCandidates.find(
        (c) => c._id?.toString() === validCandidateId.toString()
      );
      if (subdoc && subdoc.email) {
        candidateEmail = subdoc.email.toLowerCase().trim();
        if (subdoc.resultId) {
          targetResultId = targetResultId || subdoc.resultId.toString();
        }
        candidateUser = await User.findOne({ email: candidateEmail }).catch(() => null);
        if (candidateUser) {
          candidateUserId = candidateUser._id.toString();
        }
      }
    }
  }

  // 4. Search assignedCandidates in interview
  let candidateIndex = -1;

  if (candidateEmail) {
    candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email && c.email.toLowerCase().trim() === candidateEmail.toLowerCase().trim()
    );
  }

  if (candidateIndex === -1 && validResultId) {
    candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.resultId?.toString() === validResultId.toString()
    );
  }

  if (candidateIndex === -1 && validCandidateId) {
    candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c._id?.toString() === validCandidateId.toString()
    );
  }

  if (candidateIndex === -1 && interview.assignedCandidates.length === 1) {
    candidateIndex = 0;
  }

  // If candidate subdocument found, extract any missing references and check limit
  if (candidateIndex !== -1) {
    const targetCandidateObj = interview.assignedCandidates[candidateIndex];
    if (targetCandidateObj.reEnrollCount && targetCandidateObj.reEnrollCount >= 1) {
      const err = new Error("Candidate has already been re-enrolled once for this campaign. Maximum re-enrollment limit reached.");
      err.statusCode = 400;
      throw err;
    }

    if (targetCandidateObj.email) {
      candidateEmail = candidateEmail || targetCandidateObj.email.toLowerCase().trim();
    }
    if (targetCandidateObj.resultId) {
      targetResultId = targetResultId || targetCandidateObj.resultId.toString();
    }

    if (!candidateUserId && candidateEmail) {
      candidateUser = await User.findOne({ email: candidateEmail }).catch(() => null);
      if (candidateUser) {
        candidateUserId = candidateUser._id.toString();
      }
    }
  }

  // 5. Gather ALL associated session IDs and result IDs for thorough cleanup
  const sessionIdsToClean = new Set();
  const resultIdsToClean = new Set();

  if (resultDoc?._id) resultIdsToClean.add(resultDoc._id.toString());
  if (resultDoc?.sessionId) sessionIdsToClean.add(resultDoc.sessionId.toString());
  if (validResultId) resultIdsToClean.add(validResultId.toString());

  // Search InterviewResult records to find session IDs & purge
  const resultConditions = [];
  if (candidateUserId && isValidObjectId(candidateUserId)) {
    resultConditions.push({ candidateId: candidateUserId, interviewId: interview._id });
  }
  if (resultIdsToClean.size > 0) {
    resultConditions.push({ _id: { $in: Array.from(resultIdsToClean) } });
  }
  if (resultConditions.length > 0) {
    const foundResults = await InterviewResult.find({ $or: resultConditions }).catch(() => []);
    for (const res of foundResults) {
      resultIdsToClean.add(res._id.toString());
      if (res.sessionId) sessionIdsToClean.add(res.sessionId.toString());
    }
  }

  // Search InterviewSession records
  const sessionConditions = [];
  if (candidateUserId && isValidObjectId(candidateUserId)) {
    sessionConditions.push({ candidateId: candidateUserId, interviewId: interview._id });
  }
  if (sessionIdsToClean.size > 0) {
    sessionConditions.push({ _id: { $in: Array.from(sessionIdsToClean) } });
  }
  if (validResultId) {
    sessionConditions.push({ _id: validResultId });
  }

  // 6. Delete Cloudinary recordings & purge InterviewSessions
  if (sessionConditions.length > 0) {
    const sessions = await InterviewSession.find({ $or: sessionConditions }).catch(() => []);
    for (const session of sessions) {
      const rec = session.recording;
      if (rec && (rec.publicId || rec.url)) {
        try {
          await CloudinaryService.deleteRecording(rec.publicId || rec.url);
        } catch (err) {
          console.error("[Re-Enroll] Cloudinary deletion error:", err.message);
        }
      }
      await InterviewSession.deleteOne({ _id: session._id }).catch(() => null);
    }
  }

  // Also clean up any lingering sessions for this candidate & interview
  if (candidateUserId && isValidObjectId(candidateUserId)) {
    await InterviewSession.deleteMany({ interviewId: interview._id, candidateId: candidateUserId }).catch(() => null);
  }

  // 7. Invalidate Result caches & delete InterviewResult records
  for (const rId of resultIdsToClean) {
    await cacheService.invalidateCache(`interview:result:${rId}`).catch(() => null);
    await InterviewResult.deleteOne({ _id: rId }).catch(() => null);
  }
  if (candidateUserId && isValidObjectId(candidateUserId)) {
    await InterviewResult.deleteMany({ interviewId: interview._id, candidateId: candidateUserId }).catch(() => null);
  }

  // 8. Reset candidate subdocument status to "Pending" and clear dates / resultId
  if (candidateIndex !== -1) {
    interview.assignedCandidates[candidateIndex].status = "Pending";
    interview.assignedCandidates[candidateIndex].joinedAt = null;
    interview.assignedCandidates[candidateIndex].submittedAt = null;
    interview.assignedCandidates[candidateIndex].resultId = null;
    interview.assignedCandidates[candidateIndex].reEnrollCount = (interview.assignedCandidates[candidateIndex].reEnrollCount || 0) + 1;
    interview.markModified("assignedCandidates");
    await interview.save();
  }

  // 9. Comprehensive cache invalidation across all keys
  const emailLower = candidateEmail ? candidateEmail.toLowerCase().trim() : null;
  await Promise.all([
    cacheService.invalidateCache(`interview:id:${interview._id}`),
    cacheService.invalidateCache(`interview:code:${interview.interviewCode?.toUpperCase()}`),
    emailLower ? cacheService.invalidateCache(`candidate:assigned:${emailLower}`) : Promise.resolve(),
    cacheService.invalidateCachePattern("candidate:assigned:*"),
    interview.employer ? cacheService.invalidateCache(`employer:interviews:${interview.employer}`) : Promise.resolve(),
    cacheService.invalidateCachePattern("admin:campaigns:*"),
  ]).catch((err) => console.warn("[Re-Enroll] Cache invalidation warning:", err.message));

  return true;
};

// @desc    Employer re-enrolls a candidate, deleting their current result and session
// @route   POST /api/interviews/:id/candidates/:candidateId/re-enroll
// @access  Employer only
const reEnrollCandidate = async (req, res, next) => {
  try {
    const { id: interviewId, candidateId } = req.params;
    const employerId = req.user._id;

    const Interview = (await import("../models/interview.model.js")).default;
    const interview = await Interview.findOne({ _id: interviewId, employer: employerId });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or unauthorized" });
    }

    await performCandidateReEnrollment(interview, candidateId, null);

    res.status(200).json({
      success: true,
      message: "Candidate has been successfully re-enrolled.",
    });
  } catch (error) {
    if (error.statusCode === 400 || error.message?.includes("re-enrolled")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Employer re-enrolls a candidate using resultId/sessionId directly from the result error page
// @route   POST /api/interviews/:id/results/:resultId/re-enroll
// @access  Employer only
const reEnrollByResultId = async (req, res, next) => {
  try {
    const { id: interviewId, resultId } = req.params;
    const employerId = req.user._id;

    const Interview = (await import("../models/interview.model.js")).default;
    const interview = await Interview.findOne({ _id: interviewId, employer: employerId });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or unauthorized" });
    }

    await performCandidateReEnrollment(interview, null, resultId);

    res.status(200).json({
      success: true,
      message: "Candidate has been successfully re-enrolled.",
    });
  } catch (error) {
    if (error.statusCode === 400 || error.message?.includes("re-enrolled")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Record when AI finishes speaking a question
// @route   POST /api/interviews/:id/question-ended
// @access  Candidate only
const recordQuestionEnded = async (req, res, next) => {
  try {
    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;

    const session = await InterviewSessionService.getActiveSession(req.params.id, req.user._id);
    if (!session || session.status !== "ACTIVE") {
      return res.status(400).json({ success: false, message: "No active session found" });
    }

    const currentIndex = session.currentQuestionIndex;
    if (session.questions[currentIndex]) {
      session.questions[currentIndex].questionEndedAt = new Date();
      await session.save();
    }

    res.status(200).json({
      success: true,
      questionEndedAt: session.questions[currentIndex]?.questionEndedAt
    });
  } catch (error) {
    next(error);
  }
};

export {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAssignedInterviews,
  joinInterview,
  startInterview,
  submitInterview,
  getInterviewQuestions,
  getInterviewSession,
  submitAnswer,
  recordQuestionEnded,
  getInterviewResult,
  uploadRecording,
  reEnrollCandidate,
  reEnrollByResultId,
  handleJoinRequest
};
