/**
 * Cache Version Manager
 * 
 * Manages app version and cache invalidation across deployments.
 * Automatically clears all caches when a new version is detected.
 * PRESERVES PDF caches so users don't lose downloaded lectures.
 */

const CACHE_VERSION_KEY = 'app_cache_version';
const CACHE_CLEARED_KEY = 'cache_cleared_for_version';

export class CacheVersionManager {
    /**
     * Get the current app version from build-time environment variable
     */
    static getAppVersion(): string {
        // Vite injects this at build time
        return import.meta.env.VITE_APP_VERSION || 'dev';
    }

    /**
     * Get the stored cache version from localStorage
     */
    static getStoredVersion(): string | null {
        try {
            return localStorage.getItem(CACHE_VERSION_KEY);
        } catch (error) {
            console.error('Error reading cache version:', error);
            return null;
        }
    }

    /**
     * Store the current app version in localStorage
     */
    static setStoredVersion(version: string): void {
        try {
            localStorage.setItem(CACHE_VERSION_KEY, version);
            console.log('📌 Cache version set to:', version);
        } catch (error) {
            console.error('Error storing cache version:', error);
        }
    }

    /**
     * Check if cache needs to be cleared due to version mismatch
     */
    static needsCacheClear(): boolean {
        const currentVersion = this.getAppVersion();
        const storedVersion = this.getStoredVersion();

        // First time visit or version mismatch
        if (!storedVersion || storedVersion !== currentVersion) {
            console.log('🔄 Version mismatch detected:', {
                stored: storedVersion,
                current: currentVersion
            });
            return true;
        }

        return false;
    }

    /**
     * Clear all caches (Service Worker, LocalStorage data)
     * BUT preserve PDF caches so users don't lose downloaded lectures
     */
    static async clearAllCaches(): Promise<void> {
        const currentVersion = this.getAppVersion();

        console.log('🧹 Clearing all caches for version:', currentVersion);

        try {
            // 1. Clear Service Worker caches (EXCEPT PDF cache)
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                console.log('📦 Found caches:', cacheNames);

                // Separate PDF caches from other caches
                const pdfCaches: string[] = [];
                const otherCaches: string[] = [];

                cacheNames.forEach(cacheName => {
                    // Preserve both old versioned and new persistent PDF caches
                    if (cacheName.includes('pdf-storage')) {
                        pdfCaches.push(cacheName);
                    } else {
                        otherCaches.push(cacheName);
                    }
                });

                // Delete only non-PDF caches
                await Promise.all(
                    otherCaches.map(cacheName => {
                        console.log('🗑️ Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );

                console.log('✅ Service Worker caches cleared (preserved', pdfCaches.length, 'PDF caches)');
                if (pdfCaches.length > 0) {
                    console.log('📚 Preserved PDF caches:', pdfCaches);
                }
            }

            // 2. Clear LocalStorage data caches (but preserve user settings)
            const preserveKeys = [
                'theme',
                'color_template',
                'custom_colors',
                CACHE_VERSION_KEY,
                CACHE_CLEARED_KEY,
                'lms_offline_session' // Preserve user session
            ];

            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !preserveKeys.includes(key)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log('🗑️ Removed localStorage key:', key);
            });
            console.log('✅ LocalStorage data caches cleared');

            // 3. DO NOT clear IndexedDB - it contains user-downloaded PDFs
            // The IndexedDB (LectureCache) should persist across versions
            // so users don't lose their downloaded lectures
            console.log('📚 Preserving IndexedDB (user-downloaded PDFs)');

            // 4. Update version
            this.setStoredVersion(currentVersion);
            localStorage.setItem(CACHE_CLEARED_KEY, currentVersion);

            console.log('✅ All caches cleared successfully (PDFs preserved)');
        } catch (error) {
            console.error('❌ Error clearing caches:', error);
            throw error;
        }
    }

    /**
     * Initialize cache version check on app startup
     */
    static async initialize(): Promise<boolean> {
        console.log('🚀 Initializing cache version manager');

        const currentVersion = this.getAppVersion();
        const storedVersion = this.getStoredVersion();

        console.log('📊 Version info:', {
            current: currentVersion,
            stored: storedVersion,
            needsClear: this.needsCacheClear()
        });

        if (this.needsCacheClear()) {
            try {
                await this.clearAllCaches();
                this.showUpdateNotification();
                return true; // Cache was cleared
            } catch (error) {
                console.error('Failed to clear caches:', error);
                // Still update version to prevent infinite loops
                this.setStoredVersion(currentVersion);
                return false;
            }
        } else {
            console.log('✅ Cache version is current, no clear needed');
            return false; // Cache was not cleared
        }
    }

    /**
     * Show a notification to the user about cache update
     */
    static showUpdateNotification(): void {
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 10000;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 90%;
      text-align: center;
      animation: slideUp 0.3s ease-out;
    `;

        notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
        <span style="font-size: 20px;">🔄</span>
        <span>App updated! Your downloaded lectures are safe.</span>
      </div>
    `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s ease-out';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 4000);
    }

    /**
     * Get version info for debugging
     */
    static getVersionInfo(): {
        appVersion: string;
        storedVersion: string | null;
        needsCacheClear: boolean;
        lastCacheCleared: string | null;
    } {
        return {
            appVersion: this.getAppVersion(),
            storedVersion: this.getStoredVersion(),
            needsCacheClear: this.needsCacheClear(),
            lastCacheCleared: localStorage.getItem(CACHE_CLEARED_KEY)
        };
    }

    /**
     * Force clear all caches INCLUDING PDFs (for debugging or manual reset)
     */
    static async forceClearAll(): Promise<void> {
        console.log('⚠️ Force clearing ALL caches (including PDFs)');

        // Clear ALL Service Worker caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // Clear ALL LocalStorage
        localStorage.clear();

        // Clear IndexedDB
        if ('indexedDB' in window) {
            try {
                const databases = await indexedDB.databases();
                for (const db of databases) {
                    if (db.name) {
                        indexedDB.deleteDatabase(db.name);
                    }
                }
            } catch (error) {
                console.warn('Could not clear IndexedDB:', error);
            }
        }

        console.log('✅ Force clear completed - all data removed');
    }
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
    (window as any).CacheVersionManager = CacheVersionManager;
}
