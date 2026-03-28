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

*Centralize operações. Elimine riscos legais. Rastreie do berço ao túmulo.*

---

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-FF4438?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-port_8081-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-orchestrated-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)

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

| Problema | Consequência sem o Greenly | Como o Greenly resolve |
|---|---|---|
| Licenças ambientais vencendo sem renovação | Multas, embargos, interrupção de operação | Dashboard com alertas proativos em 90/60/30 dias |
| Condicionantes não cumpridas | Autuação pelo órgão ambiental, cassação de licença | Motor de alertas periódicos com rastreamento por ciclo |
| Resíduos sem rastreabilidade completa | Responsabilidade civil solidária na cadeia | Controle de MTR do berço ao CDF, validação de terceiros |

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

| Tecnologia | Versão | Papel | Justificativa |
|---|---|---|---|
| **TypeScript** | 5.x | Linguagem core (front + back) | Contratos estritos entre camadas, detecção de erros em compile-time, autocomplete rico para regras de negócio complexas |
| **Node.js** | 22.x LTS | Runtime do backend | Assíncrono por natureza, ideal para I/O intensivo (BD, Redis, uploads), ecossistema maduro |
| **Express.js** | 5.x | HTTP Server | Minimalista, compositional, permite estruturar middleware sem opiniões que conflitem com Clean Architecture |
| **React** | 19.x | Frontend SPA | Componentização para painéis de controle complexos, ecossistema rico, Server Components para páginas estáticas |
| **Vite** | 6.x | Build tool do frontend | HMR instantâneo, tree-shaking agressivo, build de produção otimizado |
| **PostgreSQL** | 16 | Banco relacional principal | ACID compliance obrigatório para dados legais/transacionais, suporte robusto a multi-tenant via RLS ou column-level isolation, JSON nativo para auditoria |
| **Prisma** | 5.x | ORM / Data Access Layer | Type-safe, migrations versionadas, isolado das regras de negócio conforme Clean Architecture |
| **Redis** | 7.x | Cache + Mensageria | Cache de queries pesadas do dashboard, sessões, filas de background jobs via BullMQ |
| **BullMQ** | 5.x | Sistema de filas (sobre Redis) | Processamento confiável de jobs com retry, delay, concorrência e observabilidade |
| **Docker** | 26.x | Conteinerização | Ambientes reproduzíveis, multistage builds para imagens enxutas |
| **Kubernetes** | 1.30+ | Orquestração | Self-healing, HPA para scale horizontal, rolling deployments sem downtime |
| **Nginx** | 1.26 | Reverse proxy / Static files | Roteamento de tráfego, compressão gzip, servir assets do frontend |

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
│         Express, Prisma, Redis, BullMQ, Multer       │
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
         [Prisma Repository] → executa queries no PostgreSQL
              │
              ▼
         [PostgreSQL] ←──► [Redis Cache]
```

### Comunicação Assíncrona (Background Jobs)

```
[Cron Job - node-cron]
    │  (executa a cada hora)
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

O projeto usa **pnpm workspaces**, dividido em três pacotes principais:

```
greenly/
│
├── 📄 README.md
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 .eslintrc.js
├── 📄 .prettierrc
├── 📄 docker-compose.yml          # Ambiente local completo
├── 📄 docker-compose.prod.yml     # Configuração de produção
├── 📄 package.json                # Root workspace (pnpm)
├── 📄 pnpm-workspace.yaml
├── 📄 tsconfig.base.json          # tsconfig compartilhado
│
├── 📁 apps/
│   ├── 📁 api/                    # Backend Node.js + Express
│   └── 📁 web/                    # Frontend React + Vite
│
├── 📁 packages/
│   ├── 📁 shared/                 # Código compartilhado (tipos, validações)
│   └── 📁 eslint-config/          # Config ESLint compartilhada
│
├── 📁 infra/
│   ├── 📁 k8s/                    # Manifests Kubernetes
│   ├── 📁 docker/                 # Dockerfiles de cada serviço
│   └── 📁 nginx/                  # Configuração do Nginx
│
└── 📁 docs/
    ├── 📁 architecture/           # Diagramas e decisões de arquitetura
    ├── 📁 api/                    # Documentação OpenAPI (gerada)
    └── 📁 adr/                    # Architecture Decision Records
```

---

### `apps/api/` — Backend

```
apps/api/
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 Dockerfile
├── 📄 .env.example
│
├── 📁 src/
│   │
│   ├── 📄 server.ts               # Entry point: configura e sobe o Express
│   ├── 📄 app.ts                  # Configura middlewares globais, rotas e error handler
│   │
│   ├── 📁 modules/                # Módulos de negócio (um por domínio)
│   │   │
│   │   ├── 📁 auth/               # Autenticação e gestão de sessões
│   │   │   ├── 📁 domain/
│   │   │   │   ├── 📄 Usuario.ts              # Entidade Usuario
│   │   │   │   ├── 📄 Sessao.ts               # Entidade Sessao
│   │   │   │   ├── 📄 Email.vo.ts             # Value Object: Email validado
│   │   │   │   ├── 📄 SenhaHash.vo.ts         # Value Object: Senha hasheada
│   │   │   │   └── 📄 errors/
│   │   │   │       ├── 📄 CredenciaisInvalidas.error.ts
│   │   │   │       └── 📄 UsuarioBloqueado.error.ts
│   │   │   ├── 📁 application/
│   │   │   │   ├── 📄 IUsuarioRepository.ts   # Port (interface)
│   │   │   │   ├── 📄 ISessaoRepository.ts    # Port (interface)
│   │   │   │   ├── 📄 LoginUseCase.ts
│   │   │   │   ├── 📄 LogoutUseCase.ts
│   │   │   │   ├── 📄 RefreshTokenUseCase.ts
│   │   │   │   ├── 📄 RegistrarUsuarioUseCase.ts
│   │   │   │   └── 📄 RedefinirSenhaUseCase.ts
│   │   │   ├── 📁 interface/
│   │   │   │   ├── 📄 auth.controller.ts
│   │   │   │   ├── 📄 auth.routes.ts
│   │   │   │   └── 📄 dtos/
│   │   │   │       ├── 📄 login.dto.ts
│   │   │   │       └── 📄 registrar.dto.ts
│   │   │   └── 📁 infrastructure/
│   │   │       ├── 📄 PrismaUsuarioRepository.ts
│   │   │       └── 📄 PrismaSessaoRepository.ts
│   │   │
│   │   ├── 📁 consultorias/       # Gestão do tenant
│   │   │   ├── 📁 domain/
│   │   │   │   ├── 📄 Consultoria.ts
│   │   │   │   ├── 📄 CNPJ.vo.ts              # Value Object: CNPJ validado
│   │   │   │   ├── 📄 Slug.vo.ts              # Value Object: Slug único
│   │   │   │   └── 📄 errors/
│   │   │   │       └── 📄 ConsultoriaNaoEncontrada.error.ts
│   │   │   ├── 📁 application/
│   │   │   │   ├── 📄 IConsultoriaRepository.ts
│   │   │   │   ├── 📄 CriarConsultoriaUseCase.ts
│   │   │   │   └── 📄 AtualizarConsultoriaUseCase.ts
│   │   │   ├── 📁 interface/
│   │   │   │   ├── 📄 consultorias.controller.ts
│   │   │   │   ├── 📄 consultorias.routes.ts
│   │   │   │   └── 📄 dtos/
│   │   │   └── 📁 infrastructure/
│   │   │       └── 📄 PrismaConsultoriaRepository.ts
│   │   │
│   │   ├── 📁 clientes/           # Empresas atendidas pela consultoria
│   │   │   ├── 📁 domain/
│   │   │   │   ├── 📄 Cliente.ts
│   │   │   │   ├── 📄 Instalacao.ts
│   │   │   │   └── 📄 errors/
│   │   │   ├── 📁 application/
│   │   │   │   ├── 📄 IClienteRepository.ts
│   │   │   │   ├── 📄 CriarClienteUseCase.ts
│   │   │   │   ├── 📄 ListarClientesUseCase.ts
│   │   │   │   ├── 📄 AtualizarClienteUseCase.ts
│   │   │   │   └── 📄 DesativarClienteUseCase.ts
│   │   │   ├── 📁 interface/
│   │   │   │   ├── 📄 clientes.controller.ts
│   │   │   │   ├── 📄 clientes.routes.ts
│   │   │   │   └── 📄 dtos/
│   │   │   └── 📁 infrastructure/
│   │   │       └── 📄 PrismaClienteRepository.ts
│   │   │
│   │   ├── 📁 licencas/           # ★ MÓDULO LEGAL — CORE DO MVP
│   │   │   ├── 📁 domain/
│   │   │   │   ├── 📄 Licenca.ts                      # Entidade agregado-raiz
│   │   │   │   ├── 📄 Condicionante.ts                # Entidade filha
│   │   │   │   ├── 📄 CumprimentoCondicionante.ts     # Entidade de ciclo periódico
│   │   │   │   ├── 📄 NumeroLicenca.vo.ts             # Value Object
│   │   │   │   ├── 📄 PrazoRenovacao.vo.ts            # Value Object: calcula 120 dias
│   │   │   │   ├── 📄 PeriodoCumprimento.vo.ts        # Value Object: referência de ciclo
│   │   │   │   └── 📄 errors/
│   │   │   │       ├── 📄 LicencaNaoEncontrada.error.ts
│   │   │   │       ├── 📄 LicencaVencida.error.ts
│   │   │   │       ├── 📄 CondicionanteAtrasada.error.ts
│   │   │   │       └── 📄 StatusInvalido.error.ts
│   │   │   ├── 📁 application/
│   │   │   │   ├── 📄 ILicencaRepository.ts
│   │   │   │   ├── 📄 ICondicionanteRepository.ts
│   │   │   │   ├── 📄 IDocumentoStorage.ts            # Port para upload (S3/GCS)
│   │   │   │   ├── 📄 CriarLicencaUseCase.ts
│   │   │   │   ├── 📄 AtualizarLicencaUseCase.ts
│   │   │   │   ├── 📄 IniciarRenovacaoUseCase.ts
│   │   │   │   ├── 📄 UploadDocumentoLicencaUseCase.ts
│   │   │   │   ├── 📄 ListarLicencasUseCase.ts
│   │   │   │   ├── 📄 ObterLicencaDetalheUseCase.ts
│   │   │   │   ├── 📄 CriarCondicionanteUseCase.ts
│   │   │   │   ├── 📄 AtualizarStatusCondicionanteUseCase.ts
│   │   │   │   ├── 📄 RegistrarCumprimentoUseCase.ts
│   │   │   │   └── 📄 GerarRelatorioLicencasUseCase.ts
│   │   │   ├── 📁 interface/
│   │   │   │   ├── 📄 licencas.controller.ts
│   │   │   │   ├── 📄 licencas.routes.ts
│   │   │   │   ├── 📄 condicionantes.controller.ts
│   │   │   │   ├── 📄 condicionantes.routes.ts
│   │   │   │   └── 📄 dtos/
│   │   │   │       ├── 📄 criar-licenca.dto.ts
│   │   │   │       ├── 📄 atualizar-licenca.dto.ts
│   │   │   │       ├── 📄 criar-condicionante.dto.ts
│   │   │   │       └── 📄 registrar-cumprimento.dto.ts
│   │   │   └── 📁 infrastructure/
│   │   │       ├── 📄 PrismaLicencaRepository.ts
│   │   │       ├── 📄 PrismaCondicionanteRepository.ts
│   │   │       └── 📄 S3DocumentoStorage.ts           # Implementa IDocumentoStorage
│   │   │
│   │   ├── 📁 residuos/           # ★ MÓDULO OPERACIONAL
│   │   │   ├── 📁 domain/
│   │   │   │   ├── 📄 MTR.ts                          # Entidade agregado-raiz
│   │   │   │   ├── 📄 FonteGeradora.ts
│   │   │   │   ├── 📄 InventarioResiduo.ts
│   │   │   │   ├── 📄 Parceiro.ts
│   │   │   │   ├── 📄 VolumeResiduo.vo.ts             # Value Object: volume + unidade
│   │   │   │   ├── 📄 CompetenciaMensal.vo.ts         # Value Object: mês/ano validado
│   │   │   │   └── 📄 errors/
│   │   │   │       ├── 📄 ParceiroSemLicenca.error.ts # Regra crítica de negócio
│   │   │   │       ├── 📄 MTRNaoEncontrado.error.ts
│   │   │   │       └── 📄 TransicaoStatusInvalida.error.ts
│   │   │   ├── 📁 application/
│   │   │   │   ├── 📄 IMTRRepository.ts
│   │   │   │   ├── 📄 IParceiroRepository.ts
│   │   │   │   ├── 📄 IInventarioRepository.ts
│   │   │   │   ├── 📄 EmitirMTRUseCase.ts             # Valida licença do parceiro
│   │   │   │   ├── 📄 AvancarStatusMTRUseCase.ts
│   │   │   │   ├── 📄 RegistrarCDFUseCase.ts          # Encerra o ciclo do MTR
│   │   │   │   ├── 📄 LancarInventarioUseCase.ts
│   │   │   │   ├── 📄 CadastrarParceiroUseCase.ts
│   │   │   │   ├── 📄 RenovarLicencaParceiroUseCase.ts
│   │   │   │   └── 📄 GerarRelatorioResiduosUseCase.ts
│   │   │   ├── 📁 interface/
│   │   │   │   ├── 📄 mtrs.controller.ts
│   │   │   │   ├── 📄 mtrs.routes.ts
│   │   │   │   ├── 📄 parceiros.controller.ts
│   │   │   │   ├── 📄 parceiros.routes.ts
│   │   │   │   ├── 📄 inventario.controller.ts
│   │   │   │   ├── 📄 inventario.routes.ts
│   │   │   │   └── 📄 dtos/
│   │   │   └── 📁 infrastructure/
│   │   │       ├── 📄 PrismaMTRRepository.ts
│   │   │       ├── 📄 PrismaParceiroRepository.ts
│   │   │       └── 📄 PrismaInventarioRepository.ts
│   │   │
│   │   └── 📁 dashboard/          # Queries otimizadas para o painel
│   │       ├── 📁 application/
│   │       │   ├── 📄 IDashboardRepository.ts
│   │       │   ├── 📄 ObterMetricasConsultoriaUseCase.ts
│   │       │   └── 📄 ObterMetricasAnalistaUseCase.ts
│   │       ├── 📁 interface/
│   │       │   ├── 📄 dashboard.controller.ts
│   │       │   └── 📄 dashboard.routes.ts
│   │       └── 📁 infrastructure/
│   │           └── 📄 PrismaDashboardRepository.ts    # Usa as Views do PostgreSQL
│   │
│   ├── 📁 shared/                 # Código compartilhado entre módulos
│   │   ├── 📁 domain/
│   │   │   ├── 📄 Entity.ts                   # Classe base de Entidade (id, createdAt)
│   │   │   ├── 📄 ValueObject.ts              # Classe base de Value Object
│   │   │   ├── 📄 DomainError.ts              # Classe base de Erros de Domínio
│   │   │   └── 📄 UniqueEntityId.ts           # Wrapper de UUID
│   │   ├── 📁 application/
│   │   │   ├── 📄 UseCase.ts                  # Interface base de Use Case
│   │   │   └── 📄 IEmailService.ts            # Port para envio de e-mail
│   │   └── 📁 infrastructure/
│   │       ├── 📄 NodemailerEmailService.ts
│   │       └── 📄 S3StorageService.ts
│   │
│   └── 📁 infra/                  # Configurações globais da aplicação
│       ├── 📄 prisma.ts               # Singleton do PrismaClient
│       ├── 📄 redis.ts                # Singleton do Redis client
│       ├── 📄 bullmq.ts              # Configuração das filas BullMQ
│       ├── 📄 logger.ts              # Winston logger configurado
│       ├── 📁 http/
│       │   ├── 📄 middlewares/
│       │   │   ├── 📄 auth.middleware.ts       # Verifica e decodifica JWT
│       │   │   ├── 📄 tenant.middleware.ts     # Injeta consultoriaId na request
│       │   │   ├── 📄 rbac.middleware.ts       # Verifica permissões por role
│       │   │   ├── 📄 rateLimit.middleware.ts  # Rate limiting via Redis
│       │   │   ├── 📄 upload.middleware.ts     # Multer para PDFs
│       │   │   └── 📄 errorHandler.middleware.ts
│       │   └── 📄 router.ts           # Registro central de todas as rotas
│       ├── 📁 jobs/
│       │   ├── 📄 AlertasWorker.ts    # Worker BullMQ que processa alertas
│       │   ├── 📄 VarreduraAlertasCron.ts  # node-cron: varre BD e enfileira
│       │   └── 📄 StatusUpdaterCron.ts     # Atualiza status de licenças/condicionantes
│       └── 📁 container/
│           └── 📄 index.ts            # Injeção de dependências manual (sem framework)
│
├── 📁 prisma/
│   ├── 📄 schema.prisma
│   ├── 📄 seed.ts
│   └── 📁 migrations/
│       ├── 📁 20240101_init/
│       └── 📄 post_prisma_customizations.sql
│
└── 📁 tests/
    ├── 📁 unit/                   # Testes de entidades e use cases
    │   ├── 📁 domain/
    │   └── 📁 application/
    ├── 📁 integration/            # Testes com BD real (Testcontainers)
    └── 📁 e2e/                    # Playwright — fluxos completos via HTTP
```

---

### `apps/web/` — Frontend

```
apps/web/
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 tailwind.config.ts
├── 📄 index.html
│
├── 📁 src/
│   │
│   ├── 📄 main.tsx                # Entry point React
│   ├── 📄 App.tsx                 # Router root + Providers
│   │
│   ├── 📁 pages/                  # Uma pasta por rota principal
│   │   ├── 📁 auth/
│   │   │   ├── 📄 LoginPage.tsx
│   │   │   └── 📄 RedefinirSenhaPage.tsx
│   │   ├── 📁 dashboard/
│   │   │   └── 📄 DashboardPage.tsx           # Painel principal do analista
│   │   ├── 📁 licencas/
│   │   │   ├── 📄 LicencasPage.tsx            # Lista com filtros
│   │   │   ├── 📄 LicencaDetalhePage.tsx      # Detalhe + condicionantes
│   │   │   └── 📄 LicencaFormPage.tsx         # Criação/edição
│   │   ├── 📁 condicionantes/
│   │   │   └── 📄 CondicionanteFormPage.tsx
│   │   ├── 📁 residuos/
│   │   │   ├── 📄 MTRsPage.tsx
│   │   │   ├── 📄 MTRDetalhePage.tsx
│   │   │   ├── 📄 MTRFormPage.tsx
│   │   │   ├── 📄 InventarioPage.tsx
│   │   │   └── 📄 ParceirosPage.tsx
│   │   ├── 📁 clientes/
│   │   │   ├── 📄 ClientesPage.tsx
│   │   │   └── 📄 ClienteDetalhePage.tsx
│   │   └── 📁 configuracoes/
│   │       ├── 📄 UsuariosPage.tsx
│   │       └── 📄 ConsultoriaPage.tsx
│   │
│   ├── 📁 components/             # Componentes reutilizáveis
│   │   ├── 📁 ui/                 # Design system base (atômicos)
│   │   │   ├── 📄 Button.tsx
│   │   │   ├── 📄 Input.tsx
│   │   │   ├── 📄 Select.tsx
│   │   │   ├── 📄 Badge.tsx       # Status de licença, condicionante, MTR
│   │   │   ├── 📄 Card.tsx
│   │   │   ├── 📄 Modal.tsx
│   │   │   ├── 📄 Table.tsx
│   │   │   ├── 📄 Skeleton.tsx
│   │   │   ├── 📄 Toast.tsx
│   │   │   └── 📄 DatePicker.tsx
│   │   ├── 📁 layout/
│   │   │   ├── 📄 AppLayout.tsx   # Sidebar + Header + Content
│   │   │   ├── 📄 Sidebar.tsx
│   │   │   ├── 📄 Header.tsx
│   │   │   └── 📄 AuthLayout.tsx
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 MetricCard.tsx          # Card de métrica com ícone e urgência
│   │   │   ├── 📄 LicencasVencendoWidget.tsx
│   │   │   ├── 📄 CondicionantesAtrasadasWidget.tsx
│   │   │   ├── 📄 MTRsPendentesWidget.tsx
│   │   │   └── 📄 UrgenciaBadge.tsx       # CRÍTICO / URGENTE / ATENÇÃO / OK
│   │   ├── 📁 licencas/
│   │   │   ├── 📄 LicencaStatusBadge.tsx
│   │   │   ├── 📄 LicencaCard.tsx
│   │   │   ├── 📄 CondicionanteRow.tsx
│   │   │   ├── 📄 CondicionanteStatusBadge.tsx
│   │   │   └── 📄 DocumentoUpload.tsx
│   │   └── 📁 residuos/
│   │       ├── 📄 MTRStatusBadge.tsx
│   │       ├── 📄 MTRTimeline.tsx          # Linha do tempo do ciclo MTR
│   │       └── 📄 ClasseResiduoBadge.tsx
│   │
│   ├── 📁 hooks/                  # Custom hooks
│   │   ├── 📄 useAuth.ts
│   │   ├── 📄 useLicencas.ts
│   │   ├── 📄 useCondicionantes.ts
│   │   ├── 📄 useMTRs.ts
│   │   ├── 📄 useDashboard.ts
│   │   └── 📄 useToast.ts
│   │
│   ├── 📁 services/               # Camada de API (axios)
│   │   ├── 📄 api.ts              # Instância axios com interceptors
│   │   ├── 📄 auth.service.ts
│   │   ├── 📄 licencas.service.ts
│   │   ├── 📄 condicionantes.service.ts
│   │   ├── 📄 mtrs.service.ts
│   │   ├── 📄 inventario.service.ts
│   │   ├── 📄 parceiros.service.ts
│   │   ├── 📄 clientes.service.ts
│   │   └── 📄 dashboard.service.ts
│   │
│   ├── 📁 stores/                 # Zustand stores (client state)
│   │   ├── 📄 auth.store.ts       # Usuário logado, token, role
│   │   └── 📄 ui.store.ts         # Sidebar open, tema, preferências
│   │
│   ├── 📁 types/                  # Tipos TypeScript do domínio (espelham o backend)
│   │   ├── 📄 licenca.types.ts
│   │   ├── 📄 condicionante.types.ts
│   │   ├── 📄 mtr.types.ts
│   │   └── 📄 usuario.types.ts
│   │
│   └── 📁 utils/
│       ├── 📄 formatters.ts       # Formatação de datas, CNPJ, volumes
│       ├── 📄 validators.ts
│       └── 📄 constants.ts        # Enums espelhados do backend
│
└── 📁 tests/
    ├── 📁 unit/                   # Vitest: componentes e hooks
    └── 📁 e2e/                    # Playwright
```

---

### `packages/shared/` — Código Compartilhado

```
packages/shared/
│
├── 📄 package.json
├── 📄 tsconfig.json
│
└── 📁 src/
    ├── 📄 index.ts
    ├── 📁 types/
    │   ├── 📄 licenca.types.ts    # Tipos exportados para front e back
    │   ├── 📄 mtr.types.ts
    │   └── 📄 usuario.types.ts
    └── 📁 validators/
        ├── 📄 cnpj.validator.ts   # Validação de CNPJ (algoritmo)
        └── 📄 cpf.validator.ts    # Validação de CPF
```

---

### `infra/` — Infraestrutura

```
infra/
│
├── 📁 docker/
│   ├── 📄 api.Dockerfile          # Multistage: build → production
│   └── 📄 web.Dockerfile          # Nginx serve o build do React
│
├── 📁 nginx/
│   ├── 📄 nginx.conf              # Configuração principal
│   └── 📄 default.conf            # Roteamento: / → web, /api → api
│
└── 📁 k8s/
    ├── 📁 base/                   # Configurações base (Kustomize)
    │   ├── 📄 namespace.yaml
    │   ├── 📄 api-deployment.yaml
    │   ├── 📄 api-service.yaml
    │   ├── 📄 api-hpa.yaml        # HorizontalPodAutoscaler
    │   ├── 📄 web-deployment.yaml
    │   ├── 📄 web-service.yaml
    │   ├── 📄 ingress.yaml        # Nginx Ingress Controller
    │   ├── 📄 configmap.yaml      # Variáveis não-sensíveis
    │   └── 📄 secrets.yaml        # Referências para secrets (AWS SM / Vault)
    ├── 📁 overlays/
    │   ├── 📁 staging/
    │   └── 📁 production/
    └── 📄 kustomization.yaml
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

Veja o arquivo [`prisma/schema.prisma`](apps/api/prisma/schema.prisma) para o schema completo.

### Estratégia Multi-Tenant

O isolamento dos dados entre consultorias é garantido por **column-level tenancy**: toda tabela de dados sensíveis contém `consultoriaId` (direta ou via join com `clientes`). O middleware `tenant.middleware.ts` injeta o `consultoriaId` do token JWT em todas as queries via Prisma.

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

| Recurso | ADMIN | ANALISTA | VIEWER |
|---|---|---|---|
| Gerenciar usuários da consultoria | ✅ | ❌ | ❌ |
| Ver todos os clientes | ✅ | ❌ (só designados) | ❌ (só o próprio) |
| CRUD de licenças | ✅ | ✅ | ❌ |
| Emitir MTR | ✅ | ✅ | ❌ |
| Ver dashboard própria empresa | ✅ | ✅ | ✅ |
| Exportar relatórios | ✅ | ✅ | ❌ |
| Configurações da consultoria | ✅ | ❌ | ❌ |

---

## 9. Motor de Alertas

O sistema de alertas é construído sobre **Redis + BullMQ**, operando com dois tipos de rotinas:

### Cron Jobs (node-cron)

| Job | Frequência | O que faz |
|---|---|---|
| `VarreduraAlertasCron` | A cada hora | Varre licenças e condicionantes próximas do prazo e enfileira alertas |
| `StatusUpdaterCron` | Todo dia às 00:05 | Atualiza status de licenças vencidas e condicionantes atrasadas automaticamente |

### Regras de Alerta

**Licenças:**
- 90 dias antes de `dataLimiteRenovacao` → alerta "Iniciar processo de renovação"
- 60 dias → alerta de urgência
- 30 dias → alerta crítico

**Condicionantes:**
- 30 dias antes do prazo → lembrete
- 7 dias antes → urgência
- No dia → crítico
- Após o prazo → status muda para ATRASADA automaticamente

**MTRs:**
- 30 dias sem CDF após emissão → lembrete
- 60 dias → urgência

**Parceiros:**
- 60 dias antes do vencimento da licença → alerta preventivo

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
Serviços:
  api       → localhost:3333
  web       → localhost:5173 (Vite dev server)
  postgres  → localhost:5432
  redis     → localhost:6379
  mailhog   → localhost:8025 (captura e-mails em dev)
```

### Kubernetes

**Componentes:**

| Recurso | Configuração |
|---|---|
| `api-deployment` | 2 réplicas mínimas, rolling update |
| `api-hpa` | CPU > 70% → escala até 10 réplicas |
| `web-deployment` | 2 réplicas (Nginx servindo build React) |
| `ingress` | TLS via cert-manager, roteamento `/api` → api, `/` → web |
| `configmap` | `NODE_ENV`, `LOG_LEVEL`, `REDIS_HOST` |
| `secrets` | Referências ao AWS Secrets Manager (não commitados) |

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
cp apps/web/.env.example apps/web/.env

# 4. Subir serviços de infraestrutura
docker compose up -d postgres redis mailhog

# 5. Rodar migrations e seed do banco
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed

# 6. Aplicar customizações SQL pós-Prisma
psql $DATABASE_URL -f prisma/migrations/post_prisma_customizations.sql

# 7. Iniciar backend e frontend em modo dev
cd ../..
pnpm dev          # Inicia api (porta 3333) e web (porta 5173) em paralelo
```

### Comandos Úteis

```bash
# Backend
pnpm --filter api dev               # Dev com hot-reload (tsx watch)
pnpm --filter api build             # Compilar TypeScript
pnpm --filter api test              # Vitest — unit tests
pnpm --filter api test:integration  # Testes com banco real

# Frontend
pnpm --filter web dev               # Vite dev server
pnpm --filter web build             # Build de produção
pnpm --filter web test              # Vitest — component tests

# Banco de dados
pnpm --filter api prisma:migrate    # Criar e aplicar nova migration
pnpm --filter api prisma:studio     # Abrir Prisma Studio (GUI do BD)
pnpm --filter api prisma:seed       # Rodar seed

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
│  Testam: Repositórios Prisma com PostgreSQL real
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

# Com cobertura
pnpm test:coverage

# E2E (requer docker compose rodando)
pnpm test:e2e

# Watch mode (desenvolvimento)
pnpm --filter api test --watch
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
DATABASE_URL="postgresql://postgres:greenly@localhost:5432/greenly"

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
APP_URL=http://localhost:5173
API_URL=http://localhost:3333
```

### `apps/web/.env`

```bash
VITE_API_URL=http://localhost:3333/api
```

---

## 14. Convenções do Projeto

### Nomenclatura

| Artefato | Convenção | Exemplo |
|---|---|---|
| Arquivos de domínio | `PascalCase.ts` | `Licenca.ts`, `Email.vo.ts` |
| Use Cases | `VerbSubstantivoUseCase.ts` | `CriarLicencaUseCase.ts` |
| Interfaces (Ports) | `IPascalCase.ts` | `ILicencaRepository.ts` |
| Controllers | `kebab-case.controller.ts` | `licencas.controller.ts` |
| DTOs | `acao-recurso.dto.ts` | `criar-licenca.dto.ts` |
| Erros de domínio | `NomeCamelCase.error.ts` | `LicencaVencida.error.ts` |
| Componentes React | `PascalCase.tsx` | `LicencaStatusBadge.tsx` |
| Hooks | `useCamelCase.ts` | `useLicencas.ts` |

### Commits

Seguimos o padrão **Conventional Commits**:

```
feat(licencas): adicionar use case de renovação de licença
fix(alertas): corrigir cálculo de próximo prazo para condicionantes mensais
docs(readme): atualizar estrutura de pastas do módulo de resíduos
refactor(auth): extrair validação de token para helper
test(domain): adicionar testes para value object PrazoRenovacao
chore(deps): atualizar prisma para 5.14.0
```

### Regra da Dependência (CRÍTICA)

```typescript
// ✅ CORRETO — Use Case usa apenas a interface (Port)
import { ILicencaRepository } from '../application/ILicencaRepository'

// ❌ ERRADO — Use Case importando diretamente o Prisma (quebra Clean Architecture)
import { PrismaClient } from '@prisma/client'
import { PrismaLicencaRepository } from '../infrastructure/PrismaLicencaRepository'
```

As camadas `domain/` e `application/` não podem importar nada de `infrastructure/` ou de libs externas de infraestrutura.

---

## 15. Roadmap

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
  - E-mail: `admin@greenly.com`
  - Senha: `123456` (conforme definido no seed padrão)

---

<div align="center">

**Greenly** — Construído com propósito. Para um compliance ambiental sem surpresas.

*Desenvolvido por Gu & Kara* 🌿

</div>
