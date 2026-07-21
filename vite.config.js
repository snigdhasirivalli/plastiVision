import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api/* requests to Flask backend during development
      // Flask routes are at http://localhost:5000/api/* (url_prefix="/api")
      // So we forward WITHOUT stripping the /api prefix.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // No rewrite: /api/predict → http://localhost:5000/api/predict ✓
      },
    },
  },
})
