import { redisClient, isRedisReady } from '../../../config/redis.js';
import { enqueueVideoUploadJob } from '../queues/uploadQueue.js';
import fs from 'fs';
import path from 'path';

/**
 * ResumableUploadService
 * 
 * Manages chunked video/audio recording uploads with Redis Set state tracking,
 * tab closure/disconnect recovery, and automatic background Cloudinary sync.
 */
class ResumableUploadService {
  /**
   * Processes an incoming video chunk
   * 
   * @param {string} uploadId 
   * @param {number} chunkIndex - 1-indexed chunk number
   * @param {number} totalChunks - Total expected chunks
   * @param {Buffer} fileBuffer - Chunk binary data
   * @returns {Promise<Object>}
   */
  async handleChunkUpload(uploadId, chunkIndex, totalChunks, fileBuffer) {
    const chunkNum = Number(chunkIndex);
    const totalNum = Number(totalChunks);

    // 1. Save chunk to temporary disk folder
    const tempDir = path.join(process.cwd(), 'temp_uploads', uploadId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const chunkPath = path.join(tempDir, `chunk_${chunkNum}`);
    fs.writeFileSync(chunkPath, fileBuffer);

    // 2. Track completed chunk in Redis Set & Hash
    if (isRedisReady()) {
      try {
        const chunksKey = `upload:chunks:${uploadId}`;
        const metaKey = `upload:meta:${uploadId}`;

        await redisClient.sadd(chunksKey, chunkNum);
        await redisClient.hset(metaKey, {
          totalChunks: totalNum,
          lastUpdated: Date.now(),
        });

        // Set 24-hour expiration for auto-cleanup
        await redisClient.expire(chunksKey, 86400);
        await redisClient.expire(metaKey, 86400);

        const completedCount = await redisClient.scard(chunksKey);
        const progress = Math.min(100, Math.round((completedCount / totalNum) * 100));

        // 3. If all chunks uploaded, trigger background BullMQ Cloudinary worker
        if (completedCount >= totalNum) {
          console.log(`🎉 [ResumableUpload] All ${totalNum} chunks received for ${uploadId}! Enqueuing BullMQ job...`);
          await enqueueVideoUploadJob(uploadId, totalNum);
          return {
            isComplete: true,
            progress: 100,
            completedChunks: completedCount,
            totalChunks: totalNum,
            message: 'All chunks uploaded successfully. Background processing started.',
          };
        }

        return {
          isComplete: false,
          progress,
          completedChunks: completedCount,
          totalChunks: totalNum,
          nextChunkNeeded: chunkNum + 1 <= totalNum ? chunkNum + 1 : null,
        };
      } catch (err) {
        console.warn('⚠️ [ResumableUpload] Redis tracking notice:', err.message);
      }
    }

    // Standalone fallback if Redis is offline
    return {
      isComplete: chunkNum >= totalNum,
      progress: Math.round((chunkNum / totalNum) * 100),
      completedChunks: chunkNum,
      totalChunks: totalNum,
    };
  }

  /**
   * Retrieves upload status for resuming after tab closure or network drop
   * 
   * @param {string} uploadId 
   * @returns {Promise<Object>}
   */
  async getUploadStatus(uploadId) {
    if (!isRedisReady()) {
      return { uploadId, completedChunks: [], totalChunks: 0, progress: 0, isComplete: false };
    }

    try {
      const chunksKey = `upload:chunks:${uploadId}`;
      const metaKey = `upload:meta:${uploadId}`;

      const rawChunks = await redisClient.smembers(chunksKey);
      const totalChunksStr = await redisClient.hget(metaKey, 'totalChunks');

      const completedChunks = rawChunks.map(Number).sort((a, b) => a - b);
      const totalChunks = Number(totalChunksStr || 0);

      const progress = totalChunks > 0 ? Math.min(100, Math.round((completedChunks.length / totalChunks) * 100)) : 0;
      const isComplete = totalChunks > 0 && completedChunks.length >= totalChunks;

      // Find missing chunk indices
      const missingChunks = [];
      if (totalChunks > 0) {
        for (let i = 1; i <= totalChunks; i++) {
          if (!completedChunks.includes(i)) {
            missingChunks.push(i);
          }
        }
      }

      return {
        uploadId,
        completedChunks,
        missingChunks,
        totalChunks,
        progress,
        isComplete,
        resumeFromChunk: missingChunks.length > 0 ? missingChunks[0] : (isComplete ? null : completedChunks.length + 1),
      };
    } catch (err) {
      console.warn('⚠️ [ResumableUpload] Status query error:', err.message);
      return { uploadId, completedChunks: [], totalChunks: 0, progress: 0, isComplete: false };
    }
  }
}

export const resumableUploadService = new ResumableUploadService();
export default resumableUploadService;
