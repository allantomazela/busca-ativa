#!/bin/sh
set -eu

# Gera o arquivo env.js com as variáveis de ambiente disponíveis no container.
# Isso permite construir a imagem uma única vez e configurar a URL/chave do
# Supabase em runtime, por ambiente (dev, homolog, prod).

ENV_FILE="/usr/share/nginx/html/env.js"

APP_NAME="${VITE_APP_NAME:-Busca Ativa Replay Sports}"
SUPABASE_URL="${VITE_SUPABASE_URL:-}"
SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_PUBLISHABLE_KEY" ]; then
  echo "[runtime-env] AVISO: VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não definidas." >&2
fi

# Escapa aspas duplas para não quebrar o JavaScript gerado.
escape() {
  printf '%s' "$1" | sed 's/"/\\"/g'
}

cat > "$ENV_FILE" <<EOF
window.__ENV__ = {
  "VITE_APP_NAME": "$(escape "$APP_NAME")",
  "VITE_SUPABASE_URL": "$(escape "$SUPABASE_URL")",
  "VITE_SUPABASE_PUBLISHABLE_KEY": "$(escape "$SUPABASE_PUBLISHABLE_KEY")"
}
EOF

echo "[runtime-env] env.js gerado com sucesso."
