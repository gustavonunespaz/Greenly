# =============================================================
# Stage 1: Builder
# =============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia manifests para cache de dependências
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instala dependências
RUN pnpm install --frozen-lockfile

# Copia código-fonte
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY tsconfig.base.json ./

# Build
RUN pnpm --filter @greenly/shared build
RUN pnpm --filter @greenly/api build

# Gera Prisma Client
RUN pnpm --filter @greenly/api prisma:generate

# =============================================================
# Stage 2: Production
# =============================================================
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN addgroup -g 1001 -S greenly && adduser -S greenly -u 1001
USER greenly

EXPOSE 3333

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
