// 把 docs/showcase-src/one-pager/one-pager.html 导出为 docs/one-pager/ 下的 PDF 与 PNG
// 用法：node docs/showcase-src/render-one-pager.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC = path.resolve('docs/showcase-src/one-pager/one-pager.html');
const OUT = path.resolve('docs/one-pager');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(SRC).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
await page.pdf({ path: path.join(OUT, 'harness-one-pager.pdf'), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await page.locator('.canvas').screenshot({ path: path.join(OUT, 'harness-one-pager.png') });
await browser.close();
console.log('rendered docs/one-pager/harness-one-pager.pdf / .png');
