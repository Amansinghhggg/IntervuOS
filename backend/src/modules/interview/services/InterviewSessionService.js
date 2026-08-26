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
import { distributedLockService } from "../../../shared/services/distributedLock.service.js";

/**
 * InterviewSessionService
 * 
 * Responsible for the lifecycle, state persistence, and write-behind caching
 * of InterviewSession documents. Separates sub-millisecond RAM caching from
 * post-interview AI evaluation and durable database persistence.
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
   * Marks a session as ACTIVE, setting the timer, initializing questions, and caching to Redis.
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
        questions: [newQuestion]
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
   * Retrieves an active session by its sessionId, checking Redis RAM secondary index first.
   * 
   * @param {string} sessionId 
   */
  async getActiveSessionById(sessionId) {
    if (!sessionId) return null;

    // 1. Try fetching from Redis RAM index (<1ms)
    const cachedSession = await voiceSessionCache.getSessionById(sessionId);
    if (cachedSession) {
      return cachedSession;
    }

    // 2. Fallback to MongoDB
    const session = await InterviewSession.findById(sessionId);
    if (session) {
      voiceSessionCache.setSession(
        session.interviewId,
        session.candidateId,
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
    return new Date() >= new Date(session.expiresAt);
  }

  /**
   * Reconstructs the ConversationHistory object dynamically from the questions array.
   * 
   * @param {Object} session 
   * @returns {ConversationHistory}
   */
  buildConversationHistory(session) {
    const history = new ConversationHistory();
    const questions = session.questions || [];
    for (const q of questions) {
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
    const questions = session.questions || [];
    const rawCovered = questions.map(q => q.topic?.trim()).filter(Boolean);
    const coveredTopics = [...new Set(rawCovered)];

    // Robust case-insensitive topic remaining filter
    const coveredLower = new Set(rawCovered.map(t => t.toLowerCase()));
    const remainingTopics = config.topics.filter(t => !coveredLower.has(t.trim().toLowerCase()));
    const currentQuestion = questions.length + 1;

    // Advanced Context for AI Intelligence
    const topicDistribution = {};
    config.topics.forEach(t => topicDistribution[t] = 0);
    questions.forEach(q => {
      const match = config.topics.find(t => t.trim().toLowerCase() === q.topic?.trim()?.toLowerCase());
      if (match) {
        topicDistribution[match]++;
      } else if (q.topic) {
        topicDistribution[q.topic] = (topicDistribution[q.topic] || 0) + 1;
      }
    });

    const coveredConcepts = [...new Set(questions.map(q => q.concept).filter(Boolean))];
    const difficultyHistory = questions.map(q => q.difficulty);

    let remainingTime = 0;
    if (session.expiresAt) {
      remainingTime = Math.max(0, Math.floor((new Date(session.expiresAt) - new Date()) / 60000));
    }

    // We assume 10 questions max unless configured differently
    const maxQuestions = config.maxQuestions || 10;

    return new InterviewState({
      currentQuestion,
      coveredTopics,
      remainingTopics,
      remainingTime,
      interviewStartedAt: session.startedAt ? new Date(session.startedAt) : new Date(),
      maxQuestions,
      topicDistribution,
      coveredConcepts,
      difficultyHistory
    });
  }

  /**
   * Saves a candidate's answer for the current question and pushes the newly generated next question
   * using sub-millisecond Redis Write-Behind Session Caching.
   * 
   * @param {Object|string} sessionOrId 
   * @param {string} answerText 
   * @param {Object} [nextQuestion] 
   */
  async saveAnswerAndNextQuestion(sessionOrId, answerText, nextQuestion = null) {
    let sessionData = null;

    if (typeof sessionOrId === 'object' && sessionOrId !== null) {
      sessionData = sessionOrId.toObject ? sessionOrId.toObject() : { ...sessionOrId };
    } else {
      sessionData = await this.getActiveSessionById(sessionOrId);
      if (!sessionData) {
        const dbDoc = await InterviewSession.findById(sessionOrId);
        if (!dbDoc) throw new Error("Session not found");
        sessionData = dbDoc.toObject ? dbDoc.toObject() : dbDoc;
      }
    }

    if (!sessionData) throw new Error("Session not found");
    if (sessionData.status !== "ACTIVE") throw new Error("Session is not active");

    const currentIndex = Number(sessionData.currentQuestionIndex || 0);
    if (!Array.isArray(sessionData.questions)) {
      sessionData.questions = [];
    }

    // 1. Save the candidate answer on the current question
    if (sessionData.questions[currentIndex]) {
      sessionData.questions[currentIndex].answer = answerText;
      sessionData.questions[currentIndex].answeredAt = new Date();
    }

    // 2. Append the newly generated next question
    if (nextQuestion) {
      const newQuestion = {
        ...nextQuestion,
        id: sessionData.questions.length + 1,
        askedAt: new Date(),
        answer: null,
        answeredAt: null
      };
      sessionData.questions.push(newQuestion);
      sessionData.currentQuestionIndex = currentIndex + 1;
    }

    const sessionId = sessionData._id || sessionData.sessionId;

    // 3. Write immediately to Redis RAM (< 1ms write)
    const cachedInRedis = await voiceSessionCache.setSession(
      sessionData.interviewId,
      sessionData.candidateId,
      sessionData
    );

    if (cachedInRedis) {
      // 4. True Write-Behind: Dispatch non-blocking asynchronous persistence to MongoDB
      InterviewSession.findByIdAndUpdate(sessionId, {
        currentQuestionIndex: sessionData.currentQuestionIndex,
        questions: sessionData.questions,
        updatedAt: new Date(),
      }).catch((err) => {
        console.warn('⚠️ [InterviewSessionService] Non-blocking write-behind DB sync warning:', err.message);
      });

      return sessionData;
    }

    // 5. Fallback Mode (Redis Offline): Synchronous database write
    const updatedMongoSession = await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        currentQuestionIndex: sessionData.currentQuestionIndex,
        questions: sessionData.questions,
        updatedAt: new Date(),
      },
      { returnDocument: 'after' }
    );

    return updatedMongoSession ? (updatedMongoSession.toObject ? updatedMongoSession.toObject() : updatedMongoSession) : sessionData;
  }

  /**
   * Determines if the next question should be generated.
   * 
   * @param {Object} session 
   * @param {Object} interviewConfig 
   * @returns {boolean}
   */
  shouldGenerateNextQuestion(session, interviewConfig) {
    const questions = session.questions || [];
    return (
      !this.isSessionExpired(session) &&
      questions.length < (interviewConfig.maxQuestions || 10)
    );
  }

  /**
   * Handles the answer submission lifecycle with sub-millisecond RAM caching.
   * 
   * @param {Object} params
   * @param {Object} params.session
   * @param {string} params.answer
   * @param {Object} params.interviewConfig
   * @param {Object} params.interviewEngine
   */
  async submitAnswer({ session, answer, interviewConfig, interviewEngine }) {
    const sessionIdStr = String(session._id || session.sessionId);

    return await distributedLockService.withLock(
      sessionIdStr,
      async () => {
        // Fetch active session from RAM cache first (< 1ms)
        const freshSession = await this.getActiveSession(session.interviewId, session.candidateId);
        if (!freshSession || freshSession.status !== "ACTIVE") {
          throw new Error("No active session found.");
        }

        const currentIndex = Number(freshSession.currentQuestionIndex || 0);
        const currentQ = freshSession.questions?.[currentIndex];

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

        const updatedSession = await this.saveAnswerAndNextQuestion(freshSession, answer, nextQuestion);

        return {
          success: true,
          isFinished: !nextQuestion,
          nextQuestion,
          session: updatedSession
        };
      },
      { ttlMs: 15000, maxWaitMs: 8000, retryIntervalMs: 120 }
    );
  }

  /**
   * Marks the session as completed, flushes all in-memory/Redis conversation history
   * to MongoDB, and cleanly purges the RAM cache.
   * 
   * @param {string} sessionId 
   * @param {string} [interviewId]
   * @param {string} [candidateId]
   */
  async completeSession(sessionId, interviewId = null, candidateId = null) {
    let cachedSession = null;

    if (interviewId && candidateId) {
      cachedSession = await voiceSessionCache.getSession(interviewId, candidateId);
    } else if (sessionId) {
      cachedSession = await voiceSessionCache.getSessionById(sessionId);
    }

    if (cachedSession && Array.isArray(cachedSession.questions)) {
      // Flush full accumulated questions & answers from Redis RAM to MongoDB
      const updated = await InterviewSession.findByIdAndUpdate(
        sessionId,
        {
          status: "COMPLETED",
          questions: cachedSession.questions,
          currentQuestionIndex: cachedSession.currentQuestionIndex,
          completedAt: new Date(),
        },
        { returnDocument: 'after' }
      );

      await voiceSessionCache.clearSession(
        cachedSession.interviewId,
        cachedSession.candidateId,
        sessionId
      );

      return updated || cachedSession;
    }

    // Direct MongoDB completion if cache was empty or already flushed
    const updated = await InterviewSession.findByIdAndUpdate(
      sessionId,
      { status: "COMPLETED", completedAt: new Date() },
      { returnDocument: 'after' }
    );

    if (updated) {
      await voiceSessionCache.clearSession(updated.interviewId, updated.candidateId, sessionId);
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
    console.log(`  Session: ${session._id || session.sessionId}`);

    let interviewResult = null;

    try {
      const config = InterviewConfig.fromInterview(interviewDoc);
      const mode = config.mode || "EMPLOYER";
      const targetSessionId = session._id || session.sessionId;

      // 1. Check for existing result or initialize PENDING result
      interviewResult = await InterviewResult.findOne({
        interviewId: session.interviewId,
        candidateId: session.candidateId,
        sessionId: targetSessionId,
      });

      if (!interviewResult) {
        interviewResult = new InterviewResult({
          interviewId: session.interviewId,
          candidateId: session.candidateId,
          sessionId: targetSessionId,
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
        const sessionQ = (session.questions || []).find(
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
    let session = await InterviewSession.findOne({ _id: sessionId, candidateId });
    if (!session) {
      session = await InterviewSession.findOne({ interviewId: sessionId, candidateId }).sort({ createdAt: -1 });
    }
    if (!session) {
      session = await InterviewSession.findById(sessionId);
    }
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
