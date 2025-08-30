// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // your backend server
      '^/assets/Books': 'http://localhost:3000', // proxy only backend book assets (audio files)
    },
  },
  define: {
    // Set API base URL for production
    __API_BASE_URL__: JSON.stringify(process.env.NODE_ENV === 'production' 
      ? 'https://regentportal.onrender.com' 
      : 'http://localhost:3000'),
  },
})