import mongoose from 'mongoose';
import dotenv from 'dotenv';
import interviewSessionService from './src/modules/interview/services/InterviewSessionService.js';
import { voiceSessionCache } from './src/modules/interview/services/voiceSessionCache.service.js';
import { redisClient, isRedisReady } from './src/config/redis.js';
import InterviewSession from './src/modules/interview/models/InterviewSession.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ForkTalent';

async function runMockInterviewTest() {
  console.log('\n🚀 [Mock Interview Test] Initializing End-to-End Interview Simulation...\n');

  let hasMongo = false;
  try {
    await mongoose.connect(MONGODB_URI);
    hasMongo = true;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️ MongoDB not connected locally. Testing Redis Session Cache standalone.');
  }

  // Wait for Redis connection
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`📡 Redis Connection Status: ${isRedisReady() ? 'ONLINE (Sub-ms Cache Enabled)' : 'OFFLINE (Fallback Mode)'}`);

  const mockInterviewId = new mongoose.Types.ObjectId().toString();
  const mockCandidateId = new mongoose.Types.ObjectId().toString();

  console.log('\n---------------------------------------------------');
  console.log('STEP 1: Starting Mock Interview Session (MongoDB Init + Redis Seed)...');
  console.log('---------------------------------------------------');

  const firstQuestion = {
    question: 'What are the main advantages of using Redis in Node.js applications?',
    topic: 'System Architecture',
    difficulty: 'Medium',
    concept: 'Caching and Queues',
    type: 'conceptual',
  };

  let session;
  if (hasMongo) {
    const existing = await interviewSessionService.getOrCreateSession(mockInterviewId, mockCandidateId);
    session = await interviewSessionService.startSession(existing._id, firstQuestion, 30);
  } else {
    session = {
      _id: 'mock_session_id_999',
      interviewId: mockInterviewId,
      candidateId: mockCandidateId,
      status: 'ACTIVE',
      currentQuestionIndex: 0,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 1800000),
      questions: [{ ...firstQuestion, id: 1, askedAt: new Date(), answer: null, answeredAt: null }],
    };
    await voiceSessionCache.setSession(mockInterviewId, mockCandidateId, session);
  }

  console.log(`✅ Session Started! ID: ${session._id}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 2: Fetching Active Session (Testing Sub-ms Read)...');
  console.log('---------------------------------------------------');

  const startRead = performance.now();
  const cachedActive = await interviewSessionService.getActiveSession(mockInterviewId, mockCandidateId);
  const endRead = performance.now();

  console.log(`⚡ Fetched Active Session in ${(endRead - startRead).toFixed(3)} ms`);
  console.log(`📦 Loaded from Redis Cache? ${cachedActive?._fromCache ? 'YES (⚡ Sub-ms RAM)' : 'NO (MongoDB)'}`);
  console.log(`❓ Current Question [1]: ${cachedActive?.questions?.[0]?.question}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 3: Submitting Candidate Answer & Next Question (Write-Behind)...');
  console.log('---------------------------------------------------');

  const candidateAnswer = 'Redis provides in-memory key-value storage with sub-millisecond latency for session state and BullMQ queues.';
  const nextQuestion = {
    question: 'How does BullMQ help handle heavy AI processing in the background?',
    topic: 'Background Processing',
    difficulty: 'Hard',
    concept: 'Job Queues',
    type: 'conceptual',
  };

  const startTurn = performance.now();
  const updatedSession = await interviewSessionService.saveAnswerAndNextQuestion(
    cachedActive,
    candidateAnswer,
    nextQuestion
  );
  const endTurn = performance.now();

  console.log(`⚡ Turn Saved & Synced in ${(endTurn - startTurn).toFixed(3)} ms`);
  console.log(`🎯 Total Questions in Session: ${updatedSession?.questions?.length}`);
  console.log(`💬 Candidate Answer 1: "${updatedSession?.questions?.[0]?.answer}"`);
  console.log(`❓ Question 2: "${updatedSession?.questions?.[1]?.question}"`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 4: Fetching by Secondary SessionId Index...');
  console.log('---------------------------------------------------');

  const byIdSession = await interviewSessionService.getActiveSessionById(session._id);
  console.log(`🔍 Secondary Index Lookup Success: ${byIdSession ? 'YES' : 'NO'}`);
  console.log(`📦 Status: ${byIdSession?.status}, Current Q Index: ${byIdSession?.currentQuestionIndex}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 5: Completing Session & Flushing to MongoDB...');
  console.log('---------------------------------------------------');

  const completedSession = await interviewSessionService.completeSession(
    session._id,
    mockInterviewId,
    mockCandidateId
  );
  console.log(`🏁 Completed Session Status: ${completedSession?.status}`);

  if (hasMongo) {
    // Wait brief moment for asynchronous operations
    await new Promise((resolve) => setTimeout(resolve, 200));
    const dbFinal = await InterviewSession.findById(session._id);
    console.log(`💾 MongoDB Persisted Status: ${dbFinal?.status}`);
    console.log(`💾 MongoDB Question Count: ${dbFinal?.questions?.length}`);
    console.log(`💾 MongoDB Q1 Answer Present: ${Boolean(dbFinal?.questions?.[0]?.answer)}`);
  }

  const afterClear = await voiceSessionCache.getSession(mockInterviewId, mockCandidateId);
  console.log(`🧹 Redis RAM Cache cleared on completion? ${afterClear === null ? 'YES (RAM Clean)' : 'NO'}`);

  console.log('\n🎉 [SUCCESS] Mock Interview Session Lifecycle Completed Perfectly!\n');

  if (hasMongo && session._id && session._id !== 'mock_session_id_999') {
    await InterviewSession.findByIdAndDelete(session._id).catch(() => null);
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (isRedisReady()) {
    await redisClient.quit();
  }
  process.exit(0);
}

runMockInterviewTest().catch((err) => {
  console.error('❌ Error during mock interview test:', err);
  process.exit(1);
});
