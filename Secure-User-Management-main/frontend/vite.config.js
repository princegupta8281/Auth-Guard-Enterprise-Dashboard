import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8081'

  return {
    base: env.VITE_BASE_PATH || (command === 'build' ? '/frontend/' : '/'),
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: '../src/main/resources/static/frontend',
      emptyOutDir: true,
    },
  }
})
