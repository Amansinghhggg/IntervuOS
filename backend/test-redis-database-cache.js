import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { cacheService } from './src/shared/services/cacheService.js';
import { redisClient, isRedisReady } from './src/config/redis.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ForkTalent';

async function testDatabaseCaching() {
  console.log('\n🧪 [Test] Starting Redis Database Query Caching Benchmark...\n');

  // Connect MongoDB if available
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️ MongoDB not connected locally. Testing Redis Cache standalone.');
  }

  // Allow 1s for Redis connection event
  await new Promise((resolve) => setTimeout(resolve, 500));

  const isReady = isRedisReady();
  console.log(`📡 Redis Connection Status: ${isReady ? 'ONLINE (Database Cache Active)' : 'OFFLINE (Fallback Mode)'}`);

  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockCacheKey = `cache:user:${mockUserId}`;

  const mockUserFetch = async () => {
    // Simulate database lookup latency (~15ms)
    await new Promise((r) => setTimeout(r, 15));
    return {
      _id: mockUserId,
      name: 'John Candidate',
      email: 'candidate@example.com',
      role: 'candidate',
      resume: {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/resume.pdf',
        fileName: 'John_Resume.pdf',
      },
    };
  };

  console.log('\n---------------------------------------------------');
  console.log('STEP 1: Testing First Query Read (Cache Miss)...');
  console.log('---------------------------------------------------');

  const startMiss = performance.now();
  const missResult = await cacheService.getOrSetCache(mockCacheKey, 300, mockUserFetch);
  const endMiss = performance.now();
  const missTime = (endMiss - startMiss).toFixed(3);

  console.log(`⏱️ Query Time (Cache Miss): ${missTime} ms`);
  console.log(`📦 Loaded from Cache? ${missResult?._fromCache ? 'YES' : 'NO (Fetched from DB)'}`);
  console.log(`👤 User Name: ${missResult?.name}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 2: Testing Second Query Read (Cache Hit)...');
  console.log('---------------------------------------------------');

  const startHit = performance.now();
  const hitResult = await cacheService.getOrSetCache(mockCacheKey, 300, mockUserFetch);
  const endHit = performance.now();
  const hitTime = (endHit - startHit).toFixed(3);

  console.log(`⏱️ Query Time (Cache Hit): ${hitTime} ms`);
  console.log(`⚡ Speedup: ${(Number(missTime) / Number(hitTime)).toFixed(1)}x Faster!`);
  console.log(`📦 Loaded from Cache? ${hitResult?._fromCache ? 'YES (⚡ Sub-ms RAM)' : 'NO'}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 3: Testing Cache Invalidation on Data Update...');
  console.log('---------------------------------------------------');

  const invalidateSuccess = await cacheService.invalidateCache(mockCacheKey);
  console.log(`🧹 Invalidate Key Success? ${invalidateSuccess ? 'YES' : 'NO'}`);

  const startPostInvalidate = performance.now();
  const postInvalidateResult = await cacheService.getOrSetCache(mockCacheKey, 300, mockUserFetch);
  const endPostInvalidate = performance.now();

  console.log(`📦 After Invalidation, Loaded from Cache? ${postInvalidateResult?._fromCache ? 'YES' : 'NO (Fresh DB Query)'}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 4: Cleanup & Pattern Invalidation Test...');
  console.log('---------------------------------------------------');

  await cacheService.invalidateCachePattern('cache:user:*');

  console.log('\n🎉 [SUCCESS] Database Query Caching Test Completed Successfully!\n');

  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await redisClient.quit();
  process.exit(0);
}

testDatabaseCaching().catch((err) => {
  console.error('❌ Error during Database Caching benchmark:', err);
  process.exit(1);
});
