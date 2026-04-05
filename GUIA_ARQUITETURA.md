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
│   ├── ibama/
│   ├── saneamento/
│   ├── tasks/
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
- **Integridade de Dados**: Padrão de sanitização em Repositories para converter inputs de interface (como `"none"`) em `null/undefined` para colunas UUID.

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
- Dashboard com consolidação analítica em `useDashboardIntelligence`, permitindo alertas baseados em janelas de tempo dinâmicas (`notificacaoDias`).
- Responsividade reforçada para CRUDs, modais e wizards complexos (ex: MTR).

## Dados e integrações

- Banco primário: PostgreSQL.
- Fila/cache: Redis.
- Documentos e anexos: storage local configurável por ambiente.
- Integrações governamentais: módulo dedicado (`integracao-governo`) compatível com SINIR v1.10 (MTR e CDF).

## Execução local (resumo)

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
echo "VITE_API_URL=http://localhost:3333/api" > apps/web/.env
docker compose up -d postgres redis mailhog
pnpm --filter @greenly/api db:migrate
pnpm --filter @greenly/api db:sync:clean
pnpm --filter @greenly/api db:audit
pnpm --filter @greenly/api db:seed # Inclui órgãos ambientais e tipos de resíduos (NBR 10.004)
pnpm dev
```

## Leitura recomendada

- Visão completa: `README.md`
- Banco e migrations: `apps/api/db_README.md`
- Contexto de produto e planejamento: `docs/README.md`
