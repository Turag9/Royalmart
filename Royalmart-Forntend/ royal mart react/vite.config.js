import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Manual chunks group big shared libs into their own files so the main app
// chunk stays small and pages that don't touch them don't pull them in.
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios'],
          charts: ['recharts'],
          icons: ['react-icons'],
          emailjs: ['@emailjs/browser']
        }
      }
    }
  }
});
