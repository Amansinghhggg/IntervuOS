import { redisClient, isRedisReady } from '../../../config/redis.js';

/**
 * VoiceSessionCacheService
 * 
 * Provides sub-millisecond Redis RAM caching for real-time interview sessions,
 * voice transcript buffers, dynamic timer countdowns, and avatar expressions.
 */
class VoiceSessionCacheService {
  /**
   * Generates a standard Redis HASH key for active interview session state
   */
  getCacheKey(interviewId, candidateId) {
    return `voice:session:${String(interviewId || '')}:${String(candidateId || '')}`;
  }

  /**
   * Caches full interview session state in Redis RAM (<1ms write)
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   * @param {Object} sessionData 
   * @param {number} ttlSeconds - Default 2 hours (7200 seconds)
   * @returns {Promise<boolean>}
   */
  async setSession(interviewId, candidateId, sessionData, ttlSeconds = 7200) {
    if (!interviewId || !candidateId || !sessionData || !isRedisReady()) return false;

    try {
      const key = this.getCacheKey(interviewId, candidateId);
      
      // Serialize nested objects (like questions array or conversation history) to JSON strings for HASH
      const serializedData = {
        sessionId: String(sessionData._id || sessionData.sessionId || ''),
        interviewId: String(interviewId),
        candidateId: String(candidateId),
        status: String(sessionData.status || 'ACTIVE'),
        currentQuestionIndex: String(sessionData.currentQuestionIndex ?? 0),
        startedAt: sessionData.startedAt ? new Date(sessionData.startedAt).toISOString() : '',
        expiresAt: sessionData.expiresAt ? new Date(sessionData.expiresAt).toISOString() : '',
        lastTranscriptSnippet: sessionData.lastTranscriptSnippet || '',
        avatarExpression: sessionData.avatarExpression || 'neutral',
        questionsJson: JSON.stringify(sessionData.questions || []),
        updatedAt: String(Date.now()),
      };

      await redisClient.hset(key, serializedData);
      await redisClient.expire(key, ttlSeconds);
      return true;
    } catch (err) {
      console.warn('⚠️ [VoiceSessionCache] Error writing to Redis:', err.message);
      return false;
    }
  }

  /**
   * Retrieves active session state from Redis RAM (<1ms read)
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   * @returns {Promise<Object|null>}
   */
  async getSession(interviewId, candidateId) {
    if (!interviewId || !candidateId || !isRedisReady()) return null;

    try {
      const key = this.getCacheKey(interviewId, candidateId);
      const data = await redisClient.hgetall(key);

      if (!data || Object.keys(data).length === 0) {
        return null; // Cache miss
      }

      let parsedQuestions = [];
      if (data.questionsJson) {
        try {
          parsedQuestions = JSON.parse(data.questionsJson);
        } catch {
          parsedQuestions = [];
        }
      }

      return {
        _id: data.sessionId,
        sessionId: data.sessionId,
        interviewId: data.interviewId,
        candidateId: data.candidateId,
        status: data.status,
        currentQuestionIndex: Number(data.currentQuestionIndex || 0),
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        lastTranscriptSnippet: data.lastTranscriptSnippet || '',
        avatarExpression: data.avatarExpression || 'neutral',
        questions: parsedQuestions,
        updatedAt: Number(data.updatedAt || Date.now()),
        _fromCache: true,
      };
    } catch (err) {
      console.warn('⚠️ [VoiceSessionCache] Error reading from Redis:', err.message);
      return null; // Fallback to DB
    }
  }

  /**
   * Updates specific fields atomically in Redis RAM without rewriting the full session
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   * @param {Object} updateFields 
   * @returns {Promise<boolean>}
   */
  async updateSessionFields(interviewId, candidateId, updateFields) {
    if (!interviewId || !candidateId || !updateFields || !isRedisReady()) return false;

    try {
      const key = this.getCacheKey(interviewId, candidateId);
      const payload = { updatedAt: String(Date.now()) };

      for (const [field, value] of Object.entries(updateFields)) {
        if (typeof value === 'object' && value !== null) {
          payload[`${field}Json`] = JSON.stringify(value);
        } else {
          payload[field] = String(value ?? '');
        }
      }

      await redisClient.hset(key, payload);
      return true;
    } catch (err) {
      console.warn('⚠️ [VoiceSessionCache] Error updating Redis fields:', err.message);
      return false;
    }
  }

  /**
   * Deletes session state from Redis RAM upon interview completion or cancellation
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   * @returns {Promise<boolean>}
   */
  async clearSession(interviewId, candidateId) {
    if (!interviewId || !candidateId || !isRedisReady()) return false;

    try {
      const key = this.getCacheKey(interviewId, candidateId);
      await redisClient.del(key);
      return true;
    } catch (err) {
      console.warn('⚠️ [VoiceSessionCache] Error deleting Redis key:', err.message);
      return false;
    }
  }
}

export const voiceSessionCache = new VoiceSessionCacheService();
export default voiceSessionCache;
