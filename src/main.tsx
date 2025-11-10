import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Initialize theme before rendering the app
import './utils/themeInit';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline support
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('🔄 New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline');
  },
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    console.log('✅ Service Worker registered:', registration);
  },
  onRegisterError(error: any) {
    console.error('❌ Service Worker registration failed:', error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
