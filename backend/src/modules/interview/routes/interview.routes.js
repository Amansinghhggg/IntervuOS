import express from "express";
import multer from "multer";
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAssignedInterviews,
  joinInterview,
  handleJoinRequest,
  startInterview,
  submitInterview,
  getInterviewQuestions,
  getInterviewSession,
  submitAnswer,
  recordQuestionEnded,
  getInterviewResult,
  uploadRecording,
  reEnrollCandidate,
  reEnrollByResultId
} from "../controllers/interview.controller.js";
import { protect, authorize, requireVerifiedEmployer } from "../../auth/auth.middleware.js";
import { getCandidateResume, downloadCandidateResume } from "../../users/profile.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

// Employer Routes
router
  .route("/")
  .post(authorize("employer"), requireVerifiedEmployer, createInterview)
  .get(authorize("employer"), getInterviews);

router.get("/:id/results/:resultId", authorize("employer"), getInterviewResult);
router.post("/:id/results/:resultId/re-enroll", authorize("employer"), reEnrollByResultId);
router.post("/:id/candidates/:candidateId/re-enroll", authorize("employer"), reEnrollCandidate);

// Employer Resume endpoints
router.get("/:interviewId/candidates/:candidateId/resume", protect, getCandidateResume);
router.get("/:interviewId/candidates/:candidateId/resume/download", protect, downloadCandidateResume);

// Employer Request endpoint
router.patch("/:id/requests", authorize("employer"), handleJoinRequest);

// Candidate Routes
router.get("/candidate/assigned", authorize("candidate"), getAssignedInterviews);
router.post("/join", authorize("candidate"), joinInterview);
router.post("/:id/start", authorize("candidate"), startInterview);
router.get("/:id/session", authorize("candidate"), getInterviewSession);
router.post("/:id/answer", authorize("candidate"), submitAnswer);
router.post("/:id/question-ended", authorize("candidate"), recordQuestionEnded);
router.post("/:id/submit", authorize("candidate"), submitInterview);
router.get("/:id/questions", authorize("candidate"), getInterviewQuestions);

router.post("/:sessionId/recording", authorize("candidate"), upload.single("recording"), uploadRecording);

router
  .route("/:id")
  .get(authorize("employer", "candidate"), getInterviewById)
  .patch(authorize("employer"), updateInterview)
  .delete(authorize("employer"), deleteInterview);

export default router;
