# Greenly Web (`@greenly/web`)

Frontend React da plataforma Greenly para operação diária de compliance ambiental.

## Stack

- React 18 + TypeScript
- Vite 8
- Tailwind CSS + shadcn/ui
- TanStack Query
- React Router
- Recharts
- Vitest

## Executar localmente

Na raiz do monorepo:

```bash
pnpm install
echo "VITE_API_URL=http://localhost:3333/api" > apps/web/.env
pnpm --filter @greenly/web dev
```

Aplicação disponível em `http://localhost:8080`.

## Scripts principais

```bash
pnpm --filter @greenly/web dev
pnpm --filter @greenly/web build
pnpm --filter @greenly/web preview
pnpm --filter @greenly/web lint
pnpm --filter @greenly/web typecheck
pnpm --filter @greenly/web test
```

## Estrutura resumida

```text
apps/web/src/
├── App.tsx
├── pages/
│   ├── Index.tsx
│   ├── LicencasPage.tsx
│   ├── CondicionantesPage.tsx
│   ├── MTRsPage.tsx
│   ├── ClientesPage.tsx
│   └── NotificacoesPage.tsx
├── features/
│   ├── auth/
│   ├── clientes/
│   ├── dashboard/
│   ├── licencas/
│   ├── notificacoes/
│   └── residuos/
├── components/
│   ├── layout/
│   └── ui/
└── lib/
```

## Dashboard atual

O dashboard principal usa o hook `useDashboardIntelligence` para consolidar dados e exibir:

- risco de conformidade (ativas, pendentes, vencidas),
- timeline de vencimentos próximos,
- KPIs por categoria (legal, resíduos, emissões/recursos),
- KPIs setoriais (agronegócio, energia, saúde),
- tendências históricas,
- rastreabilidade com drill-down para origem operacional (MTR/CDF).

## Cadastro de clientes (CNPJ)

O formulário de clientes possui consulta automática por CNPJ:

- ação `Buscar CNPJ` no campo de CNPJ,
- autopreenchimento de razão social, contato, CNAE e endereço,
- sugestão de setor com base no CNAE retornado.

## Responsividade e overflow

O web foi ajustado para não vazar conteúdo em telas menores:

- `DialogContent` com `max-height` de viewport + scroll interno,
- tabelas de CRUD com `overflow-x-auto`,
- layout principal com contenção (`min-w-0`, `max-w-full`),
- bloqueio global de overflow horizontal no `body`.

## Documentação complementar

- Visão geral do projeto: `README.md` (raiz)
- Guia de arquitetura: `GUIA_ARQUITETURA.md`
