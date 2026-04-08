import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 5173,
 
    // This is the fix — tells Vite to serve index.html for any URL
    // that doesn't match a real file, so React Router can handle it.
    // Without this, refreshing /aspects or /analytics makes Vite 404.
    historyApiFallback: true,
 
    // Proxy API calls to Django so you don't get CORS errors in dev.
    // With this, your frontend calls /api/... and Vite forwards them
    // to Django at port 8000 automatically.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
