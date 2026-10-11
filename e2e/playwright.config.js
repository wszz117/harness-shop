// Playwright E2E 配置（真实浏览器，前端 3000 / 后端 5001）
// 默认用 localhost：Vite 在部分 Node 版本下只监听 IPv6 回环，127.0.0.1 会连不上
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.js',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [['line']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    viewport: { width: 1280, height: 800 },
    locale: 'zh-CN',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
