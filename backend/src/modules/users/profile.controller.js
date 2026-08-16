import User from "./user.model.js";
import Interview from "../interview/models/interview.model.js";
import StorageService from "../../shared/services/StorageService.js";
import { cacheService } from "../../shared/services/cacheService.js";

// @desc    Upload or replace the authenticated candidate's resume
// @route   POST /api/profile/resume
const replaceResume = async (req, res, next) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ success: false, message: "Only candidates can upload resumes." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required." });
    }

    if (req.file.mimetype !== "application/pdf" || !StorageService.validateResume(req.file.buffer)) {
      return res.status(400).json({ success: false, message: "Only valid PDF files are supported." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Keep old publicId for later deletion
    const oldPublicId = user.resume?.publicId;

    // Upload new resume
    const result = await StorageService.uploadResume(req.file.buffer, {
      folder: `ForkTalent/resumes/${user._id}`,
    });

    user.resume = {
      publicId: result.public_id,
      url: result.secure_url,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    await user.save();
    console.log(`[Resume] User ${user._id} successfully replaced resume. New ID: ${result.public_id}`);

    // Invalidate Redis caches
    await Promise.all([
      cacheService.invalidateCache(`user:resume:${user._id}`),
      cacheService.invalidateCachePattern("admin:users:*"),
    ]);

    // Delete old resume asynchronously (Fire-and-forget)
    if (oldPublicId) {
      StorageService.deleteResume(oldPublicId).catch((err) => {
        console.error(`[Resume] Failed to clean up old resume ${oldPublicId} for user ${user._id}:`, err);
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume updated successfully.",
      data: user.resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the authenticated candidate's resume metadata
// @route   GET /api/profile/resume
const getMyResume = async (req, res, next) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ success: false, message: "Only candidates have resumes." });
    }

    const resumeData = await cacheService.getOrSetCache(`user:resume:${req.user._id}`, 300, async () => {
      const user = await User.findById(req.user._id).select("resume").lean();
      return user?.resume || null;
    });

    res.status(200).json({
      success: true,
      message: "Resume fetched successfully.",
      data: resumeData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download candidate's own resume
// @route   GET /api/profile/resume/download
const downloadMyResume = async (req, res, next) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ success: false, message: "Only candidates have resumes." });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.resume || !user.resume.url) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    res.setHeader("Content-Disposition", `inline; filename="${user.resume.fileName || 'resume.pdf'}"`);
    res.setHeader("Content-Type", "application/pdf");

    await StorageService.generateDownloadStream(user.resume.url, res);
    console.log(`[Resume] User ${user._id} downloaded their resume.`);
  } catch (error) {
    console.error(`[Resume] Download error for user ${req.user._id}:`, error);
    res.status(500).json({ success: false, message: "Failed to download resume stream." });
  }
};

// @desc    Return a specific candidate's resume metadata (Employers only)
// @route   GET /api/interviews/:interviewId/candidates/:candidateId/resume
const getCandidateResume = async (req, res, next) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Only employers can access candidate resumes." });
    }

    const { interviewId, candidateId } = req.params;
    const candidate = await User.findById(candidateId);

    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    // Strict Authorization: Verify employer owns this specific interview and candidate belongs to it
    const hasAccess = await Interview.exists({
      _id: interviewId,
      employer: req.user._id,
      "assignedCandidates.email": candidate.email,
    });

    if (!hasAccess) {
      console.warn(`[Resume] Unauthorized access attempt by employer ${req.user._id} for candidate ${candidateId}`);
      return res.status(403).json({ success: false, message: "Unauthorized to view this candidate's resume." });
    }

    const resumeData = await cacheService.getOrSetCache(`user:resume:${candidateId}`, 300, async () => {
      return candidate.resume || null;
    });

    res.status(200).json({
      success: true,
      message: "Candidate resume fetched successfully.",
      data: resumeData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a specific candidate's resume (Employers only)
// @route   GET /api/interviews/:interviewId/candidates/:candidateId/resume/download
const downloadCandidateResume = async (req, res, next) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Only employers can access candidate resumes." });
    }

    const { interviewId, candidateId } = req.params;
    const candidate = await User.findById(candidateId);

    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    if (!candidate.resume || !candidate.resume.url) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    // Strict Authorization: Verify employer owns this specific interview and candidate belongs to it
    const hasAccess = await Interview.exists({
      _id: interviewId,
      employer: req.user._id,
      "assignedCandidates.email": candidate.email,
    });

    if (!hasAccess) {
      console.warn(`[Resume] Unauthorized download attempt by employer ${req.user._id} for candidate ${candidateId}`);
      return res.status(403).json({ success: false, message: "Unauthorized to download this candidate's resume." });
    }

    res.setHeader("Content-Disposition", `inline; filename="${candidate.resume.fileName || 'resume.pdf'}"`);
    res.setHeader("Content-Type", "application/pdf");

    await StorageService.generateDownloadStream(candidate.resume.url, res);
    console.log(`[Resume] Employer ${req.user._id} downloaded resume of candidate ${candidateId}.`);
  } catch (error) {
    console.error(`[Resume] Download error for employer ${req.user._id}, candidate ${req.params.candidateId}:`, error);
    res.status(500).json({ success: false, message: "Failed to download resume stream." });
  }
};

export { replaceResume, getMyResume, downloadMyResume, getCandidateResume, downloadCandidateResume };
