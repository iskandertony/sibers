import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy for users.json to avoid CORS issues during local dev.
      '/__users': {
        target: 'https://hr2.sibers.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__users/, ''),
      },
    },
  },
})
