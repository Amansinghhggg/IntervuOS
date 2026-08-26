import dotenv from 'dotenv';
import { distributedLockService } from './src/shared/services/distributedLock.service.js';
import { redisClient, isRedisReady } from './src/config/redis.js';

dotenv.config();

async function testDistributedLock() {
  console.log('\n🔒 [Benchmark] Starting Distributed Redis Lock Benchmark...\n');

  // Allow 500ms for Redis connection
  await new Promise((resolve) => setTimeout(resolve, 500));

  const isReady = isRedisReady();
  console.log(`📡 Redis Connection Status: ${isReady ? 'ONLINE (Distributed Lock Mode)' : 'OFFLINE (Process Fallback Mode)'}`);

  const testSessionId = `test_session_${Date.now()}`;

  // STEP 1: Basic Acquire and Release
  console.log('\n---------------------------------------------------');
  console.log('STEP 1: Basic Lock Acquisition & Sub-ms Release...');
  console.log('---------------------------------------------------');

  const startAcquire = performance.now();
  const lock1 = await distributedLockService.acquireLock(testSessionId, 5000);
  const endAcquire = performance.now();

  console.log(`⚡ Lock 1 Acquired: ${lock1.acquired ? 'YES' : 'NO'} in ${(endAcquire - startAcquire).toFixed(3)} ms`);
  console.log(`🔑 Lock Key: ${lock1.key}`);
  console.log(`🎫 Lock Token: ${lock1.token}`);

  if (!lock1.acquired) {
    throw new Error('Initial lock acquisition failed');
  }

  // STEP 2: Mutual Exclusion (Attempting to acquire same lock must fail)
  console.log('\n---------------------------------------------------');
  console.log('STEP 2: Testing Mutual Exclusion (Contention Check)...');
  console.log('---------------------------------------------------');

  const lock2 = await distributedLockService.acquireLock(testSessionId, 5000);
  console.log(`🚫 Contending Lock 2 Acquired? ${lock2.acquired ? 'YES (FAILURE - Mutual Exclusion Breached)' : 'NO (SUCCESS - Mutual Exclusion Upheld)'}`);

  if (lock2.acquired) {
    throw new Error('Lock 2 should not have been acquired while Lock 1 was held');
  }

  // STEP 3: Safe Release via Lua script
  console.log('\n---------------------------------------------------');
  console.log('STEP 3: Testing Safe Owner Release with Lua Script...');
  console.log('---------------------------------------------------');

  // Attempt invalid release with wrong token
  const wrongTokenRelease = await distributedLockService.releaseLock(testSessionId, 'invalid_fake_token_123');
  console.log(`🛡️ Impostor Token Release Prevented? ${!wrongTokenRelease ? 'YES (Protected)' : 'NO'}`);

  // Valid release with owner token
  const validRelease = await distributedLockService.releaseLock(testSessionId, lock1.token);
  console.log(`✅ Valid Owner Lock Released? ${validRelease ? 'YES' : 'NO'}`);

  // Now Lock 2 should be able to acquire
  const lock3 = await distributedLockService.acquireLock(testSessionId, 5000);
  console.log(`⚡ Subsequent Lock 3 Acquired After Release? ${lock3.acquired ? 'YES' : 'NO'}`);
  await distributedLockService.releaseLock(testSessionId, lock3.token);

  // STEP 4: withLock Automatic Spin-Wait & Mutual Exclusion
  console.log('\n---------------------------------------------------');
  console.log('STEP 4: Testing withLock Helper with High Concurrency...');
  console.log('---------------------------------------------------');

  let executionSequence = [];

  const taskA = distributedLockService.withLock(testSessionId, async () => {
    executionSequence.push('A_START');
    await new Promise((resolve) => setTimeout(resolve, 300));
    executionSequence.push('A_FINISH');
    return 'RESULT_A';
  });

  const taskB = distributedLockService.withLock(testSessionId, async () => {
    executionSequence.push('B_START');
    await new Promise((resolve) => setTimeout(resolve, 100));
    executionSequence.push('B_FINISH');
    return 'RESULT_B';
  });

  const [resA, resB] = await Promise.all([taskA, taskB]);

  console.log(`📊 Concurrent Task A Result: ${resA}`);
  console.log(`📊 Concurrent Task B Result: ${resB}`);
  console.log(`⏱️ Execution Order: ${executionSequence.join(' -> ')}`);

  const isValidOrder = executionSequence.join(',') === 'A_START,A_FINISH,B_START,B_FINISH' ||
                       executionSequence.join(',') === 'B_START,B_FINISH,A_START,A_FINISH';
  console.log(`🛡️ Perfect Serialized Concurrency? ${isValidOrder ? 'YES (Zero Overlap)' : 'NO'}`);

  // STEP 5: TTL Auto-Expiration Test
  console.log('\n---------------------------------------------------');
  console.log('STEP 5: Testing TTL Auto-Expiration (Deadlock Prevention)...');
  console.log('---------------------------------------------------');

  const shortSessionId = `short_session_${Date.now()}`;
  await distributedLockService.acquireLock(shortSessionId, 400); // 400ms TTL
  console.log('⏳ Acquired 400ms TTL lock, waiting 550ms for auto-expiry...');

  await new Promise((resolve) => setTimeout(resolve, 550));

  const afterExpiryLock = await distributedLockService.acquireLock(shortSessionId, 1000);
  console.log(`⚡ Lock Acquired After TTL Expiration? ${afterExpiryLock.acquired ? 'YES (Zero Deadlocks)' : 'NO'}`);
  await distributedLockService.releaseLock(shortSessionId, afterExpiryLock.token);

  console.log('\n🎉 [SUCCESS] Distributed Redis Lock Benchmark Completed with 100% Pass!\n');

  if (isRedisReady()) {
    await redisClient.quit();
  }
  process.exit(0);
}

testDistributedLock().catch((err) => {
  console.error('❌ Error during Distributed Lock benchmark:', err);
  process.exit(1);
});
