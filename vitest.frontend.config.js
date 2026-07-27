import { defineConfig } from 'vitest/config';

// 前端测试配置 —— npm run test:frontend（根目录运行，避免依赖 @vitejs/plugin-react 的安装位置，直接用 esbuild 处理 JSX）
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    include: /\.[jt]sx?$/,
    loader: 'jsx',
  },
  test: {
    environment: 'jsdom',
    include: ['frontend/src/tests/**/*.test.{js,jsx}'],
    setupFiles: ['frontend/src/tests/setupTests.js'],
    globals: true,
    css: false,
  },
});
