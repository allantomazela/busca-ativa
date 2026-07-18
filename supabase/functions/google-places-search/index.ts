import '@supabase/functions-js/edge-runtime.d.ts'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getCorsHeaders, isAllowedOrigin } from '../_shared/cors.ts'
import type { Database, SearchSessionRow } from '../_shared/database.types.ts'
import { searchPlaces } from './google-places.ts'

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    if (!isAllowedOrigin(origin)) {
      return jsonResponse({ error: 'Origem não autorizada.' }, 403, corsHeaders)
    }
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Método não permitido.' }, 405, corsHeaders)
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Autenticação obrigatória.' }, 401, corsHeaders)

    const supabase = createClient<Database>(
      getRequiredEnv('SUPABASE_URL'),
      getSupabasePublicKey(),
      {
        global: { headers: { Authorization: authHeader } },
      },
    )
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return jsonResponse({ error: 'Sessão inválida ou expirada.' }, 401, corsHeaders)
    }

    const inputResult = await parseInput(request)
    if (!inputResult.success) {
      return jsonResponse({ error: inputResult.error }, 400, corsHeaders)
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      return jsonResponse(
        { error: 'A Google Places API ainda não foi configurada.' },
        503,
        corsHeaders,
      )
    }

    const sessionResult = await getOrCreateSession(supabase, user.id, inputResult.data)
    if (!sessionResult.success) {
      return jsonResponse({ error: sessionResult.error }, sessionResult.status, corsHeaders)
    }

    const placesResult = await searchPlaces(apiKey, {
      keyword: inputResult.data.keyword,
      location: inputResult.data.location,
      pageToken: inputResult.data.page_token,
    })

    if (!placesResult.success) {
      if (sessionResult.created) {
        await supabase.from('search_sessions').delete().eq('id', sessionResult.session.id)
      }
      return jsonResponse({ error: placesResult.error }, placesResult.status, corsHeaders)
    }

    const leadRows = placesResult.places.map((place) => ({
      ...place,
      user_id: user.id,
      search_session_id: sessionResult.session.id,
    }))
    const { data: savedLeads, error: leadsError } = leadRows.length
      ? await supabase
          .from('leads')
          .upsert(leadRows, { onConflict: 'search_session_id,google_place_id' })
          .select('*')
      : { data: [], error: null }

    if (leadsError) {
      console.error('Failed to persist leads', {
        code: leadsError.code,
        message: leadsError.message,
      })
      return jsonResponse({ error: 'Não foi possível salvar os resultados.' }, 500, corsHeaders)
    }

    const { count, error: countError } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('search_session_id', sessionResult.session.id)

    if (countError) {
      console.error('Failed to count leads', { code: countError.code })
      return jsonResponse({ error: 'Não foi possível atualizar a pesquisa.' }, 500, corsHeaders)
    }

    const updatedSession = {
      ...sessionResult.session,
      lead_count: count ?? savedLeads?.length ?? 0,
      next_page_token: placesResult.nextPageToken,
    }
    const { error: sessionError } = await supabase
      .from('search_sessions')
      .update({
        lead_count: updatedSession.lead_count,
        next_page_token: updatedSession.next_page_token,
      })
      .eq('id', updatedSession.id)

    if (sessionError) {
      console.error('Failed to update search session', { code: sessionError.code })
      return jsonResponse({ error: 'Não foi possível concluir a pesquisa.' }, 500, corsHeaders)
    }

    return jsonResponse(
      {
        results: (savedLeads ?? []).map(mapLead),
        session: mapSession(updatedSession),
        next_page_token: placesResult.nextPageToken,
      },
      200,
      corsHeaders,
    )
  } catch (error) {
    console.error('Unhandled google-places-search error', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return jsonResponse({ error: 'Erro interno ao processar a busca.' }, 500, corsHeaders)
  }
})

async function getOrCreateSession(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: SearchInput,
): Promise<SessionResult> {
  if (input.session_id) {
    const { data, error } = await supabase
      .from('search_sessions')
      .select('*')
      .eq('id', input.session_id)
      .single()
    return error || !data
      ? { success: false, status: 404, error: 'Pesquisa não encontrada.' }
      : { success: true, session: data, created: false }
  }

  const { data, error } = await supabase
    .from('search_sessions')
    .insert({ user_id: userId, keyword: input.keyword, location: input.location })
    .select('*')
    .single()

  return error || !data
    ? { success: false, status: 500, error: 'Não foi possível iniciar a pesquisa.' }
    : { success: true, session: data, created: true }
}

async function parseInput(request: Request): Promise<InputResult> {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Corpo da requisição inválido.' }
  }

  const keyword = typeof body.keyword === 'string' ? body.keyword.trim() : ''
  const location = typeof body.location === 'string' ? body.location.trim() : ''
  if (keyword.length < 2 || keyword.length > 80 || location.length > 120) {
    return { success: false, error: 'Termo de busca ou localização inválidos.' }
  }

  return {
    success: true,
    data: {
      keyword,
      location,
      session_id: optionalString(body.session_id),
      page_token: optionalString(body.page_token),
    },
  }
}

function mapLead(row: Record<string, unknown>) {
  const { google_place_id, user_id: _userId, ...lead } = row
  return { ...lead, place_id: google_place_id }
}

function mapSession(row: SearchSessionRow) {
  return {
    id: row.id,
    keyword: row.keyword,
    location: row.location,
    lead_count: row.lead_count,
    created_at: row.created_at,
  }
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value ? value : null
}

function getSupabasePublicKey() {
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (anonKey) return anonKey

  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  if (!keys) throw new Error('Missing required environment variable: SUPABASE_ANON_KEY')

  try {
    const parsed = JSON.parse(keys) as { default?: string } | string
    if (typeof parsed === 'string' && parsed) return parsed
    if (typeof parsed === 'object' && parsed?.default) return parsed.default
  } catch {
    if (keys.startsWith('eyJ') || keys.startsWith('sb_')) return keys
  }

  throw new Error('Invalid SUPABASE_PUBLISHABLE_KEYS format')
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface SearchInput {
  keyword: string
  location: string
  session_id: string | null
  page_token: string | null
}

type InputResult = { success: true; data: SearchInput } | { success: false; error: string }

type SessionResult =
  | { success: true; session: SearchSessionRow; created: boolean }
  | { success: false; status: number; error: string }
