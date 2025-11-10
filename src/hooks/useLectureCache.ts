import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '../utils/cacheManager';

interface CachedLecture {
  id: string;
  title: string;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalSize: number;
  lectureCount: number;
  lectures: CachedLecture[];
}

export const useLectureCache = () => {
  const [cachedLectureIds, setCachedLectureIds] = useState<string[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalSize: 0,
    lectureCount: 0,
    lectures: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load cached lecture IDs on mount
  useEffect(() => {
    loadCachedLectures();
    loadCacheStats();
  }, []);

  const loadCachedLectures = async () => {
    try {
      const cached = await cacheManager.getAllCachedLectures();
      setCachedLectureIds(cached);
    } catch (error) {
      console.error('Error loading cached lectures:', error);
    }
  };

  const loadCacheStats = async () => {
    try {
      const stats = await cacheManager.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const cacheLecture = useCallback(async (lecture: {
    id: string;
    title: string;
    subject: string;
    stage: string;
    pdfUrl: string;
    uploadedBy: string;
    uploadDate: string;
  }) => {
    setIsLoading(true);
    try {
      const success = await cacheManager.cacheLecture(lecture);
      if (success) {
        await loadCachedLectures();
        await loadCacheStats();
      }
      return success;
    } catch (error) {
      console.error('Error caching lecture:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeCachedLecture = useCallback(async (lectureId: string) => {
    setIsLoading(true);
    try {
      const success = await cacheManager.removeCachedLecture(lectureId);
      if (success) {
        await loadCachedLectures();
        await loadCacheStats();
      }
      return success;
    } catch (error) {
      console.error('Error removing cached lecture:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllCache = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await cacheManager.clearAllCache();
      if (success) {
        await loadCachedLectures();
        await loadCacheStats();
      }
      return success;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isCached = useCallback((lectureId: string) => {
    return cachedLectureIds.includes(lectureId);
  }, [cachedLectureIds]);

  const getOfflinePDFUrl = useCallback(async (lectureId: string) => {
    return await cacheManager.getOfflinePDFUrl(lectureId);
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    cachedLectureIds,
    cacheStats,
    isLoading,
    cacheLecture,
    removeCachedLecture,
    clearAllCache,
    isCached,
    getOfflinePDFUrl,
    formatSize,
  };
};
