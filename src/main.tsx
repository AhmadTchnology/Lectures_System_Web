import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/themeInit';
import { registerSW } from 'virtual:pwa-register';
import { CacheVersionManager } from './utils/cacheVersion';

// Initialize cache version check BEFORE anything else
(async () => {
  console.log('🚀 Starting app initialization...');

  try {
    // Check and clear outdated caches
    const cacheCleared = await CacheVersionManager.initialize();

    if (cacheCleared) {
      console.log('✅ Cache cleared due to version update');
    } else {
      console.log('✅ Cache version is current');
    }
  } catch (error) {
    console.error('❌ Error during cache initialization:', error);
  }

  // Register service worker with auto-update
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('🔄 New service worker version available, updating...');
      // Auto-reload on update
      updateSW(true);
    },
    onOfflineReady() {
      const notification = document.createElement('div');
      notification.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:8px;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
      notification.textContent = '✅ App ready to work offline';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error: any) {
      console.error('SW registration failed:', error);
    }
  });

  // Show cache info on load (for debugging)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.ready.then(() => {
        if (navigator.onLine) {
          caches.keys().then(cacheNames => {
            console.log('📦 Active caches:', cacheNames);

            // Count cached PDFs
            const pdfCacheName = cacheNames.find(name => name.includes('pdf-storage'));
            if (pdfCacheName) {
              caches.open(pdfCacheName).then(cache => {
                cache.keys().then(keys => {
                  if (keys.length > 0) {
                    console.log(`📚 ${keys.length} PDFs cached for offline`);
                  }
                });
              });
            }
          });
        }
      });
    });
  }

  // Render the app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
})();
