import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const localServer = { host: '127.0.0.1', port: 3001, strictPort: true }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'API_PROXY_TARGET')
  const target = env.API_PROXY_TARGET || 'http://127.0.0.1:8000'
  const proxy = { '/api': target, '/storage': target }

  return {
    plugins: [react()],
    server: { ...localServer, proxy },
    preview: localServer,
  }
})
