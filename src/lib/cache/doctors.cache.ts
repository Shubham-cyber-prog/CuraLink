/**
 * Bounded In-Memory TTL Cache with Singleflight (Promise Coalescing)
 * for Public Doctor Listings
 * 
 * Safety & Architecture Rules:
 * 1. ONLY public, non-sensitive doctor discovery data is stored here.
 * 2. NEVER store patient records, auth tokens, medical histories, or user profiles.
 * 3. Enforces bounded max-entries with LRU eviction to prevent memory leaks.
 * 4. Implements Singleflight pattern to coalesce concurrent cache misses,
 *    preventing Cache Stampedes / Thundering Herd on PostgreSQL.
 * 5. Provides safe error boundaries: cache errors never crash discovery.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  lastAccessed: number;
}

export class BoundedDoctorsCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;

  constructor(maxEntries = 100, defaultTtlMs = 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  private evictOldestIfNeeded(): void {
    if (this.cache.size < this.maxEntries) return;

    const now = Date.now();
    // First, check if any entry is already expired
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        return;
      }
    }

    // Otherwise, evict the least-recently-used (first key in Map insertion order)
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey);
    }
  }

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      if (!entry) return null;

      const now = Date.now();
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }

      // Re-insert to mark as most-recently used (moves to tail of Map)
      this.cache.delete(key);
      this.cache.set(key, {
        ...entry,
        lastAccessed: now,
      });

      return entry.data as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    try {
      this.evictOldestIfNeeded();
      const now = Date.now();
      const expiresAt = now + (ttlMs ?? this.defaultTtlMs);

      this.cache.set(key, {
        data,
        expiresAt,
        lastAccessed: now,
      });
    } catch {
      // Non-fatal: if memory or map operation fails, silently proceed without cache
    }
  }

  /**
   * Singleflight Coalescing:
   * If a fetch is already in flight for this key, concurrent callers share the exact
   * same Promise. Exactly 1 database query is executed, eliminating cache stampedes.
   */
  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    if (this.inFlight.has(key)) {
      return this.inFlight.get(key)! as Promise<T>;
    }

    const promise = (async () => {
      try {
        const data = await fetchFn();
        this.set(key, data, ttlMs);
        return data;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  invalidateAll(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  getStats(): { size: number; maxEntries: number; inFlightCount: number } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      inFlightCount: this.inFlight.size,
    };
  }
}

export const doctorsCache = new BoundedDoctorsCache(100, 60 * 1000);
export const invalidateDoctorsCache = () => doctorsCache.invalidateAll();
