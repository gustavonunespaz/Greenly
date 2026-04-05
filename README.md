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

## Para ir direto ao ponto

- Quer subir tudo rápido: vá para **Quick Start**.
- Quer desenvolver com hot reload: vá para **Rodando localmente**.
- Quer entender o papel de cada tecnologia: vá para **Stack tecnológica**.
- Quer ver endpoints principais: vá para **Endpoints de maior relevância hoje**.
- Quer ver variáveis de ambiente: vá para **Variáveis de ambiente importantes**.
- Quer comandos do dia a dia: vá para **Comandos úteis**.

## 🚀 Quick Start (2 minutos)

A maneira mais rápida de rodar o ecossistema inteiro com zero dependências host (apenas Docker instalado) é:

```bash
# 1. Clone o repositório
git clone <url-do-repo> Greenly
cd Greenly

# 2. Inicie a infraestrutura inteira (banco é preparado automaticamente)
docker compose up -d --build
```

> **Zero config:** O container da API executa automaticamente `db:sync:clean` + `db:audit` (paridade), depois `db:seed` e `db:seed:master-user` no boot. Para forçar migrações no boot, use `DB_MIGRATE_ON_BOOT=true`.

**Seus ambientes estarão disponíveis instantaneamente:**
- 🌍 **Landing Page:** [http://localhost:8081](http://localhost:8081)
- 🏢 **Plataforma (App):** [http://localhost:8080](http://localhost:8080)
- ⚙️ **API REST:** [http://localhost:3333/health](http://localhost:3333/health)
- 📨 **MailHog:** [http://localhost:8025](http://localhost:8025)

**Usuário Master padrão:** `admin@greenly.app` / `greenly123`

### Fluxos comuns

| Objetivo | Faça isso |
| --- | --- |
| Quero só abrir o sistema | `docker compose up -d --build` e acesse `http://localhost:8080` |
| Quero rodar API e frontend em modo dev | Veja **Rodando localmente > Opção 2** |
| Quero garantir banco consistente | Rode `db:sync:clean` + `db:audit` no `@greenly/api` |
| Quero restaurar usuário admin | Rode `pnpm user:seed-master` |

---

Hoje o produto cobre, de forma integrada:

- gestão de clientes, instalações e visão micro por cliente;
- licenças ambientais e condicionantes com monitoramento de prazo;
- operação de resíduos com MTR, CDF, parceiros e rastreabilidade;
- agenda ambiental interativa com tarefas em calendário e Kanban;
- pipeline documental com ingestão, classificação, revisão humana e métricas de qualidade;
- integrações governamentais homologáveis com `SINIR` e `SIGOR`;
- alertas, auditoria, telemetria e dashboards operacionais.

## Diferenciais do Greenly hoje

Referência validada no código: **2026-04-04**

- **Operação fim a fim no mesmo fluxo**: cliente, licença, condicionante, MTR/CDF, documento, tarefa e alerta conectados sem troca de sistema.
- **Agenda híbrida (Calendário + Kanban)**: tarefas arrastáveis, ajuste de janela por horário e vínculo direto com licenças/MTRs/cliente.
- **Rastreabilidade de resíduos orientada a integração**: emissão com regras SINIR v1.10, vínculo operacional de parceiros e reconciliação técnica.
- **Confiabilidade de integração governamental**: filas dedicadas, retries, reconciliação automática, webhook com deduplicação e DLQ.
- **Documento como gerador de ação**: classificação, revisão por campo, reprocessamento com SLA e sugestão de condicionantes candidatas.
- **Visão executiva sem perder detalhe operacional**: dashboard com drill-down até o item de origem, risco consolidado e urgências acionáveis.
- **Base regulatória pronta para uso**: ~4k órgãos ambientais + ~2.5k tipos de resíduos (NBR 10.004) para acelerar onboarding.

## Status atual do produto

Referência atual: **2026-04-04**

- **Base de Conformidade**: concluída. Inclui licenciamento completo (RLO, RLI, RLP, DLAE) com monitoramento de condicionantes.
- **Rastreabilidade de Resíduos**: concluída. Emissão de MTR e CDF em conformidade com **SINIR v1.10**, suportando múltiplos itens e resíduos perigosos via **wizard de 6 passos**.
- **Gestão de Agenda e Tarefas**: concluída. Inclusão de tarefas pessoais vinculadas a Clientes, Licenças e MTRs com alertas de antecedência (`notificacaoDias`) customizáveis.
- **Gestão de Anuências**: módulo de **Saneamento** integrado para controle de anuências municipais/estaduais.
- **Conformidade Federal**: módulo **IBAMA** integrado para gestão de CTFs e TCFAs.
- **Ecossistema de Dados**: ~4k órgãos ambientais e ~2.5k tipos de resíduos (NBR 10.004) integrados via seeding automático.
- **Visão micro por cliente**: cockpit concentrando licenças, condicionantes, MTRs, CDFs, anuências e indicadores.
- **Consulta de CNPJ**: autopreenchimento de cadastro validado via endpoint interno.

Documentos de referência do estado atual:

- `docs/README.md`
- `docs/plano_acao_benchmarking_ambisis.md`

## O que existe hoje

### Dashboard e operação diária

- dashboard com KPIs de conformidade, sustentabilidade, vencimentos e rastreabilidade;
- **Agenda Interativa**: visão calendarizada de todos os compromissos ambientais;
- **Gestão de Tarefas**: criação de tarefas pessoais com vinculação a MTRs, Licenças e Clientes;
- **Alertas Inteligentes**: personalização da antecedência de alertas (`notificacaoDias`) por item;
- notificações in-app com deep links e ação de marcar todas como lidas;
- telemetria básica de uso e fluxo.

### Gestão micro por cliente

- tela `/clientes/:id` com cockpit completo do cliente;
- indicadores de risco e atividade recente;
- navegação contextual para licenças, condicionantes e MTRs já filtrados por cliente;
- enriquecimento cadastral por CNPJ.

### Licenciamento e condicionantes

- CRUD de clientes e licenças (suporta RLO, RLI, RLP, DLAE, Dispensas);
- seleção de órgãos ambientais federais, estaduais e municipais (base de ~4k órgãos);
- condicionantes pontuais e periódicas com sugestão automática via documentos;
- cálculo de renovação com antecedência padrão de 120 dias;
- alertas e atualização automática de status por prazo.

### Resíduos e rastreabilidade

- gestão de fontes geradoras, parceiros, MTRs e CDFs;
- emissão de MTR em conformidade com **SINIR v1.10** via wizard responsivo de 6 passos;
- suporte a múltiplos itens por MTR, dados de periculosidade e tipos de armazenamento;
- integração com `SINIR` e `SIGOR` com envio, reconciliação e timeline técnica.

### Anuências e Taxas Federais

- **Saneamento**: acompanhamento de anuências de lançamento e uso de água;
- **IBAMA**: gestão de Certificado de Regularidade (CTF) e controle de taxas (TCFA) com projeção de custos.

### Documentos

- catálogo documental e contrato de extração por perfil;
- ingestão com idempotência por hash;
- classificação heurística;
- revisão humana por campo;
- fluxo de aceite com pré-visualização e aplicação assistida no CRUD (Licença, MTR e Condicionantes);
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

Resumo rápido:

- `PostgreSQL`: banco principal (dados transacionais).
- `Redis + BullMQ`: filas e processamento assíncrono (alertas, e-mail, documentos, governo).
- `node-cron`: agendamentos automáticos (varreduras e reconciliação).
- `Nginx`: entrega do frontend e proxy `/api` no container `web`.
- `MailHog`: caixa SMTP local para inspecionar e-mails.

### Mapa de tecnologias (o que cada uma faz no código)

| Tecnologia | Onde está no código | Papel no Greenly |
| --- | --- | --- |
| `Node.js 20` | `api.Dockerfile`, `web.Dockerfile`, `site.Dockerfile` | Runtime do backend e etapa de build dos frontends. |
| `TypeScript` | `apps/api`, `apps/web`, `apps/site`, `packages/shared` | Linguagem principal do monorepo, tipando API, SPA e contratos compartilhados. |
| `Express 5` | `apps/api/src/app.ts`, `apps/api/src/shared/router.ts` | HTTP server da API REST (`/api`, `/health`, middlewares e roteamento). |
| `helmet` | `apps/api/src/app.ts` | Headers de segurança HTTP da API. |
| `cors` | `apps/api/src/app.ts` | Controle de origem permitida para consumo do frontend (`CORS_ORIGIN`). |
| `compression` | `apps/api/src/app.ts` | Compressão gzip das respostas da API. |
| `Drizzle ORM` | `apps/api/src/db/index.ts`, `apps/api/src/db/schema/*` | Mapeamento de schema PostgreSQL e queries tipadas nos repositórios. |
| `drizzle-kit` | `apps/api/package.json` (`db:generate`, `db:migrate`, `db:push`) | Geração/aplicação de migrações e sincronização de schema. |
| `postgres` (driver) | `apps/api/src/db/index.ts` | Conexão low-level com PostgreSQL usada pelo Drizzle. |
| `PostgreSQL 16` | `docker-compose.yml` (`service: postgres`) | Banco principal de dados transacionais (usuários, licenças, MTR, CDF, etc.). |
| `Redis 7` | `docker-compose.yml` (`service: redis`) | Infra de filas e estado de processamento assíncrono (via BullMQ). |
| `ioredis` | `apps/api/src/shared/redis.ts` | Cliente Redis com reconexão e conexão compartilhada/dedicada para workers. |
| `BullMQ` | `apps/api/src/shared/bullmq.ts`, `apps/api/src/shared/jobs/*` | Filas e workers de alertas, e-mail, documentos e integrações governamentais. |
| `node-cron` | `apps/api/src/shared/jobs/*Cron.ts` | Agendamento periódico (varredura, reconciliação, retenção e atualização de status). |
| `nodemailer` | `apps/api/src/shared/EmailService.ts` | Envio de e-mails transacionais disparados por workers. |
| `MailHog` | `docker-compose.yml` (`service: mailhog`) | SMTP/Web UI local para visualizar e-mails de desenvolvimento. |
| `jsonwebtoken` | `apps/api/src/modules/auth/auth.service.ts`, `apps/api/src/shared/authMiddleware.ts` | Emissão e validação de JWT de autenticação. |
| `bcryptjs` | `apps/api/src/modules/auth/auth.service.ts`, `apps/api/src/db/seed*.ts` | Hash e verificação de senha. |
| `Zod` | `packages/shared/src/contracts.ts`, controllers da API | Validação de contratos de entrada/saída e erros de validação. |
| `winston` | `apps/api/src/shared/logger.ts` | Logging estruturado da API e dos jobs. |
| `multer` | `apps/api/src/modules/documento/documento.routes.ts` | Upload de arquivos no pipeline documental. |
| `React 18` | `apps/web/src/*`, `apps/site/src/*` | Base do frontend da plataforma (`web`) e da landing (`site`). |
| `Vite 8` | `apps/web/package.json`, `apps/site/package.json` | Dev server e build das aplicações frontend. |
| `React Router` | `apps/web/src/App.tsx` | Roteamento SPA (rotas protegidas e módulos da plataforma). |
| `@tanstack/react-query` | `apps/web/src/App.tsx`, `apps/web/src/features/**/hooks` | Fetch/caching de dados de API e invalidação pós-mutation. |
| `axios` | `apps/web/src/lib/api.ts` | Cliente HTTP da SPA com interceptors de token e tratamento de `401`. |
| `react-hook-form` | `apps/web/src/components/ui/form.tsx`, formulários de features | Estado/validação de formulários no frontend. |
| `Radix UI` + `cmdk` | `apps/web/src/components/ui/*` | Primitivos de UI acessíveis (dialogs, menus, popovers, command palette etc.). |
| `Tailwind CSS` | `apps/web/tailwind.config.ts`, `apps/site/tailwind.config.ts` | Sistema de estilos utilitário para `web` e `site`. |
| `Recharts` | `apps/web/src/features/dashboard/components/*Chart*.tsx` | Gráficos do dashboard e painéis analíticos. |
| `Framer Motion` | páginas/componentes em `apps/web/src` e `apps/site/src` | Animações de transição e microinterações visuais. |
| `next-themes` | `apps/web/src/components/theme-provider.tsx` | Provider de tema da SPA (`ThemeProvider`). |
| `Nginx` | `web.Dockerfile`, `site.Dockerfile`, `apps/web/nginx.conf` | Servir assets estáticos e, no `web`, proxy de `/api` para `api:3333`. |
| `Docker Compose` | `docker-compose.yml` | Orquestra API, web, site, postgres, redis e mailhog localmente. |
| `pnpm workspaces` | `pnpm-workspace.yaml`, `package.json` raiz | Gestão monorepo e compartilhamento de dependências entre apps/pacotes. |
| `Vitest` | `apps/api/vitest.config.ts`, `apps/web/vitest.config.ts` | Testes unitários e de integração dos workspaces. |
| `Playwright` | `apps/web/playwright.config.ts` | Base para testes E2E da SPA (quando acionados). |

### Sequência de boot da API em Docker

- `scripts/docker-entrypoint-api.sh` executa no boot: `db:migrate` (opcional), `db:sync:clean`, `db:audit`, `db:seed` e `db:seed:master-user`.
- Só depois disso a API sobe com `node dist/server.js`.

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
│   └── site/              # Landing Page institucional
│       └── src/
├── packages/
│   └── shared/
│       └── src/
├── scripts/
└── docs/
```

### Workspaces ativos

- `apps/api`: API Express, jobs, filas, seeds e schema Drizzle.
- `apps/web`: SPA React protegida por autenticação.
- `apps/site`: Landing page institucional (Vite + React).
- `packages/shared`: contratos, tipos e validadores compartilhados.

### Módulos backend atuais

- `auth`
- `cliente`
- `consultoria`
- `licenca`
- `residuo`
- `ibama`
- `saneamento`
- `dashboard`
- `documento`
- `integracao-governo`
- `notificacao`
- `auditoria`
- `tasks` (Gestão de agenda e afazeres vinculados)

### Superfícies principais do frontend

- `/login`
- `/`
- `/agenda`
- `/tarefas`
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

### Agenda e Tarefas

- `GET /api/tasks`: listagem das tarefas do usuário (ordenadas por posição)
- `POST /api/tasks`: criação de tarefa (suporta vínculos com MTR/Licença)
- `PATCH /api/tasks/:id`: atualização parcial (incluindo status, posição, horários e antecedência)
- `DELETE /api/tasks/:id`: exclusão lógica

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
- `GET /api/documentos/reprocessamentos/metricas`
- `GET /api/documentos/revisao/pendentes`
- `GET /api/documentos/:processamentoDocumentoId/revisao`
- `POST /api/documentos/:processamentoDocumentoId/revisao`
- `POST /api/documentos/:processamentoDocumentoId/reprocessar`
- `GET /api/documentos/:processamentoDocumentoId/condicionantes-candidatas`
- `POST /api/documentos/classificar`
- `POST /api/documentos/validar-geoespacial`

### Integrações governamentais

- `GET /api/integracoes/governo/dashboard`
- `GET /api/integracoes/governo/mtrs/:id`
- `GET /api/integracoes/governo/cdfs/:id`
- `POST /api/integracoes/governo/mtrs/:id/enviar` (suporta v1.10)
- `POST /api/integracoes/governo/cdfs/:id/enviar`
- `POST /api/integracoes/governo/mtrs/:id/reconciliar`
- `POST /api/integracoes/governo/cdfs/:id/reconciliar`
- `POST /api/integracoes/governo/webhooks/:system`

### IBAMA e Saneamento

- `GET /api/ibama/ctfs`: listagem de certificados
- `POST /api/ibama/tcfas/gerar-projecao`: cálculo estimado de taxas
- `POST /api/saneamento`: criação de anuência
- `GET /api/saneamento/cliente/:id`: anuências por cliente

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

### Opção 1: tudo com Docker (recomendado)

É o caminho mais simples para validar o sistema inteiro.

```bash
docker compose up -d --build
```

Após subir:

1. **Landing Page:** [http://localhost:8081](http://localhost:8081)
2. **Plataforma Web:** [http://localhost:8080](http://localhost:8080)
3. **API Healthcheck:** [http://localhost:3333/health](http://localhost:3333/health)
4. **MailHog:** [http://localhost:8025](http://localhost:8025)

### Opção 2: desenvolvimento com hot reload

Use esta opção quando você for alterar código no dia a dia.

Pré-requisitos:

- `Node.js 20+`
- `pnpm`
- `Docker` com `docker compose`

Setup:

```bash
git clone <repo>
cd Greenly

pnpm install
cp apps/api/.env.example apps/api/.env
printf "VITE_API_URL=http://localhost:3333/api\n" > apps/web/.env
```

Ajuste `apps/api/.env`:

```bash
DATABASE_URL=postgresql://postgres:greenly@localhost:5435/greenly
APP_URL=http://localhost:8080
API_URL=http://localhost:3333
CORS_ORIGIN=http://localhost:8080
```

Suba só infraestrutura:

```bash
docker compose up -d postgres redis mailhog
```

Prepare o banco:

```bash
pnpm --filter @greenly/api db:migrate
pnpm --filter @greenly/api db:sync:clean
pnpm --filter @greenly/api db:audit
pnpm --filter @greenly/api db:seed
```

Inicie os apps:

```bash
pnpm dev
```

### Portas padrão (referência)

- `site` (Landing Page): `http://localhost:8081`
- `web` (Plataforma B2B): `http://localhost:8080`
- `api`: `http://localhost:3333`
- `postgres`: `localhost:5435`
- `redis`: `localhost:6379`
- `mailhog`: `http://localhost:8025`

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
pnpm --filter @greenly/api db:migrate
pnpm --filter @greenly/api db:sync:clean
pnpm --filter @greenly/api db:audit
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
pnpm test:onda2:smoke:docker
pnpm test:onda3:smoke:docker
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
- `docs/OBRIGACOES_AMBIENTAIS_OFICIAIS.md`: padrão oficial das obrigações ambientais implementadas

## Roadmap resumido

Situação atual do plano:

- **Onda 1**: concluída tecnicamente
- **Onda 2**: concluída tecnicamente
- **Onda 3**: concluída tecnicamente
- **Onda 4**: planejada no plano mestre
- **Onda 5**: planejada no plano mestre

Backlog já registrado para depois:

- integrações ambientais gratuitas e oficiais como `INMET`, `ANA/SNIRH`, `INPE Queimadas`, `TerraBrasilis`, `MMA/CNUC` e base territorial `IBGE + CEP/CNPJ`;
- evolução dos pacotes comerciais e operacionais no plano mestre (`docs/plano_acao_benchmarking_ambisis.md`).

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
