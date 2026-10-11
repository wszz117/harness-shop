// 由 visuals/v3-interception.html 逐帧生成 docs/images/showcase/v3-interception.gif
// 用法：node docs/showcase-src/render-interception-gif.mjs（需要 python3 + Pillow）
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC = path.resolve('docs/showcase-src/visuals/v3-interception.html');
const OUT = path.resolve('docs/images/showcase/v3-interception.gif');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'v3-frames-'));
// 每一帧显示到第几步，以及停留毫秒数
const FRAMES = [[0, 1500], [1, 800], [2, 650], [3, 650], [4, 650], [5, 1800], [6, 1800], [7, 3800]];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1300, height: 1100 }, deviceScaleFactor: 1 });
const list = [];
for (const [i, [step, ms]] of FRAMES.entries()) {
  await page.goto(`${pathToFileURL(SRC).href}?step=${step}`);
  await page.evaluate(() => document.fonts.ready);
  const f = path.join(TMP, `f${String(i).padStart(2, '0')}.png`);
  await page.locator('.canvas').screenshot({ path: f });
  list.push([f, ms]);
}
await browser.close();

const py = `
import json, sys
from PIL import Image
frames = json.loads(sys.argv[1]); out = sys.argv[2]
imgs = [Image.open(f).convert('RGB') for f, _ in frames]
pal = imgs[-1].quantize(colors=128, method=Image.Quantize.MEDIANCUT)
q = [im.quantize(palette=pal, dither=Image.Dither.NONE) for im in imgs]
q[0].save(out, save_all=True, append_images=q[1:], duration=[ms for _, ms in frames], loop=0, optimize=True, disposal=1)
`;
execFileSync('python3', ['-c', py, JSON.stringify(list), OUT], { stdio: 'inherit' });
fs.rmSync(TMP, { recursive: true, force: true });
console.log('rendered', path.relative(process.cwd(), OUT), `${Math.round(fs.statSync(OUT).size / 1024)} KB`);
