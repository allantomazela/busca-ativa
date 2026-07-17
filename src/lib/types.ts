export interface Lead {
  id: string
  search_session_id: string
  name: string
  formatted_address: string
  phone_number: string
  website: string
  rating: number
  user_ratings_total: number
  latitude: number
  longitude: number
  is_open: boolean
  opening_hours: string[]
  place_id: string
  created_at: string
}

export interface SearchSession {
  id: string
  keyword: string
  location: string
  lead_count: number
  created_at: string
}

export interface SearchResult {
  results: Omit<Lead, 'id' | 'search_session_id' | 'created_at'>[]
  next_page_token: string | null
  status: string
  error_message?: string
}
