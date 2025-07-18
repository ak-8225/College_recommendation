// Simple in-memory cache with TTL (Time-To-Live)
const cache = {};

/**
 * Set a value in the cache with a TTL (in ms)
 * @param {string} key
 * @param {any} value
 * @param {number} ttlMs
 */
function setCache(key, value, ttlMs) {
  const expires = Date.now() + ttlMs;
  cache[key] = { value, expires };
}

/**
 * Get a value from the cache if not expired
 * @param {string} key
 * @returns {any|null}
 */
function getCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete cache[key];
    return null;
  }
  return entry.value;
}

/**
 * Delete a value from the cache
 * @param {string} key
 */
function deleteCache(key) {
  delete cache[key];
}

module.exports = {
  setCache,
  getCache,
  deleteCache,
}; 