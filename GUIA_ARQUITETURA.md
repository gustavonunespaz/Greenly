# Guia de Arquitetura Greenly

Este guia resume a arquitetura atual do monorepo e serve como referência rápida para onboarding técnico.

## Visão geral

- Monorepo com `pnpm workspaces`.
- Dois apps principais:
  - `apps/api` (backend HTTP e jobs),
  - `apps/web` (frontend React).
- Pacote compartilhado em `packages/shared` para tipos e contratos comuns.

## Backend (`apps/api`)

Arquitetura modular por domínio, com composição via container e roteador central:

```text
apps/api/src/
├── app.ts
├── server.ts
├── db/
│   └── schema/
├── modules/
│   ├── auth/
│   ├── cliente/
│   ├── consultoria/
│   ├── dashboard/
│   ├── licenca/
│   ├── notificacao/
│   ├── auditoria/
│   ├── residuo/
│   └── integracao-governo/
└── shared/
    ├── container.ts
    ├── router.ts
    ├── authMiddleware.ts
    ├── jobs/
    └── config/
```

Pontos chave:

- API REST em `/api/*`.
- Persistência em PostgreSQL via Drizzle.
- Alertas e processos assíncronos com BullMQ + Redis.
- Isolamento multi-tenant com `consultoriaId`.

## Frontend (`apps/web`)

Estrutura por feature com páginas como containers de rota:

```text
apps/web/src/
├── App.tsx
├── pages/
├── features/
├── components/
├── hooks/
└── lib/
```

Pontos chave:

- Estado remoto com TanStack Query.
- Dashboard com consolidação analítica em `useDashboardIntelligence`.
- Responsividade reforçada para CRUDs e modais (sem overflow horizontal visível).

## Dados e integrações

- Banco primário: PostgreSQL.
- Fila/cache: Redis.
- Documentos e anexos: storage local configurável por ambiente.
- Integrações governamentais: módulo dedicado (`integracao-governo`) preparado para evolução.

## Execução local (resumo)

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
echo "VITE_API_URL=http://localhost:3333/api" > apps/web/.env
docker compose up -d postgres redis mailhog
pnpm --filter @greenly/api db:push
pnpm --filter @greenly/api db:seed
pnpm dev
```

## Leitura recomendada

- Visão completa: `README.md`
- Banco e migrations: `apps/api/db_README.md`
- Contexto de produto e planejamento: `docs/README.md`
