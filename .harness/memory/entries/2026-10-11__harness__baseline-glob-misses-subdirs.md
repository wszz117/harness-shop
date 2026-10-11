---
tags: [baseline, gate, glob, hook, false-red]
---
# 基线脚本只统计顶层目录，收工 hook 永远 FAIL

## 症状（怎么爆的）
在 v1.0 代码上运行 developer 收工 hook：前后端 50 个测试全部通过、verify.sh 19/19 通过，hook 却判 FAIL，原因"基线倒退：后端测试文件 0 < 基线 6"。

## 根因（为什么会发生）
`baseline.sh` 用 `ls backend/tests/*.test.js` 统计后端测试文件，但测试按 controllers/services/utils 放在子目录，顶层 glob 永远匹配 0 个。门禁脚本本身没有被测试过，PASS 判定也从未真实发生过。

## 修复（怎么修）
改为 `find backend/tests -name '*.test.js'` 递归统计；baseline.json 新增 `min_pass`（通过用例数下限），收工 hook 同时比较文件数与通过用例数。

## 防复发措施（测试 + 检测）
- 每次修改门禁脚本，必须在"应 PASS"与"应 FAIL"两种输入上各跑一次（见 re-verification.md 第 3 节四个场景）。
- 门禁的判定结果写入 `.harness/.hook-results/<task>/developer.json`，归档时保留到 `_archive/<task>/hook-results/`，让"门禁真的跑过"可被核对。
