import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Requested", "Rejected"],
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
}, { _id: false });

const interviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    jobRole: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"],
      default: "Fresher",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [120, "Duration cannot exceed 120 minutes"],
    },

    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, "Instructions cannot exceed 1000 characters"],
    },
    interviewCode: {
      type: String,
      required: true,
      unique: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedCandidates: [candidateSchema],
    status: {
      type: String,
      enum: ["draft", "active", "completed", "archived"],
      default: "active",
    },
    interviewType: {
      type: String,
      enum: ["static", "gemini", "groq"],
      default: "gemini",
    },
    mode: {
      type: String,
      enum: ["REGULAR", "MOCK"],
      default: "REGULAR",
    },
    questionMode: {
      type: String,
      enum: ["AI_GENERATED", "EMPLOYER_PRESET", "HYBRID"],
      default: "AI_GENERATED",
    },
    customQuestions: [
      {
        question: { type: String, required: true, trim: true },
        topic: { type: String, default: "General", trim: true },
        concept: { type: String, default: "Custom", trim: true },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
        expectedDuration: { type: Number, default: 120 }
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    requireApproval: {
      type: Boolean,
      default: true,
    },
    maxCandidates: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
interviewSchema.index({ employer: 1, status: 1 });
interviewSchema.index({ "assignedCandidates.email": 1 });
interviewSchema.index({ "assignedCandidates.email": 1, isVerified: 1 });

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
