# evidence/

本目录为归档任务 exchange-rate-cache-fallback 的 E2E 证据截图，由 `e2e/tests/fx.e2e.js` 与 `e2e/tests/home.e2e.js` 在真实浏览器（Playwright chromium，1280×800）中执行时自动截取。

| 文件 | 对应用例 | 画面要点 |
|------|---------|---------|
| B-E2E-01-fresh-ref-price.png | B-E2E-01 / FX-S-001 | 商品卡「$89.99 ≈ ¥652.43」，无横幅 |
| B-E2E-02-cached-banner.png | B-E2E-02 / FX-S-002, 004 | Header 下方黄色横幅「当前显示为缓存汇率」，参考价保留 |
| B-E2E-03-unavailable-hidden.png | B-E2E-03 / FX-S-003, 005 | 灰色横幅「汇率暂不可用」，只显示美元价 |
| B-E2E-03-add-to-cart-ok.png | B-E2E-03 / FX-S-005 | 汇率不可用时仍可加购，购物车 1 件 |
| C-E2E-01-home-regression.png | C-E2E-01 | 首页回归 |

重新生成：

```bash
E2E_EVIDENCE_DIR=.harness/deliverables/_archive/exchange-rate-cache-fallback/evidence \
  npx playwright test -c e2e/playwright.config.js
python3 .harness/scripts/check-e2e-evidence.py check-archived exchange-rate-cache-fallback
```

> v1.0 版本中本目录为 1×1 占位 PNG。v1.1 起 `check-e2e-evidence.py` 会拒绝宽或高小于 200 像素、或小于 5 KB 的图片，并已接入 `check-harness.sh`。
