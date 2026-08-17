import MockInterviewService from "../services/MockInterviewService.js";
import InterviewRepository from "../repositories/InterviewRepository.js";
import User from "../../users/user.model.js";
import Transaction from "../../payments/models/Transaction.js";
import { cacheService } from "../../../shared/services/cacheService.js";

/**
 * @desc    Create a candidate mock interview
 * @route   POST /api/mock-interviews
 * @access  Candidate only
 */
export const createMockInterview = async (req, res, next) => {
  try {
    const { jobRole } = req.body;
    if (!jobRole || !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job role is required for mock interview creation.",
      });
    }

    const duration = Math.max(1, parseInt(req.body.duration, 10) || 15);
    const requiredCredits = duration; // 1 Credit = 1 Minute

    // Fetch fresh user from DB
    const user = await User.findById(req.user._id);
    const availableCredits = user?.credits?.availableCredits ?? 15;

    if (availableCredits < requiredCredits) {
      return res.status(402).json({
        success: false,
        code: "INSUFFICIENT_CREDITS",
        message: `Insufficient credits. You have ${availableCredits} credits available, but a ${duration}-minute session requires ${requiredCredits} credits.`,
        availableCredits,
        requiredCredits,
      });
    }

    // Upfront Atomic Deduction
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          "credits.availableCredits": -requiredCredits,
          "credits.totalUsedCredits": requiredCredits,
        },
      },
      { new: true }
    );

    // Audit Log Transaction
    await Transaction.create({
      userId: req.user._id,
      type: "USAGE",
      credits: -requiredCredits,
      amount: 0,
      status: "paid",
      description: `Mock Interview: ${jobRole.trim()} (${duration} Mins)`,
    });

    const mockInterview = await MockInterviewService.createMockInterview(
      req.user._id,
      req.user.email,
      req.body
    );

    res.status(201).json({
      success: true,
      interview: mockInterview,
      remainingCredits: updatedUser.credits.availableCredits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate's mock interview evaluation history (paginated)
 * @route   GET /api/mock-interviews/history
 * @access  Candidate only
 */
export const getCandidateHistory = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const history = await MockInterviewService.getCandidateHistory(req.user._id, { page, limit });

    res.status(200).json({
      success: true,
      ...history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate incomplete / resumeable mock interviews
 * @route   GET /api/mock-interviews/resumeable
 * @access  Candidate only
 */
export const getResumeableMocks = async (req, res, next) => {
  try {
    const list = await MockInterviewService.getCandidateIncompleteMocks(req.user._id, req.user.email);
    res.status(200).json({
      success: true,
      resumeable: list,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate's detailed evaluation DTO by result ID
 * @route   GET /api/mock-interviews/evaluations/:resultId
 * @access  Candidate only
 */
export const getMockEvaluation = async (req, res, next) => {
  try {
    const resultDTO = await MockInterviewService.getMockEvaluation(
      req.params.resultId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      result: resultDTO,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Delete a candidate mock interview
 * @route   DELETE /api/mock-interviews/:id
 * @access  Candidate only
 */
export const deleteMockInterview = async (req, res, next) => {
  try {
    const mockDoc = await InterviewRepository.findById(req.params.id);
    MockInterviewService.validateCandidateOwnership(mockDoc, req.user._id);

    const MockInterview = (await import("../models/MockInterview.js")).default;
    await MockInterview.deleteOne({ _id: req.params.id, candidate: req.user._id });

    // Invalidate caches
    await Promise.all([
      InterviewRepository.invalidateInterview(req.params.id, mockDoc.interviewCode, null),
      cacheService.invalidateCachePattern("admin:mocks:*"),
    ]);

    res.status(200).json({
      success: true,
      message: "Mock interview deleted successfully.",
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};
