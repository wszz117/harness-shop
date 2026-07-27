#!/usr/bin/env bash
# MongoDB 探活/拉起：27017 可连则 OK；否则尝试启动本机 mongod。
set -uo pipefail
PORT=27017
alive() { (exec 3<>/dev/tcp/127.0.0.1/$PORT) 2>/dev/null && exec 3>&- && return 0 || return 1; }

if alive; then echo "[OK] MongoDB 已在 127.0.0.1:$PORT 运行"; exit 0; fi

if command -v mongod >/dev/null 2>&1; then
  DBPATH="${MONGO_DBPATH:-$HOME/.shop-v2-mongo}"
  mkdir -p "$DBPATH"
  echo "[..] 启动 mongod (dbpath=$DBPATH)..."
  mongod --dbpath "$DBPATH" --port $PORT --bind_ip 127.0.0.1 --fork --logpath "$DBPATH/mongod.log" >/dev/null 2>&1     || nohup mongod --dbpath "$DBPATH" --port $PORT --bind_ip 127.0.0.1 >"$DBPATH/mongod.log" 2>&1 &
  for i in $(seq 1 20); do alive && { echo "[OK] MongoDB 已启动"; exit 0; }; sleep 0.5; done
  echo "[FAIL] mongod 启动超时，日志: $DBPATH/mongod.log"; exit 1
fi
echo "[FAIL] 未安装 mongod 且 27017 无服务。请安装 MongoDB 或启动服务后重试。"
exit 1
