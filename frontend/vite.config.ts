import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const backendTarget = env.VITE_DEV_BACKEND || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // 允许局域网/公网访问
      allowedHosts: true, // 允许通过任意域名/内网穿透访问
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      }
    }
  }
})
