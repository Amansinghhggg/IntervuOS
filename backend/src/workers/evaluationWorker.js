import { Worker } from 'bullmq';
import { redisClient, isRedisReady } from '../config/redis.js';
import { EVALUATION_QUEUE_NAME } from '../modules/interview/queues/evaluationQueue.js';
import InterviewSessionService from '../modules/interview/services/InterviewSessionService.js';
import InterviewSession from '../modules/interview/models/InterviewSession.js';
import InterviewRepository from '../modules/interview/repositories/InterviewRepository.js';

let evaluationWorker = null;

/**
 * Initializes the BullMQ Worker to process heavy Gemini/Groq evaluations in the background
 */
export const startEvaluationWorker = () => {
  if (evaluationWorker) return evaluationWorker;
  if (!isRedisReady()) {
    console.warn('⚠️ [BullMQ Worker] Redis is offline. Worker not started.');
    return null;
  }

  const concurrency = process.env.EVALUATION_CONCURRENCY ? Number(process.env.EVALUATION_CONCURRENCY) : 3;

  try {
    evaluationWorker = new Worker(
      EVALUATION_QUEUE_NAME,
      async (job) => {
        const { sessionId, interviewId, candidateId } = job.data;
        console.log(`\n⏳ [BullMQ Worker] Processing Evaluation Job #${job.id} for Session: ${sessionId}`);

        // Fetch session from database
        const session = await InterviewSession.findById(sessionId);
        if (!session) {
          console.warn(`⚠️ [BullMQ Worker] Session ${sessionId} not found in database (mock test mode). Processing acknowledged.`);
          return { success: true, isMockTest: true };
        }

        // Fetch interview from repository (searches both Interview and MockInterview collections)
        const targetInterviewId = interviewId || session.interviewId;
        const interviewDoc = await InterviewRepository.findById(targetInterviewId);

        if (!interviewDoc) {
          console.warn(`⚠️ [BullMQ Worker] Interview ${targetInterviewId} not found across collections (mock test mode). Processing acknowledged.`);
          return { success: true, isMockTest: true };
        }

        // Run post-interview evaluation pipeline
        const evalResult = await InterviewSessionService.evaluateAndSaveResult(session, interviewDoc);

        if (!evalResult.success) {
          throw new Error(evalResult.error || 'Evaluation pipeline failed');
        }

        console.log(`✅ [BullMQ Worker] Finished Evaluation Job #${job.id} for Session: ${sessionId} (Result ID: ${evalResult.result?._id})\n`);
        return { success: true, resultId: evalResult.result?._id };
      },
      {
        connection: redisClient,
        concurrency,
      }
    );

    evaluationWorker.on('completed', (job, returnvalue) => {
      console.log(`🎉 [BullMQ Worker] Job #${job.id} completed successfully!`, returnvalue);
    });

    evaluationWorker.on('failed', (job, err) => {
      console.error(`❌ [BullMQ Worker] Job #${job?.id} failed:`, err.message);
    });

    console.log(`⚡ [BullMQ Worker] Worker listening on queue '${EVALUATION_QUEUE_NAME}' with concurrency ${concurrency}`);
  } catch (err) {
    console.warn('⚠️ [BullMQ Worker] Failed to start worker:', err.message);
  }

  return evaluationWorker;
};
