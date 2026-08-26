import { redisClient, isRedisReady } from '../../config/redis.js';

// Lua script to atomically verify lock ownership before releasing
const RELEASE_LOCK_LUA_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`;

/**
 * DistributedLockService
 * 
 * Provides atomic, distributed mutual exclusion across multi-instance backend
 * nodes and serverless workers using Redis SET NX PX and atomic Lua scripts.
 * Includes graceful in-memory Map fallback when Redis is offline.
 */
class DistributedLockService {
  constructor() {
    this.localLocks = new Map();
  }

  /**
   * Generates a standard Redis lock key
   * @param {string} resourceKey 
   * @returns {string}
   */
  getLockKey(resourceKey) {
    return `lock:session:${String(resourceKey || '')}`;
  }

  /**
   * Generates a unique lock owner token
   * @returns {string}
   */
  generateToken() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Attempts to acquire a distributed lock once without waiting
   * 
   * @param {string} resourceKey 
   * @param {number} [ttlMs=10000] - Lock expiration in milliseconds
   * @returns {Promise<{ acquired: boolean, key: string, token?: string, isFallback?: boolean }>}
   */
  async acquireLock(resourceKey, ttlMs = 10000) {
    const lockKey = this.getLockKey(resourceKey);
    const token = this.generateToken();

    // 1. Primary: Distributed Redis Lock (Atomic SET NX PX)
    if (isRedisReady()) {
      try {
        const result = await redisClient.set(lockKey, token, 'PX', ttlMs, 'NX');
        if (result === 'OK') {
          return { acquired: true, key: lockKey, token, isFallback: false };
        }
        return { acquired: false, key: lockKey };
      } catch (err) {
        console.warn('⚠️ [DistributedLock] Redis lock acquire failed, trying fallback:', err.message);
      }
    }

    // 2. Fallback: In-memory Process Lock
    const existing = this.localLocks.get(lockKey);
    const now = Date.now();

    if (!existing || existing.expiresAt <= now) {
      this.localLocks.set(lockKey, { token, expiresAt: now + ttlMs });
      return { acquired: true, key: lockKey, token, isFallback: true };
    }

    return { acquired: false, key: lockKey };
  }

  /**
   * Safely releases a lock only if the token matches the owner
   * 
   * @param {string} resourceKey 
   * @param {string} token 
   * @returns {Promise<boolean>}
   */
  async releaseLock(resourceKey, token) {
    if (!resourceKey || !token) return false;
    const lockKey = this.getLockKey(resourceKey);

    // 1. Primary: Atomic Lua script in Redis
    if (isRedisReady()) {
      try {
        const result = await redisClient.eval(RELEASE_LOCK_LUA_SCRIPT, 1, lockKey, token);
        return result === 1;
      } catch (err) {
        console.warn('⚠️ [DistributedLock] Redis lock release failed:', err.message);
      }
    }

    // 2. Fallback: In-memory release
    const existing = this.localLocks.get(lockKey);
    if (existing && existing.token === token) {
      this.localLocks.delete(lockKey);
      return true;
    }

    return false;
  }

  /**
   * Executes an async operation protected by a distributed lock with automatic spin-wait retry
   * 
   * @param {string} resourceKey 
   * @param {Function} asyncCallback 
   * @param {Object} [options]
   * @param {number} [options.ttlMs=10000] - Lock duration (default 10s)
   * @param {number} [options.maxWaitMs=6000] - Max time to wait for lock (default 6s)
   * @param {number} [options.retryIntervalMs=150] - Interval between retries (default 150ms)
   * @returns {Promise<any>}
   */
  async withLock(resourceKey, asyncCallback, options = {}) {
    const ttlMs = options.ttlMs || 10000;
    const maxWaitMs = options.maxWaitMs || 6000;
    const retryIntervalMs = options.retryIntervalMs || 150;

    const startTime = Date.now();
    let lockResult = await this.acquireLock(resourceKey, ttlMs);

    // Spin-wait loop if lock is currently busy
    while (!lockResult.acquired && (Date.now() - startTime) < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      lockResult = await this.acquireLock(resourceKey, ttlMs);
    }

    if (!lockResult.acquired) {
      throw new Error(`[DistributedLock] Could not acquire lock for resource '${resourceKey}' within ${maxWaitMs}ms`);
    }

    try {
      return await asyncCallback();
    } finally {
      await this.releaseLock(resourceKey, lockResult.token);
    }
  }
}

export const distributedLockService = new DistributedLockService();
export default distributedLockService;
