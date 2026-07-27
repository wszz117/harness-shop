# Test Report: exchange-rate-cache-fallback

> 角色：test-engineer ｜ TE-owned 口径来源：design.md「Testing-only」 ｜ 状态：完成

## B 类（本任务，与 Scenario 1:1）

| 编号 | ↔ Scenario | 测试描述 | 前置条件 | 预期结果 | 实际结果 | 证据截图 | 判定 |
|------|-----------|---------|---------|---------|---------|---------|------|
| B-E2E-01 | FX-S-001 | 上游正常时首页商品卡展示 ≈ ¥ 参考价 | mongod+seed，fx 上游 mock 正常 | 商品卡含 CNY 参考价 | 参考价「≈ ¥10,406.16」可见 | evidence/B-E2E-01-fresh-ref-price.png | PASS |
| B-E2E-02 | FX-S-002/004 | 上游断开后横幅提示缓存汇率且参考价保留 | 先成功一次再断开上游 | Header 下方黄色横幅「当前显示为缓存汇率」 | 横幅出现，参考价仍展示 | evidence/B-E2E-02-cached-banner.png | PASS |
| B-E2E-03 | FX-S-003/005 | 无快照且上游不可用时隐藏参考价不影响加购 | 重启后端（清快照）+ 断上游 | 仅 USD 价；横幅「汇率暂不可用」；可加购进 /cart | 与预期一致 | evidence/B-E2E-03-unavailable-hidden.png | PASS |

## C 类（回归，最多 1-2 个相关 spec）

| 编号 | 相关域 | 测试描述 | 前置条件 | 预期结果 | 实际结果 | 证据截图 | 判定 |
|------|--------|---------|---------|---------|---------|---------|------|
| C-E2E-01 | products | 首页加载与搜索回归（home/search spec） | mongod+seed | 商品卡渲染、搜索跳转正常 | 全部通过 | evidence/C-E2E-01-home-regression.png | PASS |

## 环境说明

Node v22 + mongod 7.x 本机 27017；`npm run dev` 前端 3000 / 后端 5001；Playwright chromium headless；fx 上游以 FX_UPSTREAM_URL 指向本地 mock 进行三态切换。

## 结论

PASS: B 类 3/3 与 Scenario 1:1 全过，C 类回归 1 项通过，证据截图 4 张齐全。
