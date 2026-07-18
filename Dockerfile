# syntax=docker/dockerfile:1

# ----------------------------------------------------------------------------
# Estágio 1 — Build da aplicação Vite/React com pnpm
# ----------------------------------------------------------------------------
FROM node:22-alpine AS build

# Habilita o pnpm via corepack (versão fixada no package.json).
RUN corepack enable

WORKDIR /app

# Instala dependências primeiro para aproveitar o cache de camadas.
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copia o restante do código e gera o build de produção.
COPY . .
RUN pnpm build

# ----------------------------------------------------------------------------
# Estágio 2 — Runtime com Nginx servindo os arquivos estáticos
# ----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Configuração do Nginx com fallback de SPA e cabeçalhos de cache.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos estáticos gerados no estágio de build.
COPY --from=build /app/dist /usr/share/nginx/html

# Entrypoint injeta as variáveis de ambiente em runtime (env.js).
COPY docker/docker-entrypoint.sh /docker-entrypoint.d/40-runtime-env.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-env.sh

EXPOSE 80

# A imagem base do Nginx já executa os scripts de /docker-entrypoint.d
# antes de iniciar o servidor, então mantemos o CMD padrão.
