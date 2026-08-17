import { redisClient, isRedisReady } from '../../config/redis.js';

/**
 * CacheService
 * 
 * Provides high-level Redis query caching for MongoDB documents and API endpoints.
 */
class CacheService {
  /**
   * Generic Cache Getter / Setter wrapper
   * 
   * @param {string} key - Redis key namespace
   * @param {number} ttlSeconds - Time-To-Live in seconds
   * @param {Function} fetchFunction - Async function returning fresh database data
   * @returns {Promise<Object|Array|null>}
   */
  async getOrSetCache(key, ttlSeconds, fetchFunction) {
    if (!fetchFunction || typeof fetchFunction !== 'function') {
      return null;
    }

    if (!key || typeof key !== 'string') {
      return await fetchFunction();
    }

    const ttl = (typeof ttlSeconds === 'number' && ttlSeconds > 0) ? ttlSeconds : 300;

    // 1. Try reading from Redis RAM if connected
    if (isRedisReady()) {
      try {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            parsed._fromCache = true;
          }
          return parsed;
        }
      } catch (err) {
        console.warn(`⚠️ [CacheService] Redis read error for key '${key}':`, err.message);
      }
    }

    // 2. Fetch fresh data from MongoDB
    const freshData = await fetchFunction();

    // 3. Store fresh data in Redis RAM with TTL
    if (isRedisReady() && freshData !== undefined && freshData !== null) {
      try {
        await redisClient.set(key, JSON.stringify(freshData), 'EX', ttl);
      } catch (err) {
        console.warn(`⚠️ [CacheService] Redis write error for key '${key}':`, err.message);
      }
    }

    return freshData;
  }

  /**
   * Directly get a cached value
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!key || typeof key !== 'string' || !isRedisReady()) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`⚠️ [CacheService] Redis get error for key '${key}':`, err.message);
      return null;
    }
  }

  /**
   * Directly set a cached value with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttlSeconds = 300) {
    if (!key || typeof key !== 'string' || value === undefined || !isRedisReady()) return false;
    try {
      const ttl = (typeof ttlSeconds === 'number' && ttlSeconds > 0) ? ttlSeconds : 300;
      await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
      return true;
    } catch (err) {
      console.warn(`⚠️ [CacheService] Redis set error for key '${key}':`, err.message);
      return false;
    }
  }

  /**
   * Invalidates a specific Redis cache key
   * 
   * @param {string} key 
   * @returns {Promise<boolean>}
   */
  async invalidateCache(key) {
    if (!key || typeof key !== 'string' || !isRedisReady()) return false;
    try {
      await redisClient.del(key);
      console.log(`🧹 [CacheService] Invalidated key: ${key}`);
      return true;
    } catch (err) {
      console.warn(`⚠️ [CacheService] Error deleting key '${key}':`, err.message);
      return false;
    }
  }

  /**
   * Invalidates all Redis cache keys matching a pattern (e.g. 'cache:user:*')
   * 
   * @param {string} pattern 
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidateCachePattern(pattern) {
    if (!pattern || typeof pattern !== 'string' || !isRedisReady()) return 0;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys && keys.length > 0) {
        const deleted = await redisClient.del(...keys);
        console.log(`🧹 [CacheService] Invalidated ${deleted} key(s) matching pattern '${pattern}'`);
        return deleted;
      }
      return 0;
    } catch (err) {
      console.warn(`⚠️ [CacheService] Error deleting pattern '${pattern}':`, err.message);
      return 0;
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
