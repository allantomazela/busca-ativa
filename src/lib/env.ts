/**
 * Leitura de variáveis de ambiente que funciona em dois cenários:
 *
 * - Desenvolvimento (`pnpm dev`): usa `import.meta.env` a partir dos arquivos
 *   `.env*` processados pelo Vite.
 * - Produção em container Docker: usa `window.__ENV__`, injetado em runtime
 *   pelo `docker-entrypoint.sh`. Isso permite construir a imagem uma única vez
 *   e reutilizá-la em dev, homologação e produção apenas trocando as variáveis
 *   do container.
 *
 * A publishable key do Supabase é pública por natureza, então pode ser exposta
 * no frontend com segurança (o acesso aos dados é protegido por RLS).
 */

const DEFAULT_APP_NAME = 'Busca Ativa Replay Sports'

function readRuntimeValue(key: keyof RuntimeEnv): string {
  const runtimeValue = typeof window !== 'undefined' ? window.__ENV__?.[key] : undefined
  if (runtimeValue && !runtimeValue.startsWith('__')) return runtimeValue

  const buildValue = import.meta.env[key]
  return typeof buildValue === 'string' ? buildValue : ''
}

export const appEnv = {
  appName: readRuntimeValue('VITE_APP_NAME') || DEFAULT_APP_NAME,
  supabaseUrl: readRuntimeValue('VITE_SUPABASE_URL'),
  supabasePublishableKey: readRuntimeValue('VITE_SUPABASE_PUBLISHABLE_KEY'),
}

export interface RuntimeEnv {
  VITE_APP_NAME?: string
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
}
