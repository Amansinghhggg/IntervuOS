import { z } from "zod";

export const createInterviewSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  jobRole: z
    .string({ required_error: "Job role is required" })
    .trim()
    .min(2, "Job role must be at least 2 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  topics: z.array(z.string().trim()).optional(),
  experienceLevel: z.enum(["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]).default("Fresher"),
  duration: z.coerce
    .number({ required_error: "Duration is required" })
    .min(5, "Duration must be at least 5 minutes")
    .max(30, "Duration cannot exceed 30 minutes"),
  requireApproval: z.boolean().optional().default(true),

  instructions: z
    .string()
    .max(1000, "Instructions cannot exceed 1000 characters")
    .trim()
    .optional(),
  questionMode: z.enum(["AI_GENERATED", "EMPLOYER_PRESET", "HYBRID"]).default("AI_GENERATED"),
  customQuestions: z
    .array(
      z.object({
        question: z.string().min(1, "Question text is required").trim(),
        topic: z.string().optional().default("General"),
        concept: z.string().optional().default("Custom"),
        difficulty: z.enum(["Easy", "Medium", "Hard"]).optional().default("Medium"),
        expectedDuration: z.number().optional().default(120),
      })
    )
    .optional()
    .default([]),
  candidateEmails: z
    .array(z.string().email("Invalid email format"))
    .optional()
    .refine((emails) => (emails ? new Set(emails).size === emails.length : true), {
      message: "Duplicate candidate emails are not allowed",
    }),
});

export const updateInterviewSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim()
    .optional(),
  jobRole: z
    .string()
    .trim()
    .min(2, "Job role must be at least 2 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  topics: z.array(z.string().trim()).optional(),
  experienceLevel: z.enum(["Fresher", "1-2 Years", "3-5 Years", "5+ Years"]).optional(),
  duration: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .max(30, "Duration cannot exceed 30 minutes")
    .optional(),
  requireApproval: z.boolean().optional(),
  status: z.enum(["draft", "active", "completed", "archived"]).optional(),

  instructions: z
    .string()
    .max(1000, "Instructions cannot exceed 1000 characters")
    .trim()
    .optional(),
  questionMode: z.enum(["AI_GENERATED", "EMPLOYER_PRESET", "HYBRID"]).optional(),
  customQuestions: z
    .array(
      z.object({
        question: z.string().min(1, "Question text is required").trim(),
        topic: z.string().optional().default("General"),
        concept: z.string().optional().default("Custom"),
        difficulty: z.enum(["Easy", "Medium", "Hard"]).optional().default("Medium"),
        expectedDuration: z.number().optional().default(120),
      })
    )
    .optional(),
  candidateEmails: z
    .array(z.string().email("Invalid email format"))
    .refine((emails) => new Set(emails).size === emails.length, {
      message: "Duplicate candidate emails are not allowed",
    })
    .optional(),
  removeCandidateEmail: z.string().email().optional(),
  addCandidateEmail: z.string().email().optional(),
});

export const joinInterviewSchema = z.object({
  interviewCode: z
    .string({ required_error: "Interview code is required" })
    .trim()
    .min(1, "Interview code cannot be empty"),
});
