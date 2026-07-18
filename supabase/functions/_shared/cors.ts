const developmentOrigins = [
  'http://localhost:5878',
  'http://127.0.0.1:5878',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

export function isAllowedOrigin(origin: string | null) {
  if (!origin) return true
  return getAllowedOrigins().has(origin)
}

export function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && isAllowedOrigin(origin) ? origin : '',
    'Access-Control-Allow-Headers':
      'authorization, apikey, content-type, x-client-info, x-supabase-api-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function getAllowedOrigins() {
  const configuredOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return new Set([...developmentOrigins, ...configuredOrigins])
}
