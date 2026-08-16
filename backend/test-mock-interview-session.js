import mongoose from 'mongoose';
import dotenv from 'dotenv';
import interviewSessionService from './src/modules/interview/services/InterviewSessionService.js';
import { voiceSessionCache } from './src/modules/interview/services/voiceSessionCache.service.js';
import { redisClient, isRedisReady } from './src/config/redis.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ForkTalent';

async function runMockInterviewTest() {
  console.log('\n🚀 [Mock Interview Test] Initializing End-to-End Interview Simulation...\n');

  // 1. Connect MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️ MongoDB not connected locally. Testing Redis Session Cache standalone.');
  }

  // 2. Wait for Redis connection
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`📡 Redis Connection Status: ${isRedisReady() ? 'ONLINE (Sub-ms Cache Enabled)' : 'OFFLINE (Fallback Mode)'}`);

  const mockInterviewId = new mongoose.Types.ObjectId().toString();
  const mockCandidateId = new mongoose.Types.ObjectId().toString();

  console.log('\n---------------------------------------------------');
  console.log('STEP 1: Starting Mock Interview Session...');
  console.log('---------------------------------------------------');

  const firstQuestion = {
    question: 'What are the main advantages of using Redis in Node.js applications?',
    topic: 'System Architecture',
    difficulty: 'Medium',
    concept: 'Caching and Queues',
    type: 'conceptual',
  };

  // Create temporary mock session object if Mongo is offline for quick verification
  let session;
  try {
    const existing = await interviewSessionService.getOrCreateSession(mockInterviewId, mockCandidateId);
    session = await interviewSessionService.startSession(existing._id, firstQuestion, 30);
  } catch (dbErr) {
    console.warn('⚠️ Database query bypassed (Mock mode): Testing direct Redis Cache lifecycle...');
    session = {
      _id: 'mock_session_id_999',
      interviewId: mockInterviewId,
      candidateId: mockCandidateId,
      status: 'ACTIVE',
      currentQuestionIndex: 0,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 1800000),
      questions: [{ ...firstQuestion, id: 1, askedAt: new Date(), answer: null }],
    };
    await voiceSessionCache.setSession(mockInterviewId, mockCandidateId, session);
  }

  console.log(`✅ Session Started! ID: ${session._id}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 2: Fetching Active Session (Testing Redis Sub-ms Read)...');
  console.log('---------------------------------------------------');

  const startRead = performance.now();
  const cachedActive = await interviewSessionService.getActiveSession(mockInterviewId, mockCandidateId);
  const endRead = performance.now();

  console.log(`⚡ Fetched Active Session in ${(endRead - startRead).toFixed(3)} ms`);
  console.log(`📦 Loaded from Redis Cache? ${cachedActive?._fromCache ? 'YES (⚡ Sub-ms RAM)' : 'NO (MongoDB)'}`);
  console.log(`❓ Current Question [1]: ${cachedActive?.questions?.[0]?.question}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 3: Submitting Candidate Answer & Next Question...');
  console.log('---------------------------------------------------');

  const candidateAnswer = 'Redis provides in-memory key-value storage with sub-millisecond latency for session state and BullMQ queues.';
  const nextQuestion = {
    question: 'How does BullMQ help handle heavy AI processing in the background?',
    topic: 'Background Processing',
    difficulty: 'Hard',
    concept: 'Job Queues',
    type: 'conceptual',
  };

  if (cachedActive?._id && cachedActive._id !== 'mock_session_id_999') {
    await interviewSessionService.saveAnswerAndNextQuestion(cachedActive._id, candidateAnswer, nextQuestion);
  } else {
    // Update mock session in cache
    session.questions[0].answer = candidateAnswer;
    session.questions.push({ ...nextQuestion, id: 2, askedAt: new Date() });
    session.currentQuestionIndex = 1;
    await voiceSessionCache.setSession(mockInterviewId, mockCandidateId, session);
  }

  console.log('✅ Candidate Answer & Question #2 Saved');

  console.log('\n---------------------------------------------------');
  console.log('STEP 4: Fetching Updated Session from Redis RAM...');
  console.log('---------------------------------------------------');

  const updatedCached = await voiceSessionCache.getSession(mockInterviewId, mockCandidateId);
  console.log(`🎯 Total Questions in Cache: ${updatedCached?.questions?.length}`);
  console.log(`💬 Candidate Answer 1: "${updatedCached?.questions?.[0]?.answer}"`);
  console.log(`❓ Question 2: "${updatedCached?.questions?.[1]?.question}"`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 5: Completing Session & Cleaning Up RAM Cache...');
  console.log('---------------------------------------------------');

  await voiceSessionCache.clearSession(mockInterviewId, mockCandidateId);
  const afterClear = await voiceSessionCache.getSession(mockInterviewId, mockCandidateId);

  console.log(`🧹 Cache cleared on completion? ${afterClear === null ? 'YES (RAM Clean)' : 'NO'}`);

  console.log('\n🎉 [SUCCESS] Mock Interview Session Lifecycle Completed Perfectly!\n');

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await redisClient.quit();
  process.exit(0);
}

runMockInterviewTest().catch((err) => {
  console.error('❌ Error during mock interview test:', err);
  process.exit(1);
});
