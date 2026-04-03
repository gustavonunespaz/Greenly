FROM node:20-alpine AS build
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/site/package.json apps/site/
COPY apps/web/public/logo.png apps/site/public/logo.png
COPY apps/web/public/logo-comp.png apps/site/public/logo-comp.png
COPY apps/web/public/favicon.ico apps/site/public/favicon.ico

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --no-frozen-lockfile --filter @greenly/site

# Copy source and build
COPY apps/site/ apps/site/
RUN pnpm --filter @greenly/site build

# Production stage — lightweight Nginx
FROM nginx:alpine
COPY --from=build /app/apps/site/dist /usr/share/nginx/html

# SPA fallback for client-side routing
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
