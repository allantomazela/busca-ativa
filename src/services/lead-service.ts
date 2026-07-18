import { supabase } from '@/lib/supabase'
import type { LeadRow, SearchSessionRow } from '@/lib/database.types'
import type { Lead, SearchResult, SearchSession } from '@/lib/types'

export async function fetchLeadData(): Promise<ServiceResult<LeadData>> {
  const [leadsResponse, historyResponse] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('search_sessions').select('*').order('created_at', { ascending: false }),
  ])

  if (leadsResponse.error || historyResponse.error) {
    return {
      success: false,
      error: 'Não foi possível carregar seus dados. Atualize a página e tente novamente.',
    }
  }

  return {
    success: true,
    data: {
      leads: leadsResponse.data.map(mapLeadRow),
      searchHistory: historyResponse.data.map(mapSearchSessionRow),
    },
  }
}

export async function searchGooglePlaces(input: SearchInput): Promise<ServiceResult<SearchResult>> {
  const { data, error } = await supabase.functions.invoke<SearchResult>('google-places-search', {
    body: {
      keyword: input.keyword,
      location: input.location,
      session_id: input.sessionId,
      page_token: input.pageToken,
    },
  })

  if (error || !data) {
    return {
      success: false,
      error:
        'A busca real ainda não está disponível. Verifique a configuração da Google Places API.',
    }
  }

  return { success: true, data }
}

export async function deleteAllLeadData(): Promise<ServiceResult<null>> {
  const { error } = await supabase.from('search_sessions').delete().not('id', 'is', null)

  if (error) {
    return { success: false, error: 'Não foi possível remover os dados. Tente novamente.' }
  }

  return { success: true, data: null }
}

export async function deleteSearchSession(sessionId: string): Promise<ServiceResult<null>> {
  const { error } = await supabase.from('search_sessions').delete().eq('id', sessionId)

  if (error) {
    return { success: false, error: 'Não foi possível excluir esta busca. Tente novamente.' }
  }

  return { success: true, data: null }
}

function mapLeadRow(row: LeadRow): Lead {
  return {
    id: row.id,
    search_session_id: row.search_session_id,
    place_id: row.google_place_id,
    name: row.name,
    formatted_address: row.formatted_address,
    city: row.city,
    state: row.state,
    phone_number: row.phone_number,
    website: row.website,
    instagram: row.instagram,
    facebook: row.facebook,
    rating: Number(row.rating),
    user_ratings_total: row.user_ratings_total,
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
    is_open: row.is_open,
    opening_hours: row.opening_hours,
    created_at: row.created_at,
  }
}

function mapSearchSessionRow(row: SearchSessionRow): SearchSession {
  return {
    id: row.id,
    keyword: row.keyword,
    location: row.location,
    lead_count: row.lead_count,
    created_at: row.created_at,
  }
}

export interface SearchInput {
  keyword: string
  location: string
  sessionId?: string | null
  pageToken?: string | null
}

interface LeadData {
  leads: Lead[]
  searchHistory: SearchSession[]
}

export type ServiceResult<T> = { success: true; data: T } | { success: false; error: string }
