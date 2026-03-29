#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${GATE_API_PORT:-3334}"
API_HOST="${GATE_API_HOST:-127.0.0.1}"
API_URL="${API_URL:-http://${API_HOST}:${PORT}/api}"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:greenly@127.0.0.1:5435/greenly}"
REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6379}"
JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET:-super_secret_dev_key_123}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-super_secret_refresh_dev_key_123}"
API_LOG="${TMPDIR:-/tmp}/greenly-sprint3-gate-api.log"
API_PID=""

run() {
  echo
  echo "==> $*"
  "$@"
}

cleanup() {
  if [[ -n "$API_PID" ]]; then
    kill "$API_PID" >/dev/null 2>&1 || true
    wait "$API_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

run pnpm --filter @greenly/shared build
run pnpm --filter @greenly/api typecheck
run pnpm --filter @greenly/api build
run pnpm --filter ./apps/web typecheck
run pnpm --filter ./apps/web build

run env DATABASE_URL="$DATABASE_URL" pnpm --filter @greenly/api db:push
run env DATABASE_URL="$DATABASE_URL" pnpm --filter @greenly/api db:seed

echo
echo "==> Iniciando API para os smokes (porta ${PORT})..."
env \
  PORT="$PORT" \
  DATABASE_URL="$DATABASE_URL" \
  REDIS_HOST="$REDIS_HOST" \
  REDIS_PORT="$REDIS_PORT" \
  JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  pnpm --filter @greenly/api dev >"$API_LOG" 2>&1 &
API_PID=$!

READY=0
for _ in $(seq 1 60); do
  if curl -fsS "http://${API_HOST}:${PORT}/health" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [[ "$READY" -ne 1 ]]; then
  echo "API não ficou pronta para os smokes. Últimas linhas do log:"
  tail -n 120 "$API_LOG" || true
  exit 1
fi

run env API_URL="$API_URL" pnpm test:sprint2:smoke
run env API_URL="$API_URL" pnpm test:cdf:smoke
run pnpm test:sprint3:smoke

echo
echo "✅ Gate Sprint 3 concluído com sucesso."
