#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

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
run node --check ./scripts/smoke-sprint5-documentos-revisao.mjs

echo
echo "✅ Gate Sprint 5 concluido com sucesso."
