#!/usr/bin/env bash
# 后端冒烟：找空闲端口启动 node backend/server.js，探活 API 根路径 + 关键行为接口。
# v1.1：新增 GET /api/fx/usd-cny 行为探测（不依赖数据库）。
#       该接口在默认配置下必须返回 200；返回 503 说明汇率定时刷新未接线（v1.0 的真实缺陷）。
set -uo pipefail
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$PROJECT_ROOT"

FREE_PORT=$(python3 - <<'PY'
import socket
s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()
PY
)

LOG=$(mktemp)
# 冒烟固定用内置演示汇率，排除外部上游的干扰
PORT="$FREE_PORT" SMOKE=1 FX_UPSTREAM_URL="" FX_FIXED_RATE="" node backend/server.js >"$LOG" 2>&1 &
PID=$!
STARTED=0
for i in $(seq 1 10); do
  if grep -q "Server running" "$LOG" 2>/dev/null; then STARTED=1; break; fi
  if ! kill -0 "$PID" 2>/dev/null; then break; fi
  sleep 0.3
done

if grep -q 'EADDRINUSE' "$LOG" 2>/dev/null; then
  echo "[WARN] 端口占用（环境问题），跳过冒烟"; kill "$PID" 2>/dev/null; exit 0
fi
if [ "$STARTED" -ne 1 ]; then
  echo "[FAIL] 后端启动失败:"; tail -5 "$LOG"; kill "$PID" 2>/dev/null; exit 1
fi
echo "[OK] 后端启动成功 (端口 ${FREE_PORT})"

OK=0
for i in $(seq 1 10); do
  BODY=$(curl -fsS "http://127.0.0.1:${FREE_PORT}/" 2>/dev/null) && { OK=1; break; }
  sleep 0.3
done

FX_CODE=000
FX_BODY=""
for i in $(seq 1 10); do
  FX_BODY=$(curl -sS -w '\n%{http_code}' "http://127.0.0.1:${FREE_PORT}/api/fx/usd-cny" 2>/dev/null)
  FX_CODE=$(printf '%s' "$FX_BODY" | tail -1)
  FX_BODY=$(printf '%s' "$FX_BODY" | sed '$d')
  [ "$FX_CODE" = "200" ] && break
  sleep 0.3
done
kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null

if [ "$OK" -eq 1 ]; then
  echo "[OK] API 根路径可访问: $BODY"
else
  echo "[WARN] API 根路径探活失败（启动成功但未响应，降级提示）"
fi

if [ "$FX_CODE" = "200" ]; then
  echo "[OK] 汇率接口可用: $FX_BODY"
  exit 0
fi
echo "[FAIL] 汇率接口返回 HTTP ${FX_CODE}（期望 200）：${FX_BODY}"
echo "       排查：server.js 是否调用 fxService.startAutoRefresh()；defaultFetcher 是否可用"
exit 1
