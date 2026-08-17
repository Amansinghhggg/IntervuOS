import InterviewSession from "../models/InterviewSession.js";
import InterviewResult from "../models/InterviewResult.js";
import Interview from "../models/interview.model.js";
import { ConversationHistory } from "./ConversationHistory.js";
import { InterviewState } from "./InterviewState.js";
import { EvaluationContext } from "../prompts/EvaluationContext.js";
import { InterviewConfig } from "./InterviewConfig.js";
import { createInterviewEngine } from "./interviewEngine.js";
import { AIConfig } from "../providers/AIProvider/config/ai.config.js";
import { voiceSessionCache } from "./voiceSessionCache.service.js";
import { cacheService } from "../../../shared/services/cacheService.js";

const sessionLocks = new Map();

/**
 * InterviewSessionService
 * 
 * Responsible exclusively for the database lifecycle of an InterviewSession.
 * This separates persistence from the AI orchestration in the InterviewEngine.
 */
class InterviewSessionService {
  /**
   * Retrieves an existing session or creates a new one if it doesn't exist.
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   * @returns {Promise<Object>} The Mongoose document
   */
  async getOrCreateSession(interviewId, candidateId) {
    let session = await InterviewSession.findOne({ interviewId, candidateId });

    if (!session) {
      session = new InterviewSession({
        interviewId,
        candidateId,
        status: "WAITING",
        startedAt: null,
      });
      await session.save();
    }

    return session;
  }

  /**
   * Marks a session as ACTIVE, setting the timer and pushing the first question.
   * 
   * @param {string} sessionId 
   * @param {Object} firstQuestion 
   * @param {number} durationMinutes 
   */
  async startSession(sessionId, firstQuestion, durationMinutes) {
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60000);

    // Format the question to match the schema
    const newQuestion = {
      ...firstQuestion,
      id: 1,
      askedAt: new Date(),
      answer: null,
      answeredAt: null
    };

    const updatedSession = await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        status: "ACTIVE",
        startedAt,
        expiresAt,
        currentQuestionIndex: 0,
        $push: { questions: newQuestion }
      },
      { returnDocument: 'after' }
    );

    if (updatedSession) {
      await voiceSessionCache.setSession(
        updatedSession.interviewId,
        updatedSession.candidateId,
        updatedSession.toObject ? updatedSession.toObject() : updatedSession
      );
    }

    return updatedSession;
  }

  /**
   * Retrieves the current session with sub-millisecond Redis caching.
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   */
  async getActiveSession(interviewId, candidateId) {
    // 1. Try fetching from Redis RAM (<1ms)
    const cachedSession = await voiceSessionCache.getSession(interviewId, candidateId);
    if (cachedSession) {
      return cachedSession;
    }

    // 2. Fallback to MongoDB on cache miss
    const session = await InterviewSession.findOne({ interviewId, candidateId });
    if (session) {
      // Seed Redis cache asynchronously for subsequent fast reads
      voiceSessionCache.setSession(
        interviewId,
        candidateId,
        session.toObject ? session.toObject() : session
      );
    }
    return session;
  }

  /**
   * Checks if a session has passed its expiration time.
   * 
   * @param {Object} session 
   * @returns {boolean}
   */
  isSessionExpired(session) {
    if (!session || !session.expiresAt) return false;
    return new Date() >= session.expiresAt;
  }

  /**
   * Reconstructs the ConversationHistory object dynamically from the questions array.
   * 
   * @param {Object} session 
   * @returns {ConversationHistory}
   */
  buildConversationHistory(session) {
    const history = new ConversationHistory();
    for (const q of session.questions) {
      history.addAIQuestion(q.question, q.topic, q.concept, q.difficulty);
      if (q.answer) {
        history.addCandidateAnswer(q.answer);
      }
    }
    return history;
  }

  /**
   * Reconstructs the InterviewState dynamically.
   * 
   * @param {Object} session 
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @returns {InterviewState}
   */
  buildInterviewState(session, config) {
    const rawCovered = session.questions.map(q => q.topic?.trim()).filter(Boolean);
    const coveredTopics = [...new Set(rawCovered)];

    // Robust case-insensitive topic remaining filter
    const coveredLower = new Set(rawCovered.map(t => t.toLowerCase()));
    const remainingTopics = config.topics.filter(t => !coveredLower.has(t.trim().toLowerCase()));
    const currentQuestion = session.questions.length + 1;

    // Advanced Context for AI Intelligence
    const topicDistribution = {};
    config.topics.forEach(t => topicDistribution[t] = 0);
    session.questions.forEach(q => {
      const match = config.topics.find(t => t.trim().toLowerCase() === q.topic?.trim()?.toLowerCase());
      if (match) {
        topicDistribution[match]++;
      } else if (q.topic) {
        topicDistribution[q.topic] = (topicDistribution[q.topic] || 0) + 1;
      }
    });

    const coveredConcepts = [...new Set(session.questions.map(q => q.concept).filter(Boolean))];
    const difficultyHistory = session.questions.map(q => q.difficulty);

    let remainingTime = 0;
    if (session.expiresAt) {
      remainingTime = Math.max(0, Math.floor((session.expiresAt - new Date()) / 60000));
    }

    // We assume 10 questions max unless configured differently
    const maxQuestions = config.maxQuestions || 10;

    return new InterviewState({
      currentQuestion,
      coveredTopics,
      remainingTopics,
      remainingTime,
      interviewStartedAt: session.startedAt || new Date(),
      maxQuestions,
      topicDistribution,
      coveredConcepts,
      difficultyHistory
    });
  }

  /**
   * Saves a candidate's answer for the current question and pushes the newly generated next question.
   * 
   * @param {string} sessionId 
   * @param {string} answerText 
   * @param {Object} nextQuestion 
   */
  async saveAnswerAndNextQuestion(sessionId, answerText, nextQuestion) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.status !== "ACTIVE") throw new Error("Session is not active");

    const currentIndex = session.currentQuestionIndex;

    // 1. Save the answer on the current question
    if (session.questions[currentIndex]) {
      session.questions[currentIndex].answer = answerText;
      session.questions[currentIndex].answeredAt = new Date();
    }

    // 2. Append the next question
    if (nextQuestion) {
      const newQuestion = {
        ...nextQuestion,
        id: session.questions.length + 1,
        askedAt: new Date(),
        answer: null,
        answeredAt: null
      };
      session.questions.push(newQuestion);
      session.currentQuestionIndex = currentIndex + 1;
    }

    await session.save();
    console.log("InterviewSession\n→ Question Saved\n");

    // Sync to Redis RAM asynchronously
    voiceSessionCache.setSession(
      session.interviewId,
      session.candidateId,
      session.toObject ? session.toObject() : session
    );

    return session;
  }

  /**
   * Determines if the next question should be generated.
   * 
   * @param {Object} session 
   * @param {Object} interviewConfig 
   * @returns {boolean}
   */
  shouldGenerateNextQuestion(session, interviewConfig) {
    return (
      !this.isSessionExpired(session) &&
      session.questions.length < (interviewConfig.maxQuestions || 10)
    );
  }

  /**
   * Handles the answer submission lifecycle.
   * 
   * @param {Object} params
   * @param {Object} params.session
   * @param {string} params.answer
   * @param {Object} params.interviewConfig
   * @param {Object} params.interviewEngine
   */
  async submitAnswer({ session, answer, interviewConfig, interviewEngine }) {
    const sessionIdStr = session._id.toString();

    // 1. If an answer submission for this session is already in-flight, wait for it
    if (sessionLocks.has(sessionIdStr)) {
      console.log(`[InterviewSessionService] Submission already in flight for session ${sessionIdStr}, waiting...`);
      try {
        await sessionLocks.get(sessionIdStr);
      } catch (err) {
        // Ignore error from locked promise
      }
      const freshSession = await this.getActiveSession(session.interviewId, session.candidateId);
      if (freshSession) {
        const currentQIndex = freshSession.currentQuestionIndex;
        const nextQ = freshSession.questions[currentQIndex];
        const isFinished = freshSession.status === "COMPLETED" || (!nextQ && currentQIndex >= freshSession.questions.length - 1);
        return {
          success: true,
          isFinished,
          nextQuestion: nextQ || null,
          session: freshSession
        };
      }
    }

    // 2. Acquire in-flight lock
    let resolveLock;
    const lockPromise = new Promise((resolve) => { resolveLock = resolve; });
    sessionLocks.set(sessionIdStr, lockPromise);

    try {
      // Re-fetch fresh session from DB to ensure accurate state
      const freshSession = await InterviewSession.findById(session._id);
      if (!freshSession || freshSession.status !== "ACTIVE") {
        throw new Error("No active session found.");
      }

      const currentIndex = freshSession.currentQuestionIndex;
      const currentQ = freshSession.questions[currentIndex];

      // Idempotency check: If current question already has an answer saved,
      // a previous attempt succeeded! Do NOT re-generate or overwrite.
      if (currentQ && currentQ.answer !== null && currentQ.answer !== undefined) {
        const nextQ = freshSession.questions[currentIndex + 1];
        console.log(`[InterviewSessionService] Question ${currentIndex + 1} already answered. Returning existing next question.`);
        return {
          success: true,
          isFinished: !nextQ,
          nextQuestion: nextQ || null,
          session: freshSession
        };
      }

      const history = this.buildConversationHistory(freshSession);
      const state = this.buildInterviewState(freshSession, interviewConfig);

      // We add the incoming answer manually for this turn because it hasn't been saved yet
      history.addCandidateAnswer(answer);

      let nextQuestion = null;

      if (this.shouldGenerateNextQuestion(freshSession, interviewConfig)) {
        const generated = await interviewEngine.generateNextQuestion(interviewConfig, state, history);
        nextQuestion = generated[0] || null;
      }

      const updatedSession = await this.saveAnswerAndNextQuestion(freshSession._id, answer, nextQuestion);

      return {
        success: true,
        isFinished: !nextQuestion,
        nextQuestion,
        session: updatedSession
      };
    } finally {
      sessionLocks.delete(sessionIdStr);
      if (resolveLock) resolveLock();
    }
  }

  /**
   * Marks the session as completed and clears RAM cache.
   * @param {string} sessionId 
   */
  async completeSession(sessionId) {
    const updated = await InterviewSession.findByIdAndUpdate(
      sessionId,
      { status: "COMPLETED" },
      { returnDocument: 'after' }
    );
    if (updated) {
      await voiceSessionCache.clearSession(updated.interviewId, updated.candidateId);
    }
    return updated;
  }

  /**
   * Delegates post-interview evaluation to Redis BullMQ queue (< 5ms API response).
   * Falls back to direct synchronous execution if Redis is offline.
   * 
   * @param {Object} session 
   * @param {Object} interviewDoc 
   */
  async queueOrRunEvaluation(session, interviewDoc) {
    try {
      const { enqueueEvaluation } = await import('../queues/evaluationQueue.js');
      const queueResult = await enqueueEvaluation(session, interviewDoc);

      if (queueResult.enqueued) {
        return {
          enqueued: true,
          jobId: queueResult.jobId,
          message: 'Evaluation job enqueued successfully to BullMQ queue',
        };
      }
    } catch (err) {
      console.warn('⚠️ [InterviewSessionService] Queue delegation failed, falling back to direct execution:', err.message);
    }

    // Fallback: Run directly if Redis is offline or queue unavailable
    const directResult = await this.evaluateAndSaveResult(session, interviewDoc);
    return { enqueued: false, result: directResult };
  }

  /**
   * Evaluates a completed interview and updates the result in MongoDB.
   * @param {Object} session - The completed InterviewSession document.
   * @param {Object} interviewDoc - The Interview document.
   * @returns {Promise<{ success: boolean, result?: Object, error?: string }>}
   */
  async evaluateAndSaveResult(session, interviewDoc) {
    const startTime = Date.now();
    console.log("\n[Evaluation] Starting post-interview evaluation");
    console.log(`  Interview: ${session.interviewId}`);
    console.log(`  Session: ${session._id}`);

    let interviewResult = null;

    try {
      const config = InterviewConfig.fromInterview(interviewDoc);
      const mode = config.mode || "EMPLOYER";

      // 1. Check for existing result or initialize PENDING result
      interviewResult = await InterviewResult.findOne({
        interviewId: session.interviewId,
        candidateId: session.candidateId,
        sessionId: session._id,
      });

      if (!interviewResult) {
        interviewResult = new InterviewResult({
          interviewId: session.interviewId,
          candidateId: session.candidateId,
          sessionId: session._id,
          status: "PENDING",
          mode,
          interviewSnapshot: {
            title: config.companyName || interviewDoc.title,
            jobRole: config.jobRole,
            topics: config.topics,
            experienceLevel: config.experienceLevel,
            duration: config.duration,
            instructions: config.instructions,
            mode,
          },
          scores: {},
          recommendation: "NOT_EVALUATED",
          reasoning: "Unable to generate an evaluation due to insufficient interview responses.",
          strengths: [],
          weaknesses: [],
          questionEvaluations: [],
          aiMetadata: {
            provider: interviewDoc.interviewType || process.env.QUESTION_PROVIDER || "gemini",
            model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
            latencyMs: 0,
          }
        });
        await interviewResult.save();
      }

      // Link Result ID using InterviewRepository abstraction
      const candidateUser = await (await import("../../users/user.model.js")).default.findById(session.candidateId);
      if (candidateUser) {
        const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
        await InterviewRepository.updateCandidateStatus(session.interviewId, candidateUser.email, "Completed", interviewResult._id);
      }

      // 2. Set PROCESSING state
      interviewResult.status = "PROCESSING";
      await interviewResult.save();

      // 3. Build the EvaluationContext and evaluate
      const evaluationContext = EvaluationContext.fromSessionAndConfig(config, session);

      const engine = createInterviewEngine(
        interviewDoc.interviewType || process.env.QUESTION_PROVIDER || "gemini"
      );
      const evaluationResult = await engine.evaluateInterview(evaluationContext);

      const latencyMs = Date.now() - startTime;

      // 4. Update to COMPLETED state and map question text
      interviewResult.status = "COMPLETED";
      interviewResult.scores = evaluationResult.scores || {};
      interviewResult.recommendation = evaluationResult.recommendation || "NOT_EVALUATED";
      interviewResult.reasoning = evaluationResult.reasoning || "Unable to generate an evaluation due to insufficient interview responses.";
      interviewResult.strengths = evaluationResult.strengths || [];
      interviewResult.weaknesses = evaluationResult.weaknesses || [];

      // Map question, answer, topic, and difficulty from session.questions
      interviewResult.questionEvaluations = (evaluationResult.questionEvaluations || []).map(qe => {
        const sessionQ = session.questions.find(
          q => q.id === qe.questionId || q.id === parseInt(qe.questionId, 10)
        );
        return {
          ...qe,
          question: sessionQ ? sessionQ.question : "Unknown Question",
          answer: sessionQ ? sessionQ.answer : null,
          topic: sessionQ ? sessionQ.topic : "Unknown",
          difficulty: sessionQ ? sessionQ.difficulty : "Medium"
        };
      });

      interviewResult.aiMetadata.latencyMs = latencyMs;
      interviewResult.aiMetadata.evaluatedAt = new Date();
      await interviewResult.save();

      // Invalidate result cache so fresh evaluation is immediately visible
      await cacheService.invalidateCache(`interview:result:${interviewResult._id}`).catch(() => null);

      console.log(`[Evaluation] InterviewResult completed: ${interviewResult._id}`);
      return { success: true, result: interviewResult };

    } catch (error) {
      console.error("[Evaluation] AI evaluation failed — initiating graceful fallback evaluation");
      console.error(`  Error: ${error.name}: ${error.message}`);

      if (interviewResult) {
        try {
          // Graceful Rule-based Fallback: Generate valid evaluation from transcript
          const totalQ = session.questions?.length || 0;
          const answeredQ = session.questions?.filter(q => q.answer && q.answer.trim().length > 0) || [];
          const answeredCount = answeredQ.length;
          const completionRatio = totalQ > 0 ? answeredCount / totalQ : 0;

          // Estimate scores based on answered ratio & answer depth
          const avgWordCount = answeredCount > 0 
            ? answeredQ.reduce((acc, q) => acc + (q.answer?.split(/\s+/).length || 0), 0) / answeredCount 
            : 0;

          let baseScore = 0;
          if (answeredCount > 0) {
            baseScore = Math.min(8.0, Math.max(3.0, (completionRatio * 5.0) + Math.min(3.0, avgWordCount / 15)));
          }

          const roundedScore = Math.round(baseScore * 10) / 10;
          let rec = "NOT_EVALUATED";
          if (answeredCount === 0) rec = "REJECT";
          else if (roundedScore >= 7.5) rec = "HIRE";
          else if (roundedScore >= 5.0) rec = "BORDERLINE";
          else if (roundedScore >= 3.5) rec = "NEEDS_IMPROVEMENT";
          else rec = "REJECT";

          interviewResult.status = "COMPLETED";
          interviewResult.scores = {
            overall: roundedScore,
            technical: roundedScore,
            communication: roundedScore,
            problemSolving: roundedScore,
            confidence: roundedScore,
            topicCoverage: Math.round(completionRatio * 100) / 10
          };
          interviewResult.recommendation = rec;
          interviewResult.reasoning = answeredCount > 0
            ? `Candidate completed ${answeredCount} of ${totalQ} questions. Responses were captured and indexed successfully.`
            : "No answers were provided during this session.";
          interviewResult.strengths = answeredCount > 0 
            ? ["Completed interview session", "Answers recorded across assigned topics"] 
            : [];
          interviewResult.weaknesses = answeredCount < totalQ 
            ? ["Some interview questions were left unanswered"] 
            : [];

          interviewResult.questionEvaluations = (session.questions || []).map((q, idx) => ({
            questionId: q.id !== undefined ? q.id : idx + 1,
            question: q.question || "Interview Question",
            answer: q.answer || null,
            topic: q.topic || "General",
            difficulty: q.difficulty || "Medium",
            scores: {
              technical: q.answer?.trim() ? roundedScore : 0,
              communication: q.answer?.trim() ? roundedScore : 0
            },
            feedback: q.answer?.trim() ? "Response recorded." : "No answer provided.",
            keyTakeaways: q.answer?.trim() ? ["Answer captured"] : []
          }));

          interviewResult.aiMetadata = {
            provider: "fallback-evaluator",
            model: "deterministic-heuristic",
            evaluatedAt: new Date(),
            latencyMs: Date.now() - startTime
          };

          await interviewResult.save();
          await cacheService.invalidateCache(`interview:result:${interviewResult._id}`).catch(() => null);

          console.log(`[Evaluation] Fallback evaluation saved for result: ${interviewResult._id}`);
          return { success: true, result: interviewResult, fallback: true };

        } catch (fallbackError) {
          console.error("[Evaluation] Fallback save failed:", fallbackError);
          interviewResult.status = "FAILED";
          interviewResult.recommendation = "NOT_EVALUATED";
          interviewResult.reasoning = "Unable to generate an evaluation due to insufficient interview responses.";
          await interviewResult.save().catch(() => null);
        }
      }

      return {
        success: false,
        error: `${error.name}: ${error.message}`,
      };
    }
  }

  /**
   * Uploads the recording using InterviewRecordingService abstraction.
   * @param {string} sessionId 
   * @param {string} candidateId 
   * @param {Object} file - multer file object
   * @returns {Promise<Object>} Updated session
   */
  async uploadRecordingToCloudinary(sessionId, candidateId, file) {
    const session = await InterviewSession.findOne({ _id: sessionId, candidateId });
    if (!session) {
      throw new Error("not_found");
    }

    if (session.recording?.status === "READY" || session.recording?.status === "SKIPPED") {
      return session;
    }

    try {
      const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
      const InterviewRecordingService = (await import("./InterviewRecordingService.js")).default;

      const interviewDoc = await InterviewRepository.findById(session.interviewId);
      const config = InterviewConfig.fromInterview(interviewDoc);

      const recordingResponse = await InterviewRecordingService.processRecording(file, config.mode);

      if (recordingResponse.status === "SKIPPED") {
        session.recording = {
          provider: "none",
          status: "SKIPPED",
          uploadedAt: new Date()
        };
        await session.save();
        return session;
      }

      session.recording = {
        url: recordingResponse.recording.url,
        publicId: recordingResponse.recording.publicId,
        provider: "cloudinary",
        mimeType: file?.mimetype || "video/webm",
        size: file?.size || 0,
        duration: recordingResponse.recording.duration || 0,
        status: "READY",
        originalFilename: file?.originalname || "recording.webm",
        uploadedAt: new Date()
      };

      await session.save();
      return session;
    } catch (error) {
      console.error("[UploadPipeline] Recording upload failed:", error);

      session.recording = {
        ...(session.recording || {}),
        status: "FAILED",
        uploadedAt: new Date()
      };
      await session.save();

      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

export default new InterviewSessionService();
