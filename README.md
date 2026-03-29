<div align="center">

```
  ██████╗ ██████╗ ███████╗███████╗███╗   ██╗██╗  ██╗   ██╗
 ██╔════╝ ██╔══██╗██╔════╝██╔════╝████╗  ██║██║  ╚██╗ ██╔╝
 ██║  ███╗██████╔╝█████╗  █████╗  ██╔██╗ ██║██║   ╚████╔╝
 ██║   ██║██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║██║    ╚██╔╝
 ╚██████╔╝██║  ██║███████╗███████╗██║ ╚████║███████╗██║
  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝
```

**Plataforma SaaS B2B de Gestão e Compliance Ambiental**

_Centralize operações. Elimine riscos legais. Rastreie do berço ao túmulo._

---

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-FF4438?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-port_8080-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-orchestrated-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)

</div>

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [O Problema que Resolvemos](#2-o-problema-que-resolvemos)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitetura do Sistema](#4-arquitetura-do-sistema)
5. [Estrutura do Monorepo](#5-estrutura-do-monorepo)
6. [Módulos de Negócio](#6-módulos-de-negócio)
7. [Banco de Dados](#7-banco-de-dados)
8. [Autenticação e Autorização](#8-autenticação-e-autorização)
9. [Motor de Alertas](#9-motor-de-alertas)
10. [Infraestrutura e Deploy](#10-infraestrutura-e-deploy)
11. [Ambiente de Desenvolvimento](#11-ambiente-de-desenvolvimento)
12. [Testes](#12-testes)
13. [Variáveis de Ambiente](#13-variáveis-de-ambiente)
14. [Convenções do Projeto](#14-convenções-do-projeto)
15. [Roadmap](#15-roadmap)
16. [Contribuindo](#16-contribuindo)

---

## 1. Visão Geral

O **Greenly** é uma plataforma SaaS B2B construída para consultorias ambientais que precisam centralizar, monitorar e garantir o cumprimento de obrigações legais e operacionais de múltiplos clientes simultaneamente.

O sistema resolve três problemas críticos do setor:

| Problema                                   | Consequência sem o Greenly                         | Como o Greenly resolve                                                  |
| ------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Licenças ambientais vencendo sem renovação | Multas, embargos, interrupção de operação          | Dashboard com alertas proativos em 120/60/30 dias (janela configuravel) |
| Condicionantes não cumpridas               | Autuação pelo órgão ambiental, cassação de licença | Motor de alertas periódicos com rastreamento por ciclo                  |
| Resíduos sem rastreabilidade completa      | Responsabilidade civil solidária na cadeia         | Controle de MTR do berço ao CDF, validação de terceiros                 |

Atualização funcional mais recente (2026-03-28):

- Consulta automática de CNPJ no cadastro de clientes com autopreenchimento de dados cadastrais e endereço.
- Dashboard expandido com KPIs de conformidade, resíduos, emissões/recursos, visão setorial, timeline de vencimentos e drill-down de rastreabilidade.
- Consolidação de risco com leitura imediata de ativas/pendentes/vencidas e insights proativos.
- Hardening de responsividade para telas menores (tabelas e CRUDs sem vazamento, com rolagem horizontal quando necessário).
- Índice de documentos do projeto publicado em `docs/README.md`.

### Quem usa o Greenly

```
Consultoria Ambiental (Tenant)
│
├── Administrador da Consultoria
│   └── Gerencia clientes, usuários, faturamento e configurações do tenant
│
├── Analista Ambiental
│   └── Opera licenças, condicionantes e MTRs dos clientes designados
│
└── Cliente (Visualizador)
    └── Acesso somente-leitura aos dados da própria empresa
```

---

## 2. O Problema que Resolvemos

### Contexto Regulatório Brasileiro

A legislação ambiental brasileira — PNMA (Lei 6.938/81), PNRS (Lei 12.305/10), resoluções CONAMA e normas estaduais — impõe obrigações complexas e com prazos rigorosos às empresas. Consultorias ambientais gerenciam esse compliance para dezenas ou centenas de clientes simultaneamente.

Hoje, esse trabalho é feito em planilhas Excel, e-mails e memória humana.

### Riscos Gerenciados pelo Greenly

**Eixo Legal — Licenças e Condicionantes**

- Licença Prévia (LP), de Instalação (LI) e de Operação (LO) têm validades distintas e exigem renovação protocolar 120 dias antes do vencimento
- Cada licença pode conter dezenas de **condicionantes** — exigências que o empreendimento deve cumprir periodicamente (relatórios, monitoramentos, plantios, laudos)
- O descumprimento é autuado pelo órgão licenciador e pode gerar cassação da licença

**Eixo Operacional — Resíduos Sólidos**

- A PNRS (Política Nacional de Resíduos Sólidos) exige rastreabilidade total dos resíduos gerados
- O **MTR (Manifesto de Transporte de Resíduos)** documenta cada saída, e o **CDF (Certificado de Destinação Final)** encerra o ciclo
- Uma transportadora ou destinador com licença vencida torna a empresa co-responsável pelo passivo ambiental gerado

---

## 3. Stack Tecnológico

### Por que cada tecnologia foi escolhida

| Tecnologia      | Versão   | Papel                          | Justificativa                                                                                                                                             |
| --------------- | -------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript**  | 5.x      | Linguagem core (front + back)  | Contratos estritos entre camadas, detecção de erros em compile-time, autocomplete rico para regras de negócio complexas                                   |
| **Node.js**     | 22.x LTS | Runtime do backend             | Assíncrono por natureza, ideal para I/O intensivo (BD, Redis, uploads), ecossistema maduro                                                                |
| **Express.js**  | 5.x      | HTTP Server                    | Minimalista, compositional, permite estruturar middleware sem opiniões que conflitem com Clean Architecture                                               |
| **React**       | 18.x     | Frontend SPA                   | Componentização para painéis de controle complexos, ecossistema rico, base madura para evolução incremental                                               |
| **Vite**        | 8.x      | Build tool do frontend         | HMR instantâneo, tree-shaking agressivo, build de produção otimizado                                                                                      |
| **PostgreSQL**  | 16       | Banco relacional principal     | ACID compliance obrigatório para dados legais/transacionais, suporte robusto a multi-tenant via RLS ou column-level isolation, JSON nativo para auditoria |
| **Drizzle ORM** | 0.31.x   | ORM / Data Access Layer        | Type-safe com SQL explícito, schema em TypeScript e integração direta com PostgreSQL                                                                      |
| **Redis**       | 7.x      | Cache + Mensageria             | Cache de queries pesadas do dashboard, sessões, filas de background jobs via BullMQ                                                                       |
| **BullMQ**      | 5.x      | Sistema de filas (sobre Redis) | Processamento confiável de jobs com retry, delay, concorrência e observabilidade                                                                          |
| **Docker**      | 26.x     | Conteinerização                | Ambientes reproduzíveis, multistage builds para imagens enxutas                                                                                           |
| **Kubernetes**  | 1.30+    | Orquestração                   | Self-healing, HPA para scale horizontal, rolling deployments sem downtime                                                                                 |
| **Nginx**       | 1.26     | Reverse proxy / Static files   | Roteamento de tráfego, compressão gzip, servir assets do frontend                                                                                         |

### Bibliotecas de Suporte

**Backend**

```
zod              — Validação e parsing de DTOs com TypeScript inference
jsonwebtoken     — Geração e verificação de JWTs
bcryptjs         — Hash de senhas
nodemailer       — Envio de e-mails (alertas e notificações)
multer           — Upload de arquivos (documentos PDF de licenças)
winston          — Logging estruturado (JSON para produção)
node-cron        — Agendamento das rotinas de varredura de alertas
uuid             — Geração de UUIDs v4
dayjs            — Manipulação de datas (cálculo de prazos, vencimentos)
```

**Frontend**

```
react-router-dom — Roteamento SPA
@tanstack/react-query — Server state, cache de requisições, invalidação automática
zustand          — Client state (UI state, preferências do usuário)
react-hook-form  — Formulários com validação integrada ao Zod
recharts         — Gráficos do dashboard (licenças, volumes de resíduos)
date-fns         — Formatação de datas no frontend
axios            — HTTP client com interceptors para auth
lucide-react     — Ícones
tailwindcss      — Utility-first CSS
```

**DevOps / Tooling**

```
pnpm             — Package manager (workspaces para o monorepo)
eslint + prettier — Qualidade e formatação de código
husky + lint-staged — Pre-commit hooks
vitest           — Unit e integration tests
playwright       — E2E tests
```

---

## 4. Arquitetura do Sistema

### Padrão: Monolítico Modular com Clean Architecture

O Greenly é um **monolito**, escolhido deliberadamente para o MVP:

- Menor complexidade operacional (sem latência de rede entre serviços)
- Deploy simplificado no Kubernetes
- Refatoração para microsserviços possível no futuro sem reescrever o domínio

Internamente, segue a **Clean Architecture** de Robert C. Martin, com a **Regra da Dependência** como lei absoluta:

```
┌─────────────────────────────────────────────────────┐
│                  FRAMEWORKS & DRIVERS                │
│       Express, Drizzle ORM, Redis, BullMQ, Multer    │
│  ┌───────────────────────────────────────────────┐  │
│  │            INTERFACE ADAPTERS                  │  │
│  │    Controllers REST, DTOs, Presenters          │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │           APPLICATION                    │  │  │
│  │  │   Use Cases, Interfaces de Repositórios  │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │           DOMAIN                   │  │  │  │
│  │  │  │  Entidades, Value Objects, Erros   │  │  │  │
│  │  │  │  ← Nenhuma dependência externa →   │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
        Dependências apontam SEMPRE para dentro →
```

### Fluxo de uma Requisição

```
Cliente HTTP
    │
    ▼
[Nginx] ──────────────────────────────► [Assets Estáticos React]
    │
    ▼ /api/*
[Express App]
    │
    ├─ [Middleware: Auth JWT]
    ├─ [Middleware: Tenant Isolation]
    ├─ [Middleware: Rate Limit (Redis)]
    │
    ▼
[Controller] → valida DTO com Zod
    │
    ▼
[Use Case] → orquestra regras de negócio
    │
    ├──► [Domain Entity] → aplica regras puras
    │
    └──► [Repository Interface] → abstração do acesso a dados
              │
              ▼
         [Drizzle Repository] → executa queries no PostgreSQL
              │
              ▼
         [PostgreSQL] ←──► [Redis Cache]
```

### Comunicação Assíncrona (Background Jobs)

```
[Cron Job - node-cron]
    │  (executa diariamente as 07:00)
    ▼
[AlertaService]
    │  varre: licenças vencendo, condicionantes atrasadas, MTRs sem CDF
    ▼
[BullMQ Producer] ──────► [Redis Queue: greenly:alertas]
                                    │
                              [BullMQ Worker]
                                    │
                          ┌─────────┴──────────┐
                          ▼                    ▼
                   [EmailService]     [NotificacaoService]
                   (Nodemailer)       (in-app, via WebSocket
                                       ou polling)
```

---

## 5. Estrutura do Monorepo

O projeto usa **pnpm workspaces** com dois apps (`api`, `web`) e um pacote compartilhado (`packages/shared`).

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
│   └── web/
├── packages/
│   └── shared/
├── infra/
└── docs/
```

---

### `apps/api/` — Backend

```text
apps/api/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── db_README.md
└── src/
    ├── app.ts
    ├── server.ts
    ├── @types/
    │   └── express.d.ts
    ├── db/
    │   ├── index.ts                # cliente Drizzle + conexão postgres.js
    │   ├── seed.ts
    │   └── schema/
    │       ├── index.ts
    │       ├── enums.ts
    │       ├── users.ts
    │       ├── tenant.ts
    │       ├── licencas.ts
    │       ├── operacional.ts
    │       └── alertas.ts
    ├── modules/
    │   ├── auth/
    │   ├── cliente/
    │   ├── consultoria/
    │   ├── dashboard/
    │   ├── licenca/
    │   ├── notificacao/
    │   └── residuo/
    └── shared/
        ├── authMiddleware.ts
        ├── bullmq.ts
        ├── container.ts
        ├── errorHandler.ts
        ├── EmailService.ts
        ├── logger.ts
        ├── redis.ts
        ├── router.ts
        ├── jobs/
        ├── errors/
        └── utils/
```

---

### `apps/web/` — Frontend

```text
apps/web/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── layout/
    │   └── ui/
    ├── features/
    │   ├── auth/
    │   ├── clientes/
    │   ├── dashboard/
    │   ├── licencas/
    │   ├── notificacoes/
    │   └── residuos/
    ├── pages/
    ├── hooks/
    ├── lib/
    └── test/
```

---

### `packages/shared/` — Código Compartilhado

```text
packages/shared/
├── package.json
├── tsconfig.json
└── src/
    ├── contracts.ts
    ├── index.ts
    ├── types/
    │   ├── cliente.types.ts
    │   ├── condicionante.types.ts
    │   ├── licenca.types.ts
    │   ├── mtr.types.ts
    │   └── usuario.types.ts
    └── validators/
        ├── cnpj.validator.ts
        └── cpf.validator.ts
```

---

### `infra/` — Infraestrutura

```text
infra/
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── nginx/
│   └── default.conf
└── k8s/
    └── base/
        ├── namespace.yaml
        ├── api-deployment.yaml
        └── api-hpa.yaml
```

---

## 6. Módulos de Negócio

### Módulo Legal — Licenças e Condicionantes

**Endpoints principais:**

```
POST   /api/clientes/:clienteId/licencas              Cadastrar licença
GET    /api/clientes/:clienteId/licencas              Listar licenças (com filtros)
GET    /api/licencas/:id                              Detalhe da licença + condicionantes
PATCH  /api/licencas/:id                              Atualizar dados
PATCH  /api/licencas/:id/iniciar-renovacao            Marcar protocolo de renovação
POST   /api/licencas/:id/documentos                   Upload de PDF
GET    /api/licencas/:id/documentos/:docId            Download do documento

POST   /api/licencas/:licencaId/condicionantes        Criar condicionante
GET    /api/licencas/:licencaId/condicionantes        Listar condicionantes
PATCH  /api/condicionantes/:id/status                 Atualizar status
POST   /api/condicionantes/:id/cumprimentos           Registrar cumprimento (periódicas)
GET    /api/condicionantes/:id/cumprimentos           Histórico de cumprimentos
```

**Regras de negócio críticas:**

1. `dataLimiteRenovacao` é calculada automaticamente como `dataValidade - 120 dias` ao criar/atualizar uma licença
2. O status de uma licença só pode avançar em sequências válidas (máquina de estados)
3. Condicionante PERIÓDICA exige `periodicidade` definida — validado no Use Case e no banco
4. O status CUMPRIDA só pode ser aplicado se `dataCumprimento` for informada
5. Licença VENCIDA impede criação de novas condicionantes vinculadas a ela

### Módulo Operacional — Resíduos Sólidos

**Endpoints principais:**

```
POST   /api/clientes/:clienteId/fontes-geradoras      Cadastrar fonte geradora
POST   /api/fontes-geradoras/:id/inventario           Lançar inventário mensal
GET    /api/clientes/:clienteId/inventario            Histórico de geração

GET    /api/parceiros                                  Listar parceiros (global)
POST   /api/parceiros                                  Cadastrar parceiro
PATCH  /api/parceiros/:id/licenca                     Renovar licença do parceiro

POST   /api/clientes/:clienteId/mtrs                  Emitir MTR
GET    /api/clientes/:clienteId/mtrs                  Listar MTRs
GET    /api/mtrs/:id                                  Detalhe do MTR
PATCH  /api/mtrs/:id/status                           Avançar status (coleta → recebimento → CDF)
POST   /api/mtrs/:id/cdf                              Upload do CDF — encerra ciclo
```

**Regras de negócio críticas:**

1. `EmitirMTRUseCase` verifica `licencaAtiva` e `licencaValidade` de AMBOS transportadora e destinador antes de prosseguir
2. O ciclo do MTR é unidirecional: EMITIDO → EM_TRANSITO → RECEBIDO → CDF_EMITIDO
3. CANCELADO só é possível a partir de EMITIDO (antes da coleta)
4. Um MTR COM_DIVERGENCIA bloqueia o avanço automático e requer revisão manual

---

## 7. Banco de Dados

Veja os arquivos em [`apps/api/src/db/schema/`](apps/api/src/db/schema) para o schema completo em Drizzle ORM.

### Estratégia Multi-Tenant

O isolamento dos dados entre consultorias é garantido por **column-level tenancy**: toda tabela de dados sensíveis contém `consultoriaId` (direta ou via join com `clientes`). O middleware `tenant.middleware.ts` injeta o `consultoriaId` do token JWT e a camada de repositório aplica filtros em todas as queries via Drizzle.

Não utilizamos PostgreSQL Row Level Security (RLS) no MVP para reduzir complexidade operacional, mas a arquitetura permite migrar para RLS sem alterar o schema.

### Soft Delete

Tabelas com dados de valor legal (`licencas`, `condicionantes`, `mtrs`, `clientes`) usam soft delete via coluna `deletadoEm`. Queries padrão sempre incluem `WHERE deletadoEm IS NULL`. Dados deletados são mantidos por obrigação legal e auditoria.

### Performance

As queries mais pesadas do dashboard são servidas pelas **Views PostgreSQL** (`vw_dashboard_consultoria`, `vw_licencas_criticas`, `vw_mtrs_pendentes_cdf`) com resultados cacheados no Redis por 5 minutos. O cache é invalidado quando licenças ou MTRs são atualizados.

---

## 8. Autenticação e Autorização

### Fluxo JWT + Refresh Token

```
Login (POST /api/auth/login)
    │
    ▼ Verifica credenciais
    │
    ├── Access Token (JWT)     — expira em 15 minutos
    │   Payload: { sub: userId, consultoriaId, role, exp }
    │
    └── Refresh Token (UUID)   — expira em 7 dias
        Armazenado: tabela `sessoes` (DB) + Cookie HttpOnly

Renovação (POST /api/auth/refresh)
    │ Cookie com refresh token
    ▼
    Valida no BD → emite novo access token + rotaciona refresh token
```

### RBAC — Controle de Acesso por Role

| Recurso                           | ADMIN | ANALISTA           | VIEWER            |
| --------------------------------- | ----- | ------------------ | ----------------- |
| Gerenciar usuários da consultoria | ✅    | ❌                 | ❌                |
| Ver todos os clientes             | ✅    | ❌ (só designados) | ❌ (só o próprio) |
| CRUD de licenças                  | ✅    | ✅                 | ❌                |
| Emitir MTR                        | ✅    | ✅                 | ❌                |
| Ver dashboard própria empresa     | ✅    | ✅                 | ✅                |
| Exportar relatórios               | ✅    | ✅                 | ❌                |
| Configurações da consultoria      | ✅    | ❌                 | ❌                |

---

## 9. Motor de Alertas

O sistema de alertas é construído sobre **Redis + BullMQ**, operando com dois tipos de rotinas:

### Cron Jobs (node-cron)

| Job                    | Frequência        | O que faz                                                                       |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `VarreduraAlertasCron` | Todo dia as 07:00 | Varre licencas e condicionantes proximas do prazo e enfileira alertas           |
| `StatusUpdaterCron`    | Todo dia as 00:30 | Atualiza status de licencas vencidas e condicionantes atrasadas automaticamente |

### Regras de Alerta

**Licencas:**

- Janela legal de renovacao (padrao: 120 dias) -> alerta preventivo
- 60 dias -> alerta de urgencia
- 30 dias -> alerta critico

**Condicionantes:**

- Janela configuravel (padrao: 30 dias) -> lembrete
- 7 dias antes -> urgencia
- No dia -> critico
- Apos o prazo -> status muda para ATRASADA automaticamente

**MTRs:**

- 30 dias sem CDF apos emissao -> lembrete
- 60 dias -> urgencia

**Parceiros:**

- Janela configuravel (padrao: 60 dias) antes do vencimento da licenca -> alerta preventivo

### Filas BullMQ

```
greenly:alertas          — Fila principal de alertas (email + in-app)
greenly:email            — Fila dedicada para envio de e-mails
greenly:notificacoes     — Fila para notificações in-app
```

---

## 10. Infraestrutura e Deploy

### Docker

**Multistage Build da API:**

```
Stage 1 (builder): node:22-alpine → instala deps, compila TypeScript
Stage 2 (prod):    node:22-alpine → copia apenas dist/ e node_modules de prod
Tamanho final: ~150MB
```

**docker-compose.yml (desenvolvimento local):**

```yaml
Serviços: api       → localhost:3333
  web       → localhost:8080 (container Nginx servindo o build)
  postgres  → localhost:5435
  redis     → localhost:6379
  mailhog   → localhost:8025 (captura e-mails em dev)
```

### Kubernetes

**Componentes:**

| Recurso          | Configuração                                             |
| ---------------- | -------------------------------------------------------- |
| `api-deployment` | 2 réplicas mínimas, rolling update                       |
| `api-hpa`        | CPU > 70% → escala até 10 réplicas                       |
| `web-deployment` | 2 réplicas (Nginx servindo build React)                  |
| `ingress`        | TLS via cert-manager, roteamento `/api` → api, `/` → web |
| `configmap`      | `NODE_ENV`, `LOG_LEVEL`, `REDIS_HOST`                    |
| `secrets`        | Referências ao AWS Secrets Manager (não commitados)      |

**PostgreSQL e Redis em produção:** Serviços gerenciados externos ao cluster (ex: AWS RDS + ElastiCache) para garantir persistência, backups automatizados e segurança.

---

## 11. Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 22.x LTS
- pnpm 9.x (`npm install -g pnpm`)
- Docker Desktop
- Git

### Setup Inicial

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-org/greenly.git
cd greenly

# 2. Instalar dependências (todos os workspaces)
pnpm install

# 3. Copiar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
# apps/web não possui .env.example; crie apenas se quiser sobrescrever a API
echo "VITE_API_URL=http://localhost:3333/api" > apps/web/.env

# 4. Subir serviços de infraestrutura
docker compose up -d postgres redis mailhog

# 5. Rodar migrations e seed do banco
cd apps/api
pnpm db:generate
pnpm db:push
pnpm db:seed

# 6. Iniciar backend e frontend em modo dev
cd ../..
pnpm dev          # Inicia api (porta 3333) e web (porta 8080) em paralelo
```

### Comandos Úteis

```bash
# Backend
pnpm --filter @greenly/api dev               # Dev com hot-reload (tsx watch)
pnpm --filter @greenly/api build             # Compilar TypeScript
pnpm --filter @greenly/api test              # Vitest — unit tests
pnpm --filter @greenly/api test:integration  # Testes com banco real

# Frontend
pnpm --filter @greenly/web dev               # Vite dev server
pnpm --filter @greenly/web build             # Build de produção
pnpm --filter @greenly/web test              # Vitest — component tests

# Banco de dados
pnpm --filter @greenly/api db:generate       # Gerar migration a partir do schema
pnpm --filter @greenly/api db:migrate        # Aplicar migrations versionadas
pnpm --filter @greenly/api db:push           # Sincronizar schema no banco (sem migration SQL)
pnpm --filter @greenly/api db:studio         # Abrir Drizzle Studio
pnpm --filter @greenly/api db:seed           # Rodar seed

# Qualidade de código
pnpm lint                           # ESLint em todos os workspaces
pnpm format                         # Prettier em todos os workspaces
pnpm typecheck                      # tsc --noEmit em todos os workspaces
```

---

## 12. Testes

### Estratégia de Testes

```
Unit Tests (Vitest)
│  Testam: Entidades, Value Objects, Use Cases
│  Mocks: Repositórios mockados em memória
│  Cobertura alvo: 90%+ do Domain e Application
│
Integration Tests (Vitest + Testcontainers)
│  Testam: Repositórios Drizzle com PostgreSQL real
│  Setup: Container Docker efêmero por test suite
│  Cobertura alvo: Todos os repositórios e queries complexas
│
E2E Tests (Playwright)
   Testam: Fluxos completos via HTTP (API) e browser (Web)
   Exemplos:
     - Login → criar licença → cadastrar condicionante → registrar cumprimento
     - Emitir MTR → avançar para CDF → verificar status no dashboard
```

### Rodando os Testes

```bash
# Todos os testes
pnpm test

# Com cobertura (API)
pnpm --filter @greenly/api test:coverage

# E2E (requer docker compose rodando)
pnpm test:e2e

# Watch mode (desenvolvimento)
pnpm --filter @greenly/api test:watch

# Smokes de fluxo (API/Web)
pnpm test:sprint1:smoke
pnpm test:sprint2:smoke
pnpm test:cdf:smoke
pnpm test:sprint3:smoke

# Gate técnico completo da Sprint 3
pnpm gate:sprint3

# Operação de homologação externa (guiada)
# ver: docs/sprint3_homologacao_externa_runbook.md
```

---

## 13. Variáveis de Ambiente

### `apps/api/.env`

```bash
# Aplicação
NODE_ENV=development
PORT=3333
LOG_LEVEL=debug

# Banco de Dados
DATABASE_URL="postgresql://postgres:greenly@localhost:5435/greenly"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=seu_secret_super_seguro_aqui
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=outro_secret_diferente_aqui
JWT_REFRESH_EXPIRES_IN=7d

# E-mail (desenvolvimento: usar MailHog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Greenly <noreply@greenly.app>"

# Storage de Documentos
STORAGE_PROVIDER=local        # local | s3 | gcs
STORAGE_LOCAL_PATH=./uploads
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# App
APP_URL=http://localhost:8080
API_URL=http://localhost:3333

# Compliance (janela de alertas)
LICENCA_RENOVACAO_ANTECEDENCIA_DIAS=120
CONDICIONANTE_ALERTA_DIAS=30
PARCEIRO_LICENCA_ALERTA_DIAS=60
```

### `apps/web/.env`

```bash
VITE_API_URL=http://localhost:3333/api
```

---

## 14. Convenções do Projeto

### Nomenclatura

| Artefato            | Convenção                   | Exemplo                     |
| ------------------- | --------------------------- | --------------------------- |
| Arquivos de domínio | `PascalCase.ts`             | `Licenca.ts`, `Email.vo.ts` |
| Use Cases           | `VerbSubstantivoUseCase.ts` | `CriarLicencaUseCase.ts`    |
| Interfaces (Ports)  | `IPascalCase.ts`            | `ILicencaRepository.ts`     |
| Controllers         | `kebab-case.controller.ts`  | `licencas.controller.ts`    |
| DTOs                | `acao-recurso.dto.ts`       | `criar-licenca.dto.ts`      |
| Erros de domínio    | `NomeCamelCase.error.ts`    | `LicencaVencida.error.ts`   |
| Componentes React   | `PascalCase.tsx`            | `LicencaStatusBadge.tsx`    |
| Hooks               | `useCamelCase.ts`           | `useLicencas.ts`            |

### Commits

Seguimos o padrão **Conventional Commits**:

```
feat(licencas): adicionar use case de renovação de licença
fix(alertas): corrigir cálculo de próximo prazo para condicionantes mensais
docs(readme): atualizar estrutura de pastas do módulo de resíduos
refactor(auth): extrair validação de token para helper
test(domain): adicionar testes para value object PrazoRenovacao
chore(deps): atualizar drizzle-orm para 0.31.x
```

### Regra da Dependência (CRÍTICA)

```typescript
// ✅ CORRETO — Use Case usa apenas a interface (Port)
import { ILicencaRepository } from '../application/ILicencaRepository'

// ❌ ERRADO — Use Case importando diretamente o Drizzle (quebra Clean Architecture)
import { db } from '@/db'
import { LicencaRepository } from '../infrastructure/LicencaRepository'
```

As camadas `domain/` e `application/` não podem importar nada de `infrastructure/` ou de libs externas de infraestrutura.

---

## 15. Roadmap

Status da Onda 1 (Sprints 1-3): concluída tecnicamente.
Observação: o checklist abaixo inclui metas ampliadas de MVP/pós-MVP, portanto alguns itens permanecem abertos mesmo com a Onda 1 encerrada.

### MVP (atual)

- [x] Schema do banco de dados completo
- [ ] Autenticação JWT + RBAC
- [ ] Módulo de Licenças (CRUD + upload de documentos)
- [ ] Módulo de Condicionantes (pontuais e periódicas)
- [ ] Motor de alertas (BullMQ + e-mail)
- [ ] Módulo de Resíduos (MTR + inventário)
- [ ] Homologação de parceiros (transportadoras e destinadores)
- [ ] Dashboard do analista
- [ ] Deploy K8s no ambiente de staging

### Pós-MVP (v1.1)

- [ ] Relatórios exportáveis em PDF (inventário anual de resíduos, condicionantes cumpridas)
- [ ] Portal do cliente (self-service para o visualizador)
- [ ] Integração com SINIR (Sistema Nacional de Informações sobre a Gestão de Resíduos)
- [ ] Notificações via WhatsApp (Twilio)
- [ ] API pública para integração com sistemas dos clientes

### Futuro (v2.0)

- [ ] Módulo de Outorgas (uso de recursos hídricos)
- [ ] Módulo de PPRA/PCMSO (saúde e segurança do trabalho)
- [ ] Georreferenciamento de áreas de influência
- [ ] App mobile (React Native) para analistas em campo
- [ ] Migração seletiva para microsserviços (módulos de resíduos e alertas)

---

## 16. Contribuindo

### Fluxo de Trabalho

```
main          ←── PRs aprovados (deploy automático para produção)
  │
  └── staging ←── PRs de develop (deploy automático para staging)
        │
        └── develop ←── PRs de feature branches
              │
              └── feature/nome-da-feature
```

1. Crie uma branch a partir de `develop`: `git checkout -b feature/criar-condicionante-periodica`
2. Desenvolva com testes
3. Rode `pnpm lint && pnpm typecheck && pnpm test` antes do push
4. Abra Pull Request para `develop` com descrição do que foi feito e por quê
5. Code review por pelo menos 1 pessoa
6. Merge com squash

### Abrindo Issues

Use os templates disponíveis em `.github/ISSUE_TEMPLATE/`:

- `bug_report.md` — para bugs encontrados
- `feature_request.md` — para novas funcionalidades
- `adr.md` — para propor decisões arquiteturais

---

## 🔑 Credenciais Padrão

- **Banco de Dados**:
  - Usuário: `postgres`
  - Senha: `greenly`
  - Banco: `greenly`
- **Acesso Sistema**:
  - E-mail: `admin@greenly.app`
  - Senha: `greenly123` (conforme definido no seed padrão)

---

<div align="center">

**Greenly** — Construído com propósito. Para um compliance ambiental sem surpresas.

_Desenvolvido por Gu & Kara_ 🌿

</div>
