// Offline Data Cache for Lectures, Categories, etc.

const LECTURES_CACHE_KEY = 'lms_cached_lectures';
const CATEGORIES_CACHE_KEY = 'lms_cached_categories';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

export class OfflineDataCache {
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
      };
      localStorage.setItem(LECTURES_CACHE_KEY, JSON.stringify(cache));
      console.log('✅ Lectures cached:', lectures.length, 'items');
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

      // Check if cache has expired
      if (Date.now() > cache.expiresAt) {
        console.log('⏰ Lectures cache expired');
        localStorage.removeItem(LECTURES_CACHE_KEY);
        return null;
      }

      console.log('✅ Found cached lectures:', cache.data.length, 'items');
      return cache.data;
    } catch (error) {
      console.error('Error getting cached lectures:', error);
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
      };
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cache));
      console.log('✅ Categories cached:', categories.length, 'items');
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

      // Check if cache has expired
      if (Date.now() > cache.expiresAt) {
        console.log('⏰ Categories cache expired');
        localStorage.removeItem(CATEGORIES_CACHE_KEY);
        return null;
      }

      console.log('✅ Found cached categories:', cache.data.length, 'items');
      return cache.data;
    } catch (error) {
      console.error('Error getting cached categories:', error);
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
    lectures: { count: number; cachedAt?: number } | null;
    categories: { count: number; cachedAt?: number } | null;
  } {
    const lecturesCache = this.getCachedLectures();
    const categoriesCache = this.getCachedCategories();

    return {
      lectures: lecturesCache
        ? {
            count: lecturesCache.length,
            cachedAt: Date.now(), // Simplified
          }
        : null,
      categories: categoriesCache
        ? {
            count: categoriesCache.length,
            cachedAt: Date.now(),
          }
        : null,
    };
  }
}
