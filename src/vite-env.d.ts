/// <reference types="vite/client" />

import type { RuntimeEnv } from '@/lib/env'

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    __ENV__?: RuntimeEnv
  }
}
