import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 前端 3000, 后端 5001 (对齐 Cloud Agent 环境注意事项: 端口映射 gotcha)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:5001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'build',
  },
});
