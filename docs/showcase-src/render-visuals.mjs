// 把 docs/showcase-src/visuals/*.html 渲染为 docs/images/showcase/*.png
// 用法：node docs/showcase-src/render-visuals.mjs [名称前缀...]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC = path.resolve('docs/showcase-src/visuals');
const OUT = path.resolve('docs/images/showcase');
fs.mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
const files = fs.readdirSync(SRC)
  .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
  .filter((f) => only.length === 0 || only.some((p) => f.startsWith(p)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 2 });
for (const f of files) {
  await page.goto(pathToFileURL(path.join(SRC, f)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  const canvas = page.locator('.canvas').first();
  const out = path.join(OUT, f.replace(/\.html$/, '.png'));
  await canvas.screenshot({ path: out });
  console.log('rendered', path.relative(process.cwd(), out));
}
await browser.close();
