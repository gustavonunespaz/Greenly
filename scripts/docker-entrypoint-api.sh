#!/bin/sh
set -e

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║         🌱 Greenly API — Docker Boot             ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Aplicar migrations versionadas (opcional no boot) ──
if [ "${DB_MIGRATE_ON_BOOT:-false}" = "true" ]; then
  echo "📦 Aplicando migrations versionadas (drizzle-kit migrate)..."
  pnpm run db:migrate
  echo "  ✅ Migrations aplicadas."
else
  echo "⏭️  Migrações no boot desativadas (DB_MIGRATE_ON_BOOT=false)."
  echo "    Use pipeline de release com db:generate + db:migrate."
fi
echo ""

# ── 2. Sincronização idempotente de segurança (sem destruir dados) ──
if [ "${DB_SYNC_CLEAN_ON_BOOT:-true}" = "true" ]; then
  echo "🧩 Executando sincronização idempotente (db:sync:clean)..."
  pnpm run db:sync:clean
  echo "  ✅ Sincronização idempotente concluída."
else
  echo "⏭️  Sincronização idempotente desativada (DB_SYNC_CLEAN_ON_BOOT=false)."
fi
echo ""

# ── 3. Auditoria de paridade: falha o boot se houver drift ──
echo "🔎 Auditando paridade de schema (0% divergência)..."
pnpm run db:audit
echo "  ✅ Auditoria de schema aprovada."
echo ""

# ── 4. Rodar seed de dados de referência (idempotente) ──
echo "🌿 Rodando seed de dados de referência..."
pnpm run db:seed
echo ""

# ── 5. Garantir usuário master (idempotente) ──
echo "👤 Garantindo usuário master..."
pnpm run db:seed:master-user
echo ""

echo "╔══════════════════════════════════════════════════╗"
echo "║      ✅ Banco pronto — iniciando API...          ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 6. Iniciar a API ──
exec pnpm run start
