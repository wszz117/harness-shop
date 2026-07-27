---
name: code-review
description: 代码审查 9 步手册（需求覆盖→覆盖矩阵→TDD 证据→方案一致性→质量与技术债→13 节报告）
---

# code-review — 审查 9 步手册

## 步骤

1. **读上游**：requirements.md / design.md / readiness-review.md（冻结文档，只读）。
2. **读基准**：`.harness/codebase-guide/` 相关架构文档（一致性对照基准）。
3. **取变更**：`git diff $(git merge-base HEAD main)...HEAD`；无 git 环境则按 dev-log「变更清单」逐文件 Read。
4. **需求覆盖审查**：逐 R/S 编号建表（Scenario | 归属 | 判定 | 证据 文件:行号）。
5. **需求覆盖矩阵**：R/S × W-xx × 文件 三向对照，找出无实现的需求与无需求的实现。
6. **TDD 证据核对**：dev-log「TDD 记录」vs 测试文件实际存在性/断言质量；只有"绿"没有"红"的记录要质疑。
7. **方案一致性**：实现与 design W-xx 逐条对照；偏离必须在 dev-log 有记录，否则判不一致。
8. **质量与技术债**：可读性/重复/边界条件/错误处理/安全（注入、鉴权缺口、敏感信息）/性能明显缺陷。
9. **产出报告**：按 13 节模板写 code-review.md，结论 PASS 或 REJECT（REJECT 必须列 Dev-owned 问题清单，每项给修复方向）。

## 纪律

- 每个问题必须给**文件:行号**证据；无证据不成立。
- 你不改任何文件；需求级疑问写入「遗留风险」由 PM 升级。
