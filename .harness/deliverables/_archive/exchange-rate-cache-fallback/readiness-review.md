# Readiness Review: exchange-rate-cache-fallback

> 角色：readiness-reviewer ｜ 上游：proposal.md, requirements.md, design.md ｜ 状态：完成
>
> v1.1 复核附注（2026-10-11）：上游文档契约已统一为 `state: available / stale`，10 项检查结论不变；新增检查发现 v1.0 遗漏了"启动接线"与"证据真实性"两类问题，已分别由 backend-smoke.sh 行为探测与 check-e2e-evidence.py 截图校验覆盖。

## Checklist

| # | 检查项 | 判定 | 证据/说明 |
|---|--------|------|----------|
| 1 | 需求纯净（无实现细节泄漏） | PASS | requirements.md 仅 GIVEN/WHEN/THEN 行为描述，未出现函数名/文件名 |
| 2 | 编号唯一（含退役列表核对） | PASS | FX-R-001/002、FX-S-001..005 与 specs 全库及退役列表无冲突（spec-lint 通过） |
| 3 | 单域归属明确 | PASS | 全部归 fx（挂 time-signal 支撑域文件），Spec Delta 表一致 |
| 4 | Scenario 全部可验证 | PASS | S-001..003 可 API 断言；S-004/005 有视觉口径 |
| 5 | Spec Delta 与 Scenario 一致 | PASS | Delta 两行覆盖 R-001/R-002 全部 Scenario |
| 6 | W-xx 与 R/S 双向覆盖 | PASS | W-01..06 ↔ FX-S-001..005 矩阵无空洞 |
| 7 | Dev/TE-owned 划分无歧义 | PASS | W-06 独立 TE-owned，其余 Dev-owned |
| 8 | 视觉/交互验收口径写明 | PASS | design「Testing-only」逐条给出横幅位置/样式/文案/截图构图 |
| 9 | 与 codebase-guide 无冲突 | PASS | 遵循 routes→controllers→services 分层与 RTK Query 约定 |
| 10 | profile 与任务规模匹配 | PASS | 新功能改行为 → standard，正确 |

## 结论

PASS: 10/10 项通过，可进入 /harness-apply。
