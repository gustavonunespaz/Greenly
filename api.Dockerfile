FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências de sistema para o Prisma e pnpm
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar arquivos de workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY apps/tsconfig.base.json ./apps/

# Instalar todas as dependências (vamos permitir falha no lockfile se ele não existir ainda)
RUN pnpm install --no-frozen-lockfile

# Copiar o código fonte
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Gerar o Prisma Client
RUN cd apps/api && pnpm exec prisma generate

# Build dos pacotes
RUN cd packages/shared && pnpm run build
RUN cd apps/api && pnpm run build


FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar build e de dependências da etapa anterior (mais rápido e seguro para workspaces locais pnpm sem complexidade extra)
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api

# A porta padrão
EXPOSE 3333

CMD ["pnpm", "run", "start"]
