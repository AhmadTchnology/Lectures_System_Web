/**
 * Offline Data Cache for Lectures, Categories, etc.
 * Enhanced with version checking for automatic cache invalidation
 */

import { CacheVersionManager } from './cacheVersion';

const LECTURES_CACHE_KEY = 'lms_cached_lectures';
const CATEGORIES_CACHE_KEY = 'lms_cached_categories';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  version: string; // App version when cached
}

export class OfflineDataCache {
  /**
   * Check if cache entry is valid (not expired and version matches)
   */
  private static isCacheValid<T>(cache: CacheEntry<T>): boolean {
    const currentVersion = CacheVersionManager.getAppVersion();

    // Check version match
    if (cache.version !== currentVersion) {
      console.log('⚠️ Cache version mismatch:', {
        cached: cache.version,
        current: currentVersion
      });
      return false;
    }

    // Check expiration
    if (Date.now() > cache.expiresAt) {
      console.log('⏰ Cache expired');
      return false;
    }

    return true;
  }

  // Save lectures to cache
  static saveLectures(lectures: any[]): void {
    try {
      // Don't cache empty data - it might be an offline/error response
      if (!lectures || lectures.length === 0) {
        console.log('⚠️ Skipping cache: Empty lectures data');
        return;
      }

      const cache: CacheEntry<any[]> = {
        data: lectures,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
        version: CacheVersionManager.getAppVersion()
      };
      localStorage.setItem(LECTURES_CACHE_KEY, JSON.stringify(cache));
      console.log('✅ Lectures cached:', lectures.length, 'items (version:', cache.version + ')');
    } catch (error) {
      console.error('Error caching lectures:', error);
    }
  }

  // Get cached lectures
  static getCachedLectures(): any[] | null {
    try {
      const cached = localStorage.getItem(LECTURES_CACHE_KEY);
      if (!cached) {
        console.log('❌ No cached lectures found');
        return null;
      }

      const cache: CacheEntry<any[]> = JSON.parse(cached);

      // Validate cache
      if (!this.isCacheValid(cache)) {
        console.log('🗑️ Removing invalid lectures cache');
        localStorage.removeItem(LECTURES_CACHE_KEY);
        return null;
      }

      console.log('✅ Found valid cached lectures:', cache.data.length, 'items');
      return cache.data;
    } catch (error) {
      console.error('Error getting cached lectures:', error);
      // Remove corrupted cache
      localStorage.removeItem(LECTURES_CACHE_KEY);
      return null;
    }
  }

  // Save categories to cache
  static saveCategories(categories: any[]): void {
    try {
      // Don't cache empty data - it might be an offline/error response
      if (!categories || categories.length === 0) {
        console.log('⚠️ Skipping cache: Empty categories data');
        return;
      }

      const cache: CacheEntry<any[]> = {
        data: categories,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
        version: CacheVersionManager.getAppVersion()
      };
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cache));
      console.log('✅ Categories cached:', categories.length, 'items (version:', cache.version + ')');
    } catch (error) {
      console.error('Error caching categories:', error);
    }
  }

  // Get cached categories
  static getCachedCategories(): any[] | null {
    try {
      const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (!cached) {
        console.log('❌ No cached categories found');
        return null;
      }

      const cache: CacheEntry<any[]> = JSON.parse(cached);

      // Validate cache
      if (!this.isCacheValid(cache)) {
        console.log('🗑️ Removing invalid categories cache');
        localStorage.removeItem(CATEGORIES_CACHE_KEY);
        return null;
      }

      console.log('✅ Found valid cached categories:', cache.data.length, 'items');
      return cache.data;
    } catch (error) {
      console.error('Error getting cached categories:', error);
      // Remove corrupted cache
      localStorage.removeItem(CATEGORIES_CACHE_KEY);
      return null;
    }
  }

  // Clear all cached data
  static clearAll(): void {
    try {
      localStorage.removeItem(LECTURES_CACHE_KEY);
      localStorage.removeItem(CATEGORIES_CACHE_KEY);
      console.log('✅ All data cache cleared');
    } catch (error) {
      console.error('Error clearing data cache:', error);
    }
  }

  // Get cache info
  static getCacheInfo(): {
    lectures: { count: number; cachedAt?: number; version?: string } | null;
    categories: { count: number; cachedAt?: number; version?: string } | null;
  } {
    try {
      const lecturesCache = localStorage.getItem(LECTURES_CACHE_KEY);
      const categoriesCache = localStorage.getItem(CATEGORIES_CACHE_KEY);

      let lecturesInfo = null;
      let categoriesInfo = null;

      if (lecturesCache) {
        const cache: CacheEntry<any[]> = JSON.parse(lecturesCache);
        if (this.isCacheValid(cache)) {
          lecturesInfo = {
            count: cache.data.length,
            cachedAt: cache.cachedAt,
            version: cache.version
          };
        }
      }

      if (categoriesCache) {
        const cache: CacheEntry<any[]> = JSON.parse(categoriesCache);
        if (this.isCacheValid(cache)) {
          categoriesInfo = {
            count: cache.data.length,
            cachedAt: cache.cachedAt,
            version: cache.version
          };
        }
      }

      return {
        lectures: lecturesInfo,
        categories: categoriesInfo
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {
        lectures: null,
        categories: null
      };
    }
  }
}
