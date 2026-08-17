import { z } from "zod";
import { ValidationError } from "../errors/ValidationError.js";

// ── Score Schema ─────────────────────────────────────────────────────────────
// Reusable: a number between 0 and 10 (decimals allowed).

const ScoreSchema = z.coerce.number().min(0).max(10);

// ── Overall Scores Schema ────────────────────────────────────────────────────
// Maps directly to InterviewResult.scores

const EvaluationScoresSchema = z.object({
  overall: ScoreSchema,
  technical: ScoreSchema,
  communication: ScoreSchema,
  problemSolving: ScoreSchema,
  confidence: ScoreSchema,
  topicCoverage: ScoreSchema,
});

// ── Question-level Scores Schema ─────────────────────────────────────────────
// Maps directly to InterviewResult.questionEvaluations[].scores

const QuestionScoresSchema = z.object({
  technical: ScoreSchema,
  communication: ScoreSchema,
});

// ── Question Evaluation Schema ───────────────────────────────────────────────
// Maps directly to InterviewResult.questionEvaluations[]

const QuestionEvaluationSchema = z
  .object({
    questionId: z.union([z.string(), z.number()]),
    scores: QuestionScoresSchema.optional().default({ technical: 0, communication: 0 }),
    feedback: z.string().optional().default("No response provided."),
    keyTakeaways: z.array(z.string()).optional().default([]),
  })
  .strip(); // Remove unknown properties

// ── Recommendation Enum ──────────────────────────────────────────────────────
// Must match InterviewResult.recommendation enum exactly.

const RecommendationEnum = z.enum([
  "STRONG_HIRE",
  "HIRE",
  "BORDERLINE",
  "NEEDS_IMPROVEMENT",
  "REJECT",
  "NOT_EVALUATED",
]);

// ── Full Evaluation Response Schema ──────────────────────────────────────────
// Maps directly to the AI-generated fields of InterviewResult.
// Reference fields (interviewId, candidateId, sessionId) and aiMetadata
// are populated by the caller, not by the AI.

const EvaluationResponseSchema = z
  .object({
    scores: EvaluationScoresSchema.optional().default({
      overall: 0,
      technical: 0,
      communication: 0,
      problemSolving: 0,
      confidence: 0,
      topicCoverage: 0,
    }),
    recommendation: RecommendationEnum.optional().default("NOT_EVALUATED"),
    reasoning: z.string().optional().default("Unable to generate an evaluation due to insufficient interview responses."),
    strengths: z.array(z.string()).optional().default([]),
    weaknesses: z.array(z.string()).optional().default([]),
    questionEvaluations: z.array(QuestionEvaluationSchema).optional().default([]),
  })
  .strip(); // Remove unknown properties

/**
 * EvaluationResponseValidator
 *
 * Validates that a parsed JSON object matches the InterviewResult schema.
 * Uses Zod for strict structural validation.
 * Strips unknown fields to prevent unexpected data from reaching the DB.
 * Throws ValidationError on failure.
 *
 * Mirrors QuestionResponseValidator for architectural consistency.
 */
export class EvaluationResponseValidator {
  /**
   * Normalizes parsed data before schema validation to guard against
   * minor LLM formatting differences (e.g. recommendation case, score clamps).
   */
  static #normalize(data) {
    if (!data || typeof data !== "object") return {};

    const normalized = { ...data };

    // 1. Normalize recommendation
    if (typeof normalized.recommendation === "string") {
      let rec = normalized.recommendation.trim().toUpperCase().replace(/[\s-]+/g, "_");
      
      if (rec === "NO_HIRE" || rec === "STRONG_NO_HIRE" || rec === "NOT_RECOMMENDED") {
        rec = "REJECT";
      } else if (rec === "RECOMMENDED" || rec === "PASS") {
        rec = "HIRE";
      } else if (rec === "STRONG_PASS") {
        rec = "STRONG_HIRE";
      }

      if (["STRONG_HIRE", "HIRE", "BORDERLINE", "NEEDS_IMPROVEMENT", "REJECT", "NOT_EVALUATED"].includes(rec)) {
        normalized.recommendation = rec;
      } else {
        // Fallback based on overall score
        const overall = Number(normalized.scores?.overall) || 0;
        if (overall >= 8.5) normalized.recommendation = "STRONG_HIRE";
        else if (overall >= 7.0) normalized.recommendation = "HIRE";
        else if (overall >= 5.5) normalized.recommendation = "BORDERLINE";
        else if (overall >= 4.0) normalized.recommendation = "NEEDS_IMPROVEMENT";
        else normalized.recommendation = "REJECT";
      }
    }

    // 2. Clamp scores to 0-10
    if (normalized.scores && typeof normalized.scores === "object") {
      const clampedScores = {};
      for (const [key, val] of Object.entries(normalized.scores)) {
        const num = Number(val);
        clampedScores[key] = isNaN(num) ? 0 : Math.min(10, Math.max(0, Math.round(num * 10) / 10));
      }
      normalized.scores = clampedScores;
    }

    // 3. Normalize question evaluations
    if (Array.isArray(normalized.questionEvaluations)) {
      normalized.questionEvaluations = normalized.questionEvaluations.map((qe, idx) => {
        if (!qe || typeof qe !== "object") return { questionId: `q${idx + 1}` };
        const qScores = {};
        if (qe.scores && typeof qe.scores === "object") {
          for (const [k, v] of Object.entries(qe.scores)) {
            const n = Number(v);
            qScores[k] = isNaN(n) ? 0 : Math.min(10, Math.max(0, Math.round(n * 10) / 10));
          }
        }
        return {
          ...qe,
          questionId: qe.questionId !== undefined ? qe.questionId : `q${idx + 1}`,
          scores: {
            technical: qScores.technical ?? 0,
            communication: qScores.communication ?? 0,
          },
          feedback: typeof qe.feedback === "string" ? qe.feedback : "Evaluated answer.",
          keyTakeaways: Array.isArray(qe.keyTakeaways) ? qe.keyTakeaways.filter(t => typeof t === "string") : []
        };
      });
    }

    return normalized;
  }

  /**
   * Validates a parsed evaluation object against the schema.
   *
   * @param {Object} parsedData - The parsed JSON object from EvaluationResponseParser.
   * @returns {Object} A validated and cleaned evaluation object.
   * @throws {ValidationError} If the data does not match the schema.
   */
  static validate(parsedData) {
    try {
      const normalizedData = EvaluationResponseValidator.#normalize(parsedData);
      return EvaluationResponseSchema.parse(normalizedData);
    } catch (error) {
      console.error("[EvaluationValidator] Validation failed for data:", JSON.stringify(parsedData, null, 2));
      if (error instanceof z.ZodError) {
        console.error("[EvaluationValidator] Zod Errors:", JSON.stringify(error.issues || error.errors, null, 2));
        throw new ValidationError(
          "AI evaluation response failed schema validation.",
          error.issues || error.errors
        );
      }
      throw new ValidationError(
        `Unexpected validation error: ${error.message}`
      );
    }
  }
}
