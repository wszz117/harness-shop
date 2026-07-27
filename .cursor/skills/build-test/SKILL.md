---
name: build-test
description: 构建与单测全量验证 SOP（后端单测 + 前端单测 + 前端构建，全过才 PASS）
---

# build-test — 构建与测试验证

## 执行步骤（顺序执行，全过才 PASS）

1. **后端单测**：
   ```bash
   npm test
   ```
   退出码非 0 → FAIL，记录失败用例名与首个断言差异。
2. **前端单测**：
   ```bash
   npm run test:frontend
   ```
3. **前端构建**：
   ```bash
   cd frontend && npm run build
   ```
   失败时只看**尾部 20 行**定位第一个 error。

## 判定

- 三步退出码全 0 → **PASS**。
- 任一非 0 → **FAIL**：进入 systematic-debug skill，禁止跳过或弱化测试来"变绿"。

## 输出格式

| 步骤 | 命令 | 退出码 | 关键输出 |
|------|------|--------|---------|
| 后端单测 | npm test | 0 | Tests N passed |
| 前端单测 | npm run test:frontend | 0 | Tests N passed |
| 前端构建 | npm run build | 0 | built in Xs |
