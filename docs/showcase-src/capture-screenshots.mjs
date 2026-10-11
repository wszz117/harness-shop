// 生成 README / 落地页使用的真实产品截图
// 前置：npm run data:import && npm run dev（前端 localhost:3000 / 后端 5001）
// 用法：node docs/showcase-src/capture-screenshots.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const OUT = path.resolve('docs/images/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const shot = async (page, name, opts = {}) => {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), animations: 'disabled', ...opts });
  console.log('saved', name);
};

const browser = await chromium.launch();
const desktop = { viewport: { width: 1280, height: 800 }, locale: 'zh-CN', deviceScaleFactor: 1 };

// 1. 首页（中文，汇率正常）
let ctx = await browser.newContext(desktop);
let page = await ctx.newPage();
await page.goto(`${BASE}/`);
await page.getByTestId('cny-ref').first().waitFor();
await shot(page, '01-home-zh');

// 2. 商品详情（含真实评价）
await page.getByTestId('product-card').nth(3).getByRole('link').first().click();
await page.getByTestId('add-to-cart').waitFor();
await shot(page, '02-product-detail', { fullPage: true });

// 3. 购物车（2 件商品）
await page.getByTestId('add-to-cart').click();
await page.goto(`${BASE}/`);
await page.getByTestId('product-card').nth(0).getByRole('link').first().click();
await page.getByTestId('add-to-cart').click();
await page.getByTestId('cart-item').first().waitFor();
await shot(page, '03-cart');

// 4. 英文界面
await page.goto(`${BASE}/`);
await page.getByTestId('lang-switch').click();
await page.getByTestId('cny-ref').first().waitFor();
await shot(page, '04-home-en');
await ctx.close();

// 5. 管理后台（管理员登录）
ctx = await browser.newContext(desktop);
page = await ctx.newPage();
await page.goto(`${BASE}/login`);
await page.getByTestId('login-email').fill('admin@example.com');
await page.getByTestId('login-password').fill('123456');
await page.getByTestId('login-submit').click();
await page.waitForURL((u) => !u.pathname.startsWith('/login'));
await page.goto(`${BASE}/admin/productlist`);
await page.getByRole('table').waitFor();
await shot(page, '05-admin-products');
await ctx.close();

// 6. 手机端首页
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-CN', isMobile: true, hasTouch: true });
page = await ctx.newPage();
await page.goto(`${BASE}/`);
await page.getByTestId('cny-ref').first().waitFor();
await shot(page, '06-mobile-home');
await ctx.close();

await browser.close();
