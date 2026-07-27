import { defineConfig } from 'vitest/config';

// 后端测试配置 —— npm test
export default defineConfig({
  test: {
    environment: 'node',
    include: ['backend/tests/**/*.test.js'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
