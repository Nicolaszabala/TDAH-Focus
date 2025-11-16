/**
 * Simple in-memory cache for LLM responses
 *
 * This reduces API calls for common queries and improves response time.
 * For production with multiple instances, consider Redis or similar.
 */

class ResponseCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };

    // Auto-cleanup every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 600000); // 10 minutes
  }

  /**
   * Get cached response
   * @param {string} key - Cache key
   * @returns {string|null} - Cached value or null
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const { value, expiry } = entry;

    // Check if expired
    if (Date.now() > expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    this.stats.hits++;
    return value;
  }

  /**
   * Set cached response
   * @param {string} key - Cache key
   * @param {string} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 1 hour)
   */
  set(key, value, ttlSeconds = 3600) {
    const expiry = Date.now() + (ttlSeconds * 1000);

    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now(),
    });
  }

  /**
   * Delete a specific cache entry
   * @param {string} key - Cache key to delete
   * @returns {boolean} - True if deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.evictions += size;
    console.log(`🗑️  Cache cleared: ${size} entries removed`);
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.stats.evictions += removed;
      console.log(`🧹 Cache cleanup: ${removed} expired entries removed`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Stats object
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Destroy the cache (cleanup interval)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Export singleton instance
const cache = new ResponseCache();

/**
 * Generate cache key from message and context
 * @param {string} message - User message
 * @param {Object} context - Context object
 * @returns {string} - Cache key
 */
function generateCacheKey(message, context = {}) {
  // Normalize message
  const normalizedMessage = message.toLowerCase().trim();

  // Create context signature (without sensitive data)
  const contextSignature = JSON.stringify({
    obligatory: context.tasks?.filter(t => t.isMandatory && !t.completed).length || 0,
    optional: context.tasks?.filter(t => !t.isMandatory && !t.completed).length || 0,
    completedToday: context.tasks?.filter(t => t.completed && isToday(t.completedAt)).length || 0,
    sessions: context.pomodoroSessions || 0,
  });

  return `${normalizedMessage}:${contextSignature}`;
}

function isToday(timestamp) {
  if (!timestamp) return false;
  try {
    const today = new Date().toDateString();
    const date = new Date(timestamp).toDateString();
    return today === date;
  } catch {
    return false;
  }
}

module.exports = {
  cache,
  generateCacheKey,
};
