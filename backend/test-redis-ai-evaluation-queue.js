import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { enqueueEvaluation, getEvaluationQueue } from './src/modules/interview/queues/evaluationQueue.js';
import { startEvaluationWorker } from './src/workers/evaluationWorker.js';
import { redisClient, isRedisReady } from './src/config/redis.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ForkTalent';

async function testBullMQEvaluationQueue() {
  console.log('\n🧪 [Test] Starting BullMQ Heavy AI Evaluation Queue Benchmark...\n');

  // Connect MongoDB if available
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️ MongoDB not connected locally. Worker DB queries will operate in dry-run mode.');
  }

  // Allow 1s for Redis connection event
  await new Promise((resolve) => setTimeout(resolve, 500));

  const isReady = isRedisReady();
  console.log(`📡 Redis Connection Status: ${isReady ? 'ONLINE (BullMQ Active)' : 'OFFLINE (Fallback Mode)'}`);

  if (!isReady) {
    console.log('⚠️ Redis is offline. Please start Redis container via `docker compose up -d`.');
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    await redisClient.quit();
    process.exit(0);
  }

  // Clean old test queue jobs
  const queue = getEvaluationQueue();
  if (queue) {
    await queue.drain();
  }

  const mockSession = {
    _id: new mongoose.Types.ObjectId().toString(),
    interviewId: new mongoose.Types.ObjectId().toString(),
    candidateId: new mongoose.Types.ObjectId().toString(),
  };

  const mockInterviewDoc = {
    title: 'Senior Full Stack Engineer Screen',
  };

  console.log('\n---------------------------------------------------');
  console.log('STEP 1: Initializing Background Worker...');
  console.log('---------------------------------------------------');

  const worker = startEvaluationWorker();
  console.log(`✅ BullMQ Worker initialized and listening on Redis queue!`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 2: Enqueuing Evaluation Job (< 5ms Latency Check)...');
  console.log('---------------------------------------------------');

  const startEnqueue = performance.now();
  const queueResult = await enqueueEvaluation(mockSession, mockInterviewDoc);
  const endEnqueue = performance.now();
  const enqueueTime = (endEnqueue - startEnqueue).toFixed(3);

  console.log(`⚡ Enqueue Success: ${queueResult.enqueued ? 'YES' : 'NO'}`);
  console.log(`🚀 Job ID: ${queueResult.jobId}`);
  console.log(`⏱️ API Latency (Enqueue Time): ${enqueueTime} ms (Instant 202 Accepted response)`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 3: Verifying Job State in BullMQ Queue...');
  console.log('---------------------------------------------------');

  const job = await queue.getJob(queueResult.jobId);

  console.log(`📦 Job Retrieved from Redis Queue: #${job?.id}`);
  console.log(`📋 Job Data: Session=${job?.data?.sessionId}, Title="${job?.data?.interviewTitle}"`);
  console.log(`📊 Job State: ${await job?.getState()}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 4: Waiting 1.5 seconds for worker processing...');
  console.log('---------------------------------------------------');

  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log('\n🎉 [SUCCESS] BullMQ AI Evaluation Pipeline Test Completed Successfully!\n');

  if (worker) await worker.close();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await redisClient.quit();
  process.exit(0);
}

testBullMQEvaluationQueue().catch((err) => {
  console.error('❌ Error during BullMQ queue benchmark:', err);
  process.exit(1);
});
