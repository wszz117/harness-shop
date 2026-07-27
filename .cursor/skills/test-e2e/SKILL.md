---
name: test-e2e
description: Playwright E2E 执行 SOP（环境就绪→数据准备→跑用例→按命名规范截图留证）
---

# test-e2e — E2E 执行手册

## 步骤

1. **进程复用判断**：3000/5001 已有本项目进程 → 复用；否则走启动流程（ensure-mongodb → seeder → npm run dev 后台）。
2. **浏览器就绪**：`bash .harness/scripts/ensure-playwright.sh`。
3. **数据库探活**：`bash .harness/scripts/ensure-mongodb.sh`；需要干净数据 → `npm run data:import`。
4. **跑用例**（Playwright CLI）：
   ```bash
   npx playwright test e2e/tests/<spec>.e2e.js --reporter=line
   ```
   B 类用例与本任务 Scenario 1:1；C 类回归最多 1-2 个相关 spec；**禁止默认全量**。
5. **证据截图**：
   - 目录：`.playwright-cli_tasks/<task>/`
   - 命名：`B-E2E-01-<desc>.png`（编号与报告表格一致）
   - 构图：截**聚焦元素的父层容器**，不截全屏（证据要能看清断言点）。
6. **写报告**：test-report.md 表格逐行填实际结果与截图路径；结论 PASS/FAIL。

## 环境阻塞

环境起不来 → 结论 **FAIL（环境阻塞）**+ 阻塞点说明；禁止佯装通过。
