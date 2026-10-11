# Re-verification: exchange-rate-cache-fallback（v1.1 复核记录）

> 复核日期：2026-10-11 ｜ 复核对象：tag `v1.0.0-original`（commit 0d17959）｜ 结果版本：v1.1.0
>
> 目的：把示例任务从"文档上的 PASS"变成"任何人都能在本地复现的 PASS"。本文件记录复核时实际跑出来的结果，所有结论都附有可复现命令。

## 1. 一句话结论

v1.0 的文档链条完整，但有 **3 处"文档说过了、实际没发生"**：汇率接口在真实运行中恒为 503；证据截图是 1×1 占位图；收工 hook 因为统计脚本的 bug 永远判 FAIL。v1.1 修复了代码，**也补强了门禁本身**，并实测证明新门禁能拦住同类问题。

## 2. 复核发现

| # | 发现 | 怎么发现的 | 影响 | v1.1 处理 |
|---|------|-----------|------|----------|
| 1 | `fxService.startAutoRefresh()` 从未被调用 | 启动服务后 `curl /api/fx/usd-cny` 返回 503 | 汇率功能在真实运行中从未生效，但单测全绿 | server.js 接线；backend-smoke.sh 新增接口行为探测 |
| 2 | 4 张证据截图均为 1×1 PNG（约 70 字节） | 读取 PNG 头部尺寸 | 测试报告"截图 4 张齐全"不成立 | 真实 E2E 重新截取 5 张；check-e2e-evidence.py 拒绝占位图 |
| 3 | `baseline.sh` 用 `ls backend/tests/*.test.js` 统计，测试都在子目录 → 恒为 0 | 在 v1.0 代码上直接运行收工 hook | 收工 hook 永远 FAIL，PASS 判定从未真实发生过 | 改为递归统计；新增用例数基线 min_pass |
| 4 | 测试报告引用的 B-E2E-01..03 在 e2e/ 中不存在；参考价「≈ ¥10,406.16」无对应商品价格 | 全仓搜索 + 价格反算 | 测试报告无法复现 | 新增 e2e/tests/fx.e2e.js，报告按真实结果重写 |
| 5 | 契约三套写法：文档 `source: fresh/cached`、spec `stale: true`、代码 `state: available/stale` | 逐文件比对 | 需求—设计—代码追溯断裂 | 统一为 `state: available / stale` |
| 6 | 上游刚失败时仍返回 available（要等 30 分钟才 stale） | 单测构造失败场景 | 与 FX-S-002 不符 | 记录 lastError，失败即 stale |
| 7 | 前端初始无快照即判 unavailable，横幅先闪"不可用" | 浏览器观察首屏 | 与 FX-S-004 不符 | 新增 loading 初始态 |
| 8 | 原 E2E 4 个用例挂 3 个（testid 不存在、默认地址连不上） | 运行 `npm run test:e2e` | 回归测试不可用 | 修正 testid、默认改为 localhost |
| 9 | README 演示账号为 example.com，种子数据为 email.com | 登录接口 401 | 访客无法登录体验 | 种子数据统一为 example.com |
| 10 | 商品显示"12 条评价"但评价为空；商品图为纯色占位 | 打开详情页 | 演示观感差 | 种子脚本按真实评价计算评分；替换为商品图 |

## 3. 门禁拦截实测（核心）

收工 hook 在 developer 子代理结束时自动运行，四项检查任一失败即判 FAIL。下表为本次复核**实际运行**的结果，原始输出见 [hook-results/](hook-results/)。

| 场景 | 做了什么 | 单测 | verify 门禁 | 基线 | 行为冒烟 | 判定 |
|------|---------|------|------------|------|---------|------|
| v1.0 原始代码 | 原版 hook 直接运行 | 50 全过 | 19/19 | FAIL（统计为 0） | 无此项 | **FAIL**（误判） |
| 场景 1：重新注入 v1.0 缺陷 | 注释掉 server.js 的 startAutoRefresh() | 63 全过 | 19/19 | PASS | **503** | **FAIL**（正确拦截） |
| 场景 2：删测试凑绿 | 移走 fxService.test.js | 50 全过 | 19/19 | **5 < 6，50 < 63** | PASS | **FAIL**（正确拦截） |
| v1.1 最终代码 | 正常运行 | 63 全过 | 19/19 | PASS | 200 | **PASS**（13.5 秒） |

场景 1 的意义：**测试全过、静态门禁全过，功能依然可能是坏的**。这正是 v1.0 实际发生过的事，v1.1 的行为冒烟把它变成了一个会被自动拦下的问题。

## 4. 证据截图校验实测

v1.0 证据目录运行新版校验：

```
[FAIL] exchange-rate-cache-fallback 证据截图不合格:
  - evidence/B-E2E-01-fresh-ref-price.png: 尺寸 1x1 过小（疑似占位图，要求 >= 200x200）
  - evidence/B-E2E-02-cached-banner.png: 尺寸 1x1 过小（疑似占位图，要求 >= 200x200）
  - evidence/B-E2E-03-unavailable-hidden.png: 尺寸 1x1 过小（疑似占位图，要求 >= 200x200）
  - evidence/C-E2E-01-home-regression.png: 尺寸 1x1 过小（疑似占位图，要求 >= 200x200）
```

v1.1 真实截图（1280×800，45–235 KB）：

```
[OK] exchange-rate-cache-fallback: 5 张证据截图全部存在且为真实截图
```

## 5. 数字前后对比

| 指标 | v1.0（实测） | v1.1（实测） |
|------|------------|------------|
| 汇率接口 `/api/fx/usd-cny` | 503 | 200 `state: available` |
| 后端单测 | 32 | 40 |
| 前端单测 | 18 | 23 |
| E2E 用例 | 4 个，通过 1 | 7 个，全部通过 |
| 证据截图 | 4 张 1×1 占位 | 5 张真实截图 |
| 收工 hook | 恒 FAIL | 正确 PASS / 正确拦截 |
| verify.sh | 19/19 | 19/19 |
| check-harness.sh | 133/133 | 134/134（新增证据真实性检查） |

## 6. 如何复现

```bash
# 1. 单测（无需数据库服务，使用内存 MongoDB）
npm test && npm run test:frontend

# 2. 门禁与体检
bash .harness/scripts/verify.sh
bash .harness/scripts/check-harness.sh
bash .harness/scripts/backend-smoke.sh

# 3. 端到端（需先 npm run data:import && npm run dev）
npx playwright test -c e2e/playwright.config.js

# 4. 收工 hook（与 Cursor 中 developer 子代理结束时触发的完全相同）
echo '{"subagent_type":"developer","prompt":"TASK_NAME=exchange-rate-cache-fallback"}' \
  | python3 .cursor/hooks/dispatch-subagent.py
cat .harness/.hook-results/exchange-rate-cache-fallback/developer.json
```

## 7. 未解决 / 边界

- 快照为进程内存，多实例部署不共享（spec 边界说明已记录）。
- 收工 hook 仍依赖 Cursor 的 subagentStop 事件触发；在其他 IDE 中需手动或在 CI 中运行同等检查（v1.1 已新增 GitHub Actions 工作流）。
