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
run node --check ./scripts/smoke-sprint4-documentos.mjs
run pnpm --filter ./apps/web typecheck

echo
echo "✅ Gate pré-sprint 4 concluído com sucesso."
