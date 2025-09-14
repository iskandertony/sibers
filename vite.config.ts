import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/sibers/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/__users': {
        target: 'https://hr2.sibers.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__users/, ''),
      },
    },
  },
})
