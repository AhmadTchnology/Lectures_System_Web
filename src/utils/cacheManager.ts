// Cache Manager for Lecture PDFs and Data
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LectureCacheDB extends DBSchema {
  lectures: {
    key: string;
    value: {
      id: string;
      title: string;
      subject: string;
      stage: string;
      pdfUrl: string;
      uploadedBy: string;
      uploadDate: string;
      cachedAt: number;
      accessCount: number;
      lastAccessed: number;
      pdfBlob?: Blob;
    };
    indexes: {
      'by-accessCount': number;
      'by-lastAccessed': number;
    };
  };
  cacheMetadata: {
    key: string;
    value: {
      key: string;
      totalSize: number;
      lectureCount: number;
      lastCleanup: number;
    };
  };
}

const DB_NAME = 'LectureCache';
const DB_VERSION = 1;
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_CACHED_LECTURES = 20;

class CacheManager {
  private db: IDBPDatabase<LectureCacheDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<LectureCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create lectures store
        const lectureStore = db.createObjectStore('lectures', { keyPath: 'id' });
        lectureStore.createIndex('by-accessCount', 'accessCount');
        lectureStore.createIndex('by-lastAccessed', 'lastAccessed');

        // Create metadata store
        db.createObjectStore('cacheMetadata', { keyPath: 'key' });
      },
    });

    // Initialize metadata if not exists
    const metadata = await this.db.get('cacheMetadata', 'metadata');
    if (!metadata) {
      await this.db.put('cacheMetadata', {
        key: 'metadata',
        totalSize: 0,
        lectureCount: 0,
        lastCleanup: Date.now(),
      });
    }
  }

  async cacheLecture(lecture: {
    id: string;
    title: string;
    subject: string;
    stage: string;
    pdfUrl: string;
    uploadedBy: string;
    uploadDate: string;
  }): Promise<boolean> {
    try {
      await this.init();
      if (!this.db) return false;

      console.log('📥 Starting cache for:', lecture.title);

      // Check if already cached
      const existing = await this.db.get('lectures', lecture.id);
      if (existing?.pdfBlob) {
        console.log('✅ Already cached:', lecture.title);
        // Update access count
        await this.updateAccessStats(lecture.id);
        return true;
      }

      console.log('🌐 Fetching PDF from:', lecture.pdfUrl);
      // Fetch PDF with mode 'cors' to handle cross-origin requests
      const response = await fetch(lecture.pdfUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        console.error('❌ Failed to fetch PDF:', response.status, response.statusText);
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }

      const pdfBlob = await response.blob();
      const pdfSize = pdfBlob.size;
      console.log('✅ PDF downloaded:', (pdfSize / 1024 / 1024).toFixed(2), 'MB');

      // Check cache size limits
      await this.ensureCacheSpace(pdfSize);

      // Save to IndexedDB
      await this.db.put('lectures', {
        ...lecture,
        pdfBlob,
        cachedAt: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now(),
      });

      console.log('✅ Saved to cache:', lecture.title);

      // Update metadata
      await this.updateMetadata(pdfSize, 1);

      return true;
    } catch (error) {
      console.error('❌ Error caching lecture:', error);
      return false;
    }
  }

  async getCachedLecture(lectureId: string): Promise<{
    lecture: any;
    pdfBlob: Blob | null;
  } | null> {
    try {
      await this.init();
      if (!this.db) return null;

      const lecture = await this.db.get('lectures', lectureId);
      if (!lecture) return null;

      // Update access stats
      await this.updateAccessStats(lectureId);

      return {
        lecture,
        pdfBlob: lecture.pdfBlob || null,
      };
    } catch (error) {
      console.error('Error getting cached lecture:', error);
      return null;
    }
  }

  async isCached(lectureId: string): Promise<boolean> {
    try {
      await this.init();
      if (!this.db) return false;

      const lecture = await this.db.get('lectures', lectureId);
      return !!lecture?.pdfBlob;
    } catch (error) {
      return false;
    }
  }

  async removeCachedLecture(lectureId: string): Promise<boolean> {
    try {
      await this.init();
      if (!this.db) return false;

      const lecture = await this.db.get('lectures', lectureId);
      if (!lecture) return false;

      const size = lecture.pdfBlob?.size || 0;
      await this.db.delete('lectures', lectureId);

      // Update metadata
      await this.updateMetadata(-size, -1);

      return true;
    } catch (error) {
      console.error('Error removing cached lecture:', error);
      return false;
    }
  }

  async getAllCachedLectures(): Promise<string[]> {
    try {
      await this.init();
      if (!this.db) return [];

      const lectures = await this.db.getAll('lectures');
      return lectures.filter(l => l.pdfBlob).map(l => l.id);
    } catch (error) {
      console.error('Error getting cached lectures:', error);
      return [];
    }
  }

  async getCacheStats(): Promise<{
    totalSize: number;
    lectureCount: number;
    lectures: Array<{
      id: string;
      title: string;
      size: number;
      accessCount: number;
      lastAccessed: number;
    }>;
  }> {
    try {
      await this.init();
      if (!this.db) {
        return { totalSize: 0, lectureCount: 0, lectures: [] };
      }

      const metadata = await this.db.get('cacheMetadata', 'metadata');
      const lectures = await this.db.getAll('lectures');

      const lectureStats = lectures
        .filter(l => l.pdfBlob)
        .map(l => ({
          id: l.id,
          title: l.title,
          size: l.pdfBlob?.size || 0,
          accessCount: l.accessCount,
          lastAccessed: l.lastAccessed,
        }));

      return {
        totalSize: metadata?.totalSize || 0,
        lectureCount: metadata?.lectureCount || 0,
        lectures: lectureStats,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalSize: 0, lectureCount: 0, lectures: [] };
    }
  }

  async clearAllCache(): Promise<boolean> {
    try {
      await this.init();
      if (!this.db) return false;

      await this.db.clear('lectures');
      await this.db.put('cacheMetadata', {
        key: 'metadata',
        totalSize: 0,
        lectureCount: 0,
        lastCleanup: Date.now(),
      });

      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  private async updateAccessStats(lectureId: string): Promise<void> {
    if (!this.db) return;

    const lecture = await this.db.get('lectures', lectureId);
    if (!lecture) return;

    await this.db.put('lectures', {
      ...lecture,
      accessCount: (lecture.accessCount || 0) + 1,
      lastAccessed: Date.now(),
    });
  }

  private async ensureCacheSpace(requiredSize: number): Promise<void> {
    if (!this.db) return;

    const metadata = await this.db.get('cacheMetadata', 'metadata');
    const currentSize = metadata?.totalSize || 0;
    const currentCount = metadata?.lectureCount || 0;

    // Check if we need to free space
    if (
      currentSize + requiredSize > MAX_CACHE_SIZE ||
      currentCount >= MAX_CACHED_LECTURES
    ) {
      await this.cleanupOldCache(requiredSize);
    }
  }

  private async cleanupOldCache(requiredSize: number): Promise<void> {
    if (!this.db) return;

    // Get all lectures sorted by access count and last accessed
    const lectures = await this.db.getAll('lectures');
    const sortedLectures = lectures
      .filter(l => l.pdfBlob)
      .sort((a, b) => {
        // Prioritize by access count, then by last accessed
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount;
        }
        return a.lastAccessed - b.lastAccessed;
      });

    let freedSize = 0;
    let freedCount = 0;

    // Remove least accessed lectures until we have enough space
    for (const lecture of sortedLectures) {
      if (freedSize >= requiredSize && freedCount >= 1) break;

      const size = lecture.pdfBlob?.size || 0;
      await this.db.delete('lectures', lecture.id);
      freedSize += size;
      freedCount++;
    }

    // Update metadata
    await this.updateMetadata(-freedSize, -freedCount);
  }

  private async updateMetadata(sizeDelta: number, countDelta: number): Promise<void> {
    if (!this.db) return;

    const metadata = await this.db.get('cacheMetadata', 'metadata');
    if (!metadata) return;

    await this.db.put('cacheMetadata', {
      key: 'metadata',
      totalSize: Math.max(0, metadata.totalSize + sizeDelta),
      lectureCount: Math.max(0, metadata.lectureCount + countDelta),
      lastCleanup: metadata.lastCleanup,
    });
  }

  async getOfflinePDFUrl(lectureId: string): Promise<string | null> {
    try {
      console.log('💾 Retrieving offline PDF:', lectureId);
      const cached = await this.getCachedLecture(lectureId);
      if (!cached?.pdfBlob) {
        console.log('❌ No cached PDF found for:', lectureId);
        return null;
      }

      const url = URL.createObjectURL(cached.pdfBlob);
      console.log('✅ Created blob URL:', url.substring(0, 50) + '...');
      return url;
    } catch (error) {
      console.error('❌ Error creating offline PDF URL:', error);
      return null;
    }
  }
}

export const cacheManager = new CacheManager();
