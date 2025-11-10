import React from 'react';
import { Trash, HardDrive, Download } from 'lucide-react';
import { useLectureCache } from '../hooks/useLectureCache';

interface CacheManagerProps {
  onClose: () => void;
}

const CacheManager: React.FC<CacheManagerProps> = ({ onClose }) => {
  const {
    cacheStats,
    isLoading,
    removeCachedLecture,
    clearAllCache,
    formatSize,
  } = useLectureCache();

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all cached lectures? This will free up storage space but you will need to download them again for offline access.')) {
      return;
    }

    const success = await clearAllCache();
    if (success) {
      alert('Cache cleared successfully!');
    } else {
      alert('Failed to clear cache');
    }
  };

  const handleRemoveLecture = async (lectureId: string, title: string) => {
    if (!confirm(`Remove "${title}" from offline cache?`)) {
      return;
    }

    const success = await removeCachedLecture(lectureId);
    if (success) {
      alert('Lecture removed from cache');
    } else {
      alert('Failed to remove lecture from cache');
    }
  };

  const maxCacheSize = 100 * 1024 * 1024; // 100MB
  const usagePercentage = (cacheStats.totalSize / maxCacheSize) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Offline Cache Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Cache Statistics */}
        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive size={24} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold dark:text-white">Storage Usage</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm dark:text-gray-300">
                <span>Used: {formatSize(cacheStats.totalSize)}</span>
                <span>Limit: {formatSize(maxCacheSize)}</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {cacheStats.lectureCount} lecture{cacheStats.lectureCount !== 1 ? 's' : ''} cached
              </div>
            </div>
          </div>
        </div>

        {/* Cached Lectures List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold dark:text-white">Cached Lectures</h3>
            {cacheStats.lectureCount > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isLoading}
                className="btn-danger text-sm flex items-center gap-2"
              >
                <Trash size={16} />
                Clear All
              </button>
            )}
          </div>

          {cacheStats.lectures.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Download size={48} className="mx-auto mb-3 opacity-50" />
              <p>No cached lectures</p>
              <p className="text-sm mt-1">Download lectures for offline access</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {cacheStats.lectures
                .sort((a, b) => b.lastAccessed - a.lastAccessed)
                .map((lecture) => (
                  <div
                    key={lecture.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium dark:text-white truncate">
                        {lecture.title}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div>Size: {formatSize(lecture.size)}</div>
                        <div>Accessed: {lecture.accessCount} time{lecture.accessCount !== 1 ? 's' : ''}</div>
                        <div className="text-xs">
                          Last: {new Date(lecture.lastAccessed).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveLecture(lecture.id, lecture.title)}
                      disabled={isLoading}
                      className="btn-danger ml-3 flex-shrink-0"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            About Offline Cache
          </h4>
          <ul className="space-y-1 text-blue-800 dark:text-blue-400">
            <li>• Downloaded lectures are available offline</li>
            <li>• Cache automatically manages storage (max 100MB)</li>
            <li>• Least accessed lectures are removed when limit is reached</li>
            <li>• Downloads happen in the background</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheManager;
