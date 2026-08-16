import { resumableUploadService } from './src/modules/upload/services/resumableUpload.service.js';
import { startUploadWorker } from './src/workers/uploadWorker.js';
import { redisClient, isRedisReady } from './src/config/redis.js';

async function testResumableUpload() {
  console.log('\n🧪 [Test] Starting Redis Resumable Chunked Upload Benchmark...\n');

  // Allow 1s for Redis connection
  await new Promise((resolve) => setTimeout(resolve, 500));

  const isReady = isRedisReady();
  console.log(`📡 Redis Connection Status: ${isReady ? 'ONLINE (Resumable Upload Tracking Active)' : 'OFFLINE (Fallback Mode)'}`);

  if (!isReady) {
    console.log('⚠️ Redis is offline. Please start Redis container via `docker compose up -d`.');
    await redisClient.quit();
    process.exit(0);
  }

  const uploadId = `test_upload_${Date.now()}`;
  const totalChunks = 10;
  const dummyBuffer = Buffer.from('ForkTalent_MOCK_VIDEO_CHUNK_DATA_STREAM_PAYLOAD');

  console.log('\n---------------------------------------------------');
  console.log('STEP 1: Initializing Background Cloudinary Worker...');
  console.log('---------------------------------------------------');

  const worker = startUploadWorker();
  console.log('✅ BullMQ Upload Worker initialized!');

  console.log('\n---------------------------------------------------');
  console.log('STEP 2: Uploading Chunks 1 to 6 (60% Progress)...');
  console.log('---------------------------------------------------');

  for (let i = 1; i <= 6; i++) {
    const res = await resumableUploadService.handleChunkUpload(uploadId, i, totalChunks, dummyBuffer);
    console.log(`⬆️ Chunk ${i}/${totalChunks} Uploaded ──► Progress: ${res.progress}%`);
  }

  console.log('\n---------------------------------------------------');
  console.log('STEP 3: Simulating Laptop/Browser Tab Closure at 60%!');
  console.log('---------------------------------------------------');
  console.log('⚡ Browser tab closed! Network connection terminated.');

  console.log('\n---------------------------------------------------');
  console.log('STEP 4: Candidate Reopens App & Queries Upload Status from Redis...');
  console.log('---------------------------------------------------');

  const status = await resumableUploadService.getUploadStatus(uploadId);
  console.log(`📦 Redis Query Response:`);
  console.log(`  • Completed Chunks: [${status.completedChunks.join(', ')}]`);
  console.log(`  • Missing Chunks: [${status.missingChunks.join(', ')}]`);
  console.log(`  • Progress Saved: ${status.progress}%`);
  console.log(`  👉 RESUME FROM CHUNK: ${status.resumeFromChunk}`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 5: Resuming Upload for Remaining Chunks 7 to 10...');
  console.log('---------------------------------------------------');

  for (let i = status.resumeFromChunk; i <= totalChunks; i++) {
    const res = await resumableUploadService.handleChunkUpload(uploadId, i, totalChunks, dummyBuffer);
    console.log(`⬆️ Chunk ${i}/${totalChunks} Uploaded ──► Progress: ${res.progress}% ${res.isComplete ? '🎉 (ALL CHUNKS DONE)' : ''}`);
  }

  console.log('\n---------------------------------------------------');
  console.log('STEP 6: Waiting 2 seconds for BullMQ background chunk merger worker...');
  console.log('---------------------------------------------------');

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Cleanup test keys
  await redisClient.del(`upload:chunks:${uploadId}`);
  await redisClient.del(`upload:meta:${uploadId}`);

  console.log('\n🎉 [SUCCESS] Resumable Chunked Upload Test Completed Successfully!\n');

  if (worker) await worker.close();
  await redisClient.quit();
  process.exit(0);
}

testResumableUpload().catch((err) => {
  console.error('❌ Error during Resumable Upload benchmark:', err);
  process.exit(1);
});
