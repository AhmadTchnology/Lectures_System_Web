import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Generate build version (timestamp)
const buildVersion = new Date().getTime().toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      // Automatically cleanup outdated caches
      workbox: {
        cleanupOutdatedCaches: true,
        // Use version-based cache names
        cacheId: `lms-v${buildVersion}`,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: `google-fonts-v${buildVersion}`,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: `gstatic-fonts-v${buildVersion}`,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/utech-storage\.utopiatech\.dpdns\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pdf-storage-persistent', // Non-versioned - persists across updates
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              fetchOptions: {
                mode: 'cors',
                credentials: 'omit'
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: `firebase-v${buildVersion}`,
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: `firebase-data-v${buildVersion}`,
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
      },
      manifest: {
        name: 'Lecture Management System',
        short_name: 'LMS',
        description: 'Offline-capable Lecture Management System for University',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        categories: ['education', 'productivity'],
        screenshots: [],
        shortcuts: [
          {
            name: 'View Lectures',
            short_name: 'Lectures',
            description: 'Browse available lectures',
            url: '/?view=lectures',
            icons: [{ src: '/vite.svg', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  // Inject build version as environment variable
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(buildVersion)
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
