# 多仓库移植指南（Multi-Repo Adaptation)

把本 Harness 移植到另一个仓库的步骤清单：

## 1. 复制骨架

```bash
cp -r .cursor <target>/
cp -r .harness <target>/
rm -rf <target>/.harness/deliverables/* <target>/.harness/memory/entries/*
```

## 2. 重置业务知识（必须重做）

| 项 | 动作 |
|----|------|
| `specs/` | 删除所有域文件，按新仓库业务域重建（先只建 `_index.md` 骨架） |
| `codebase-guide/` | 运行 `/codebase-guide-init` 重新生成六文档 |
| `memory/` | 清空 entries，保留 templates 与 index.md 表头 |
| `baseline.json` | 运行 `.harness/scripts/baseline.sh --update` 重新记录 |
| `tasks/board.md` | 清空表体，保留表头 |

## 3. 适配硬门禁脚本

- `verify.sh` 中与技术栈耦合的检查（ESM/require、RTK Query、React 规范）按新栈改写；保留通用项（300 行、console.log、模板残留、编号唯一）。
- `backend-smoke.sh` / `ensure-mongodb.sh` 按新仓库启动方式改写。
- `check-harness.sh` 一般无需改动（只校验 Harness 自身结构）。

## 4. 适配 rules

- `code-standards.mdc` 全部重写为新仓库编码规范（globs 也要改）。
- `harness-core.mdc` / `workflow-discipline.mdc` 与业务无关，可原样保留（三步验证命令按新仓库改）。

## 5. 验收

```bash
bash .harness/scripts/check-harness.sh   # 结构完整性 90+ 项全过
bash .harness/scripts/verify.sh          # 19 项全 PASS
```

跑一个 quick 档试点任务走完 propose → apply → archive 全链路，确认 hooks 旁路结果文件正常产出。
