import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  build: {
    rolldownOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        testing: fileURLToPath(new URL('./testing/index.html', import.meta.url)),
      },
    },
  },
})
