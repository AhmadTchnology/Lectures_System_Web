import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/upload': {
        target: 'http://n8n-utech.utopiatech.dpdns.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/upload/, '/webhook-test/upload-to-zipline'),
      },
    },
  },
});
