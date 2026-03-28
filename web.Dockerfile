# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências de sistema para o pnpm
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar arquivos de workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY apps/tsconfig.base.json ./apps/

# Instalar todas as dependências
RUN pnpm install --no-frozen-lockfile

# Copiar o código fonte
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build dos pacotes
RUN cd packages/shared && pnpm run build
RUN cd apps/web && pnpm run build

# Runner stage
FROM nginx:alpine AS runner

# Copiar configuração customizada do Nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build da etapa anterior
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# A porta padrão do Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
