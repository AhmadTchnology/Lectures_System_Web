import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/themeInit';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Auto-reload on update instead of prompting
    console.log('🔄 New version available, updating...');
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
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error: any) {
    console.error('SW registration failed:', error);
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then(() => {
      if (navigator.onLine) {
        caches.open('pdf-storage-cache').then(cache => {
          cache.keys().then(keys => {
            if (keys.length > 0) {
              const notification = document.createElement('div');
              notification.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
              notification.textContent = `📚 ${keys.length} lectures cached for offline`;
              document.body.appendChild(notification);
              setTimeout(() => notification.remove(), 3000);
            }
          });
        });
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
