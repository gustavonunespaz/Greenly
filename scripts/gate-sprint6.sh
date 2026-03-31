#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

cleanup() {
  echo
  echo "==> Limpando seed fake de apoio da Sprint 6"
  docker compose exec api node dist/db/seed.fake.cleanup.js || true
}

trap cleanup EXIT

run() {
  echo
  echo "==> $*"
  "$@"
}

run pnpm --filter @greenly/shared build
run pnpm --filter @greenly/api typecheck
run pnpm --filter @greenly/api lint
run pnpm --filter @greenly/api test -- src/modules/documento/documento.service.test.ts src/modules/documento/documento.processing.test.ts src/modules/dashboard/dashboard.service.test.ts
run pnpm --filter @greenly/web typecheck
run pnpm --filter @greenly/web lint
run docker compose up -d --build postgres redis mailhog api web
run docker compose exec api node dist/db/seed.js
run docker compose exec api node dist/db/seed.fake.js
run docker compose exec api node dist/scripts/smoke.sprint6.js

echo
echo "✅ Gate Sprint 6 concluido com sucesso."
