import mongoose from "mongoose";

/**
 * Base Interview Candidate Schema
 * Tracks candidate assignment state across interview modes.
 */
export const candidateSubSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "In-Progress", "Completed", "Expired", "Cancelled", "Requested", "Rejected"],
    default: "Pending",
  },
  joinedAt: {
    type: Date,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
  resultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewResult",
    default: null,
  },
  reEnrollCount: {
    type: Number,
    default: 0,
  },
  reEnrolledAt: {
    type: Date,
    default: null,
  },
  reEnrollReason: {
    type: String,
    default: null,
  },
  reEnrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
}, { _id: false });

/**
 * Interview Configuration Sub-Schema
 * Groups role, experience, duration, topics, and custom focus instructions.
 */
export const interviewConfigurationSchema = new mongoose.Schema({
  jobRole: {
    type: String,
    required: [true, "Job role is required"],
    trim: true,
  },
  topics: [{
    type: String,
    trim: true,
  }],
  experienceLevel: {
    type: String,
    enum: ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"],
    default: "1-2 Years",
  },
  duration: {
    type: Number,
    required: [true, "Duration is required"],
    min: [5, "Duration must be at least 5 minutes"],
    max: [30, "Duration cannot exceed 30 minutes"],
    default: 15,
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, "Instructions cannot exceed 1000 characters"],
    default: "",
  },
  difficulty: {
    type: String,
    default: "Medium",
  },
}, { _id: false });

/**
 * Base Interview Definition Helper
 * Shared field definitions between Employer and Candidate Mock interviews.
 */
export const baseInterviewFields = {
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  interviewCode: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["CREATED", "IN_PROGRESS", "COMPLETED", "EXPIRED", "CANCELLED", "draft", "active", "completed", "archived"],
    default: "CREATED",
  },
  mode: {
    type: String,
    enum: ["EMPLOYER", "MOCK"],
    required: true,
  },
  interviewType: {
    type: String,
    enum: ["static", "gemini", "groq"],
    default: "gemini",
  },
  requireApproval: {
    type: Boolean,
    default: true,
  },
  assignedCandidates: [candidateSubSchema],
};
