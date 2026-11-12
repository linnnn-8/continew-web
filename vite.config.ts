import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 개발 중 /api 요청을 백엔드(continew-server)로 넘겨 CORS를 피한다
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
