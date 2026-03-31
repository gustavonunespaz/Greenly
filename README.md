<div align="center">

```
  ██████╗ ██████╗ ███████╗███████╗███╗   ██╗██╗  ██╗   ██╗
 ██╔════╝ ██╔══██╗██╔════╝██╔════╝████╗  ██║██║  ╚██╗ ██╔╝
 ██║  ███╗██████╔╝█████╗  █████╗  ██╔██╗ ██║██║   ╚████╔╝
 ██║   ██║██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║██║    ╚██╔╝
 ╚██████╔╝██║  ██║███████╗███████╗██║ ╚████║███████╗██║
  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝
```

**Plataforma SaaS B2B de gestão e compliance ambiental**

Centralize a operação da consultoria. Monitore riscos legais e operacionais. Rastreie licenças, condicionantes, resíduos e documentos em um só lugar.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-FF4438?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-jobs-red?style=flat-square)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)

</div>

---

## Visão geral

O **Greenly** é um monorepo com backend, frontend e contratos compartilhados para operar o dia a dia de consultorias ambientais e de seus clientes.

Hoje o produto cobre, de forma integrada:

- gestão de clientes, instalações e visão micro por cliente;
- licenças ambientais e condicionantes com monitoramento de prazo;
- operação de resíduos com MTR, CDF, parceiros e rastreabilidade;
- pipeline documental com ingestão, classificação, revisão humana e métricas de qualidade;
- integrações governamentais homologáveis com `SINIR` e `SIGOR`;
- alertas, auditoria, telemetria e dashboards operacionais.

## Status atual do produto

Referência atual: **2026-03-30**

- **Onda 1** concluída tecnicamente: core, dashboard, notificações acionáveis e telemetria base.
- **Onda 2** concluída tecnicamente: pipeline documental, revisão humana, templates por perfil, reprocessamento e alertas operacionais.
- **Onda 3** concluída tecnicamente: integrações governamentais, retries, DLQ, reconciliação, mock provider e painel operacional.
- **Visão micro por cliente** já implementada: `/clientes/:id` concentra licenças, condicionantes, MTRs, CDFs, documentos, instalações, atividade recente e indicadores.
- **Consulta de CNPJ** validada com autopreenchimento de cadastro via endpoint interno.

Documentos de referência do estado atual:

- `docs/README.md`
- `docs/plano_acao_benchmarking_ambisis.md`
- `docs/onda2_consolidado_validacao.md`
- `docs/onda3_consolidado_validacao.md`
- `docs/backlog_pos_plano_acao.md`

## O que existe hoje

### Dashboard e operação diária

- dashboard com KPIs de conformidade, sustentabilidade, vencimentos e rastreabilidade;
- ações rápidas para criar licença, MTR, condicionante e cliente;
- notificações in-app com deep links e ação de marcar todas como lidas;
- telemetria básica de uso e fluxo.

### Gestão micro por cliente

- tela `/clientes/:id` com cockpit completo do cliente;
- indicadores de risco e atividade recente;
- navegação contextual para licenças, condicionantes e MTRs já filtrados por cliente;
- enriquecimento cadastral por CNPJ.

### Licenciamento e condicionantes

- CRUD de clientes e licenças;
- condicionantes pontuais e periódicas;
- cálculo de renovação com antecedência padrão de 120 dias;
- alertas e atualização automática de status por prazo.

### Resíduos e rastreabilidade

- gestão de fontes geradoras, parceiros, MTRs e CDFs;
- acompanhamento de status operacional;
- integração com `SINIR` e `SIGOR` com envio, reconciliação e timeline técnica.

### Documentos

- catálogo documental e contrato de extração por perfil;
- ingestão com idempotência por hash;
- classificação heurística;
- revisão humana por campo;
- sugestão de condicionantes candidatas;
- reprocessamento com SLA;
- dashboards de pipeline e qualidade.

### Governança e confiabilidade

- autenticação JWT com refresh token persistido;
- segregação por consultoria;
- trilha de auditoria;
- filas BullMQ para alertas, e-mail, documentos e governo;
- retries, DLQ e cron de reconciliação;
- smoke tests por sprint/onda.

## Stack tecnológica

### Backend

- `Node.js`
- `TypeScript`
- `Express 5`
- `Drizzle ORM`
- `postgres`
- `Redis + BullMQ`
- `Zod`
- `jsonwebtoken`
- `bcryptjs`
- `winston`
- `node-cron`
- `multer`

### Frontend

- `React 18`
- `Vite 8`
- `React Router`
- `@tanstack/react-query`
- `react-hook-form`
- `Zod`
- `Radix UI`
- `Tailwind CSS`
- `Recharts`
- `Framer Motion`

### Infra local

- `Docker Compose`
- `PostgreSQL 16`
- `Redis 7`
- `MailHog`
- `Nginx` no container web

## Arquitetura

O projeto segue um **monorepo modular** com workspaces `pnpm`.

```text
greenly/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── api.Dockerfile
├── web.Dockerfile
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── db/
│   │   │   ├── modules/
│   │   │   └── shared/
│   │   └── .env.example
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── pages/
│   │   └── public/
│   └── web_backup/        # fora do workspace oficial
├── packages/
│   └── shared/
│       └── src/
├── scripts/
└── docs/
```

### Workspaces ativos

- `apps/api`: API Express, jobs, filas, seeds e schema Drizzle.
- `apps/web`: SPA React protegida por autenticação.
- `packages/shared`: contratos, tipos e validadores compartilhados.

`apps/web_backup` existe no repositório, mas está excluído do workspace em `pnpm-workspace.yaml`.

### Módulos backend atuais

- `auth`
- `cliente`
- `consultoria`
- `licenca`
- `residuo`
- `dashboard`
- `documento`
- `integracao-governo`
- `notificacao`
- `auditoria`

### Superfícies principais do frontend

- `/login`
- `/`
- `/clientes` e `/clientes/:id`
- `/licencas` e `/licencas/:id`
- `/condicionantes` e `/condicionantes/:id`
- `/mtrs` e `/mtrs/:id`
- `/documentos`
- `/notificacoes`
- `/configuracoes`

## Arquitetura operacional

### API

- `GET /health`: healthcheck simples.
- `GET /`: raiz com links úteis locais.
- base REST em `http://localhost:3333/api`.

### Filas BullMQ em uso

- `greenly_alertas`
- `greenly_email`
- `greenly_notificacoes`
- `greenly_documentos`
- `greenly_gov_integracoes`
- `greenly_gov_dlq`

### Jobs e workers em uso

- `VarreduraAlertasCron`
- `StatusUpdaterCron`
- `DocumentoRetentionCron`
- `DocumentoPipelineAlertasCron`
- `GovernoReconciliacaoCron`
- `AlertasWorker`
- `EmailWorker`
- `DocumentoProcessamentoWorker` quando `ENABLE_DOCUMENTO_WORKER=true`
- `GovernoIntegracaoWorker`

## Endpoints de maior relevância hoje

### Clientes

- `GET /api/clientes`
- `GET /api/clientes/:id/painel`
- `GET /api/clientes/cnpj/:cnpj`

### Dashboard

- `GET /api/dashboard/metrics`
- `GET /api/dashboard/documentos/pipeline`
- `GET /api/dashboard/documentos/pipeline/alertas`
- `GET /api/dashboard/documentos/pipeline/itens`
- `GET /api/dashboard/documentos/qualidade`

### Documentos

- `GET /api/documentos/catalogo`
- `GET /api/documentos/contrato-extracao`
- `GET /api/documentos/templates-requisitos`
- `PUT /api/documentos/templates-requisitos`
- `POST /api/documentos/ingestao`
- `GET /api/documentos/revisao/pendentes`
- `GET /api/documentos/:processamentoDocumentoId/revisao`
- `POST /api/documentos/:processamentoDocumentoId/revisao`
- `POST /api/documentos/:processamentoDocumentoId/reprocessar`
- `GET /api/documentos/:processamentoDocumentoId/condicionantes-candidatas`

### Integrações governamentais

- `GET /api/integracoes/governo/dashboard`
- `GET /api/integracoes/governo/mtrs/:id`
- `POST /api/integracoes/governo/mtrs/:id/enviar`
- `POST /api/integracoes/governo/mtrs/:id/reconciliar`
- `GET /api/integracoes/governo/cdfs/:id`
- `POST /api/integracoes/governo/cdfs/:id/enviar`
- `POST /api/integracoes/governo/cdfs/:id/reconciliar`
- `POST /api/integracoes/governo/webhooks/:system`

### Mock provider homologável

- `POST /api/integracoes/governo/mock/:system/auth`
- `POST /api/integracoes/governo/mock/:system/mtrs`
- `GET /api/integracoes/governo/mock/:system/mtrs/:numero/status`
- `POST /api/integracoes/governo/mock/:system/cdfs`
- `GET /api/integracoes/governo/mock/:system/cdfs/:numero/status`
- `PUT /api/integracoes/governo/mock/:system/scenarios`
- `DELETE /api/integracoes/governo/mock/:system/reset`
- `DELETE /api/integracoes/governo/mock/reset`

## Rodando localmente

### Portas padrão

- `web`: `http://localhost:8080`
- `api`: `http://localhost:3333`
- `postgres`: `localhost:5435`
- `redis`: `localhost:6379`
- `mailhog`: `http://localhost:8025`

### Pré-requisitos

- `Node.js 20+`
- `pnpm`
- `Docker` com `docker compose`

### Setup recomendado para desenvolvimento

```bash
git clone <repo>
cd Greenly

pnpm install

cp apps/api/.env.example apps/api/.env
printf "VITE_API_URL=http://localhost:3333/api\n" > apps/web/.env
```

Ajuste `apps/api/.env` para o ambiente local com Docker Compose:

```bash
DATABASE_URL=postgresql://postgres:greenly@localhost:5435/greenly
APP_URL=http://localhost:8080
API_URL=http://localhost:3333
```

Opcionalmente, se quiser alinhar CORS de forma explícita:

```bash
CORS_ORIGIN=http://localhost:8080
```

Suba a infraestrutura:

```bash
docker compose up -d postgres redis mailhog
```

Prepare a base:

```bash
pnpm --filter @greenly/api db:push
pnpm --filter @greenly/api db:seed
pnpm user:seed-master
```

Inicie frontend e backend:

```bash
pnpm dev
```

### Subir tudo em containers

```bash
docker compose up -d --build
```

## Comandos úteis

### Raiz do monorepo

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
pnpm user:seed-master
```

### Backend

```bash
pnpm --filter @greenly/api dev
pnpm --filter @greenly/api build
pnpm --filter @greenly/api lint
pnpm --filter @greenly/api typecheck
pnpm --filter @greenly/api test
pnpm --filter @greenly/api db:push
pnpm --filter @greenly/api db:seed
pnpm --filter @greenly/api db:seed:fake
pnpm --filter @greenly/api db:seed:fake:cleanup
```

### Frontend

```bash
pnpm --filter @greenly/web dev
pnpm --filter @greenly/web build
pnpm --filter @greenly/web lint
pnpm --filter @greenly/web typecheck
pnpm --filter @greenly/web test
```

## Testes e validação

Hoje a validação do projeto está concentrada em:

- testes de unidade com `Vitest`;
- builds e typechecks por workspace;
- smoke tests de fluxo por sprint e por onda;
- validação runtime em Docker para ondas consolidadas.

### Smokes disponíveis

```bash
pnpm test:sprint1:smoke
pnpm test:sprint2:smoke
pnpm test:cdf:smoke
pnpm test:sprint3:smoke
pnpm test:sprint4:smoke
pnpm test:sprint5:smoke
pnpm test:sprint6:smoke
pnpm test:sprint6:smoke:docker
pnpm test:onda2:smoke:docker
pnpm test:onda3:smoke:docker
```

### Gates e scripts de apoio

```bash
pnpm gate:sprint3
pnpm gate:pre-sprint4
pnpm gate:sprint5
pnpm gate:sprint6
pnpm gate:onda2
```

Observação:

- existe configuração de Playwright em `apps/web`, mas a trilha principal validada hoje no repositório está nos testes Vitest e nos smokes acima.

## Variáveis de ambiente importantes

### Backend (`apps/api/.env`)

Variáveis críticas:

- `PORT`
- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `EMAIL_FROM`
- `APP_URL`
- `API_URL`
- `ENABLE_DOCUMENTO_WORKER`
- `DOCUMENTOS_WORKER_CONCURRENCY`

Variáveis documentais relevantes:

- `DOCUMENTOS_UPLOAD_MAX_MB`
- `DOCUMENTOS_MODO_SEM_CUSTO`
- `DOCUMENTOS_RETENCAO_CRITICO_DIAS`
- `DOCUMENTOS_RETENCAO_PADRAO_DIAS`
- `DOCUMENTOS_RETENCAO_TEMPORARIO_DIAS`
- `DOCUMENTOS_EXPURGO_HABILITADO`
- `DOCUMENTOS_EXPURGO_CRON`

Variáveis de compliance:

- `LICENCA_RENOVACAO_ANTECEDENCIA_DIAS`
- `CONDICIONANTE_ALERTA_DIAS`
- `PARCEIRO_LICENCA_ALERTA_DIAS`

### Frontend (`apps/web/.env`)

```bash
VITE_API_URL=http://localhost:3333/api
```

## Autenticação e perfis

O login retorna:

- `usuario`
- `token` (JWT bearer)
- `refreshToken`

Perfis atualmente usados:

- `CONSULTORIA_ADMIN`
- `ANALISTA_AMBIENTAL`
- `CLIENTE_VIEWER`

O refresh token é persistido em sessão no banco de dados.

## Documentação do projeto

Entrada rápida:

- `docs/README.md`: índice da documentação viva
- `docs/plano_acao_benchmarking_ambisis.md`: plano mestre por ondas e sprints
- `docs/onda2_consolidado_validacao.md`: fechamento técnico da Onda 2
- `docs/onda3_consolidado_validacao.md`: fechamento técnico da Onda 3
- `docs/backlog_pos_plano_acao.md`: backlog oficial pós-plano

## Roadmap resumido

Situação atual do plano:

- **Onda 1**: concluída tecnicamente
- **Onda 2**: concluída tecnicamente
- **Onda 3**: concluída tecnicamente
- **Onda 4**: planejada no plano mestre
- **Onda 5**: planejada no plano mestre

Backlog já registrado para depois:

- integrações ambientais gratuitas e oficiais como `INMET`, `ANA/SNIRH`, `INPE Queimadas`, `TerraBrasilis`, `MMA/CNUC`, `IBAMA` e base territorial `IBGE + CEP/CNPJ`;
- itens comerciais e operacionais do pós-plano em `docs/backlog_pos_plano_acao.md`.

## Contribuindo

Antes de abrir mudanças:

1. rode `pnpm lint`, `pnpm typecheck` e os testes relevantes;
2. se a mudança afetar fluxo crítico, rode também o smoke correspondente;
3. atualize a documentação quando alterar comportamento, setup ou operação.

O repositório já possui workflow de gate da Sprint 3 em `.github/workflows/sprint3-gate.yml`.

## Credenciais padrão

Infra local via Docker Compose:

- banco: `greenly`
- usuário: `postgres`
- senha: `greenly`

Usuário master:

- e-mail: `admin@greenly.app`
- senha: `greenly123`

Para garantir a criação do master:

```bash
pnpm user:seed-master
```

Seeds opcionais de homologação:

- `admin.seed@greenly.app / greenly123`
- `analista.seed@greenly.app / greenly123`
- `cliente.seed@greenly.app / greenly123`

---

<div align="center">

**Greenly**  
Compliance ambiental com operação, rastreabilidade e contexto real de cliente.

</div>
