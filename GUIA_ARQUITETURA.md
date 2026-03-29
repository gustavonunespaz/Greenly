# Guia de Arquitetura: Greenly (Vertical Slice)

Este documento descreve a nova estrutura organizacional do projeto Greenly, as instruções para execução via Docker e como acessar o ambiente de desenvolvimento.

## 🏗️ Estrutura de Pastas (Vertical Slice)

Abandonamos a arquitetura de camadas horizontais (DDD clássico) para focar em **Vertical Slices** (fatias verticais). Isso significa que o código é organizado pelo "o que ele faz" (Feature) e não pelo "o que o arquivo é".

### 🟢 Back-end (`apps/api/src`)
- **`modules/`**: Cada pasta aqui é uma funcionalidade isolada.
    - `[modulo].controller.ts`: Porta de entrada (Express), lida com a requisição e validação.
    - `[modulo].service.ts`: Onde reside a inteligência e as regras de negócio.
    - `[modulo].repository.ts`: Abstração de acesso ao banco (Drizzle), se houver necessidade de queries complexas.
    - `[modulo].routes.ts`: Definição das rotas específicas do módulo.
- **`shared/`**: Recursos compartilhados (cliente Drizzle, Middlewares de Auth, Erros Globais, Container de DI).

### 🔵 Front-end (`apps/web/src`)
- **`features/`**: Inteligência isolada por funcionalidade.
    - `services/`: Chamadas Axios específicas.
    - `hooks/`: Gerenciamento de estado (TanStack Query) e lógica de UI.
    - `components/`: Listas, cards e widgets específicos dessa feature.
- **`pages/`**: Apenas containers de rota que montam as features.
- **`components/ui/`**: Componentes básicos e "burros" (botões, inputs, modais) do Shadcn UI.

### 🟡 A Ponte (`packages/shared`)
- **Single Source of Truth**: Contém os Schemas Zod e as Interfaces TypeScript que tanto o Front quanto o Back usam. Se mudar um campo aqui, o erro aparece nos dois apps simultaneamente.

---

## 🐳 Executando com Docker

O projeto está configurado para subir todo o ambiente (Banco, Redis, Mailhog, API e Front) com um único comando.

### 🚀 Como subir o sistema:
Na raiz do projeto, execute:
```bash
docker-compose up --build
```

### 🌍 Portas de Acesso:
- **Frontend**: [http://localhost:8081](http://localhost:8081)
- **Backend API**: [http://localhost:3333](http://localhost:3333)
- **Mailhog (E-mails de teste)**: [http://localhost:8025](http://localhost:8025)

---

## 💾 Acesso ao Banco de Dados (PostgreSQL)

O banco roda dentro de um container Docker, mas a porta está exposta para o seu Windows/Host.

- **Host**: `localhost` (ou o IP do seu WSL)
- **Porta**: `5435`
- **Usuário**: `postgres`
- **Senha**: `greenly`
- **Database**: `greenly`

> [!TIP]
> Você pode usar ferramentas como **DBeaver** ou **TablePlus** no Windows para conectar usando essas credenciais.

---

## 🛠️ Comandos Úteis (WSL/Terminal)

- **Instalar tudo**: `pnpm install`
- **Rodar em modo Dev (sem Docker)**: `pnpm dev`
- **Sincronizar schema com banco (local)**: `pnpm --filter @greenly/api db:push`
- **Abrir Drizzle Studio**: `pnpm --filter @greenly/api db:studio`

---
**Status da Migração:** Arquitetura 100% modularizada e pronta para escala.
