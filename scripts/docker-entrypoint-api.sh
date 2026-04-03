#!/bin/sh
set -e

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║         🌱 Greenly API — Docker Boot             ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Aplicar schema no banco (db:push é idempotente) ──
echo "📦 Aplicando schema no banco de dados (drizzle-kit push)..."
pnpm run db:push 2>&1 || {
  echo "⚠️  db:push falhou — pode ser primeira execução. Tentando novamente em 3s..."
  sleep 3
  pnpm run db:push
}
echo "  ✅ Schema sincronizado."
echo ""

# ── 2. Rodar seed de dados de referência (idempotente) ──
echo "🌿 Rodando seed de dados de referência..."
pnpm run db:seed
echo ""

# ── 3. Garantir usuário master (idempotente) ──
echo "👤 Garantindo usuário master..."
pnpm run db:seed:master-user
echo ""

echo "╔══════════════════════════════════════════════════╗"
echo "║      ✅ Banco pronto — iniciando API...          ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 4. Iniciar a API ──
exec pnpm run start
