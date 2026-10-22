import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/price': {
        target: 'http://api.favorit-parts.ru',
        changeOrigin: true,
        rewrite: () => '/hs/hsprice/',
      },
    },
  },
})
