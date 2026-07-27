# /harness-archive — 归档与知识合并

`$input` = `"<英文任务名>"`。前置：人工审批 2 已确认（用户运行本命令即视为确认）。

## 执行流程（PM 独自执行，仍按心跳纪律）

1. **关闭工单**：确认 test-report.md 结论 PASS；`[PM] 脚本事件: 关闭工单 <name>`。
2. **Spec Merge**（§6.1 操作者模型）：读 requirements.md「Spec Delta」表 → 逐行落实到 `.harness/specs/<域>.md`（编号契约：商品/订单/用户等核心领域独立文件）。无 Delta → 心跳记 N/A。
   `[PM] 脚本事件: Spec Merge → <N 行落实|N/A>`
3. **Memory Merge**（§6.2 单一作者模型）：只扫 dev-log.md「## 可复用经验」节 → 按 `memory/templates/entry.md` 落条目 + index.md 加行。N 条或 N/A。
4. **归档**：
   ```bash
   mv .harness/deliverables/$input/ .harness/deliverables/_archive/$input/
   if [ -d ".playwright-cli_tasks/$input" ]; then
     mv ".playwright-cli_tasks/$input" ".harness/deliverables/_archive/$input/evidence"
   fi
   python3 .harness/scripts/check-e2e-evidence.py rewrite-archived "$input"
   ```
5. **board 收口**：阶段=交付完成，状态=DONE，结论=Spec Merge+归档。
   `[PM] ✓ 任务 <name> 已归档 → DONE`
