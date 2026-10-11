# Test Report: exchange-rate-cache-fallback

> 角色：test-engineer ｜ TE-owned 口径来源：design.md「Testing-only」 ｜ 状态：完成
>
> v1.1 复核修订（2026-10-11）：v1.0 报告引用的 B-E2E 用例在仓库中不存在，证据截图为 1×1 占位文件，参考价「≈ ¥10,406.16」无法复现。本版本由 `e2e/tests/fx.e2e.js` 真实执行生成，截图为浏览器实拍。

## B 类（本任务，与 Scenario 1:1）

| 编号 | ↔ Scenario | 测试描述 | 前置条件 | 预期结果 | 实际结果 | 证据截图 | 判定 |
|------|-----------|---------|---------|---------|---------|---------|------|
| B-E2E-01 | FX-S-001 | 汇率正常时首页商品卡展示 ≈ ¥ 参考价 | 真实后端，内置汇率 7.25 | 接口 200 + available；参考价 = USD × rate；无横幅 | Airpods「$89.99 ≈ ¥652.43」，无横幅 | evidence/B-E2E-01-fresh-ref-price.png | PASS |
| B-E2E-02 | FX-S-002/004 | 接口返回 stale 时横幅提示且参考价保留；接口直接失败（有本地快照）表现相同 | 浏览器网络层把响应改为 state=stale，随后改为请求失败 | Header 下方黄色横幅「当前显示为缓存汇率」，参考价保留 | 两种情况均符合 | evidence/B-E2E-02-cached-banner.png | PASS |
| B-E2E-03 | FX-S-003/005 | 汇率完全不可用时只显示美元价且不影响加购 | 接口返回 503，浏览器无本地快照 | 灰色横幅「汇率暂不可用」；页面无 ¥；可加购进入 /cart | 与预期一致，购物车 1 件 $89.99 | evidence/B-E2E-03-unavailable-hidden.png、evidence/B-E2E-03-add-to-cart-ok.png | PASS |

## C 类（回归）

| 编号 | 相关域 | 测试描述 | 前置条件 | 预期结果 | 实际结果 | 证据截图 | 判定 |
|------|--------|---------|---------|---------|---------|---------|------|
| C-E2E-01 | products / cart / search | home、cart、search 三个回归 spec（4 个用例） | 种子数据 | 商品卡渲染、导航入口、加购、搜索正常 | 4/4 通过 | evidence/C-E2E-01-home-regression.png | PASS |

## 执行记录

```
npx playwright test -c e2e/playwright.config.js
  7 passed
```

## 环境说明

Node v22.13.0；MongoDB 6.0.14（本机 27017）；`npm run dev`（前端 localhost:3000 / 后端 5001）；Playwright 1.61.1 chromium headless，视口 1280×800。B-E2E-02/03 通过 Playwright `page.route` 在浏览器网络层改写 `/api/fx/usd-cny` 的响应来构造降级场景；后端三态本身由 `backend/tests/services/fxService.test.js` 的 13 条用例覆盖。

## 结论

PASS: B 类 3/3 与 Scenario 1:1 全过，C 类回归 4 个用例通过，证据截图 5 张均为真实截图（已通过 `check-e2e-evidence.py check-archived` 校验）。
