# 子代理编排（Subagent Orchestration）

## 编排模型

PM 是唯一调度者。每一棒通过 `Task` 工具派发，`subagent_type=<worker>` **必须写进 Task 参数**，串行执行，禁止并行抢跑。

```
/harness-propose:  PM ─Task→ BA ─Task→ SA ─Task→ (RR)   [人工审批1]
/harness-apply:    PM ─Task→ Dev ─Task→ CR ─Task→ TE     [人工审批2]
/harness-archive:  PM 独自执行（Spec Merge / Memory Merge / mv 归档）
```

## Task 派发参数契约

派发 prompt 首条必须包含：

| 字段 | 说明 |
|------|------|
| TASK_NAME | 任务 slug |
| PROFILE | quick / standard / refactor |
| 就绪依据 | 哪份文档的哪个「## 结论 PASS」 |
| 上一轮结论 | 重跑（回退重派）时必须携带上一轮 FAIL/REJECT 的结论全文 |
| 必读 | `.harness/agents/<role>.md` 的绝对指向 |
| 产出物路径 | `deliverables/<task>/<doc>.md` |

## 信息单向流（接力赛规则）

- 上游文档一旦进入下游棒次即**冻结**；下游只能读，不能改。
- 发现上游文档问题 → 通过 PM 回退（见 agents/project-manager.md §8 回退规则表），禁止下游直接修改上游文档。

## Hook 旁路验证

- 子代理停止（subagentStop）时触发 `.cursor/hooks/dispatch-subagent.py`。
- developer 停止 → 旁路并行跑前后端测试 + verify.sh + baseline.sh，结果写 `.harness/.hook-results/<task>/developer.json`。
- test-engineer 停止 → 旁路校验 E2E 证据齐全性，结果写 `.harness/.hook-results/<task>/test-engineer.json`。
- 其余角色仅审计（OBSERVE_ONLY_WORKERS），日志写 `.harness/.hook-logs/`。
- PM 读取协议：`cat .harness/.hook-results/<task>/<role>.json`，未出现则 30 秒轮询；HOOK_MISSING 时按日志诊断后手动补跑 verify。

## 心跳与事务

一条 `[PM]` 心跳绑定一个非 Read 的 tool_use（实时事务模型），禁止先干完再补心跳，禁止心跳与动作脱节。
