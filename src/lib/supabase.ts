import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { appEnv } from '@/lib/env'

const supabaseUrl = appEnv.supabaseUrl
const supabasePublishableKey = appEnv.supabasePublishableKey

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
