export interface Lead {
  id: string
  search_session_id: string
  name: string
  formatted_address: string
  city: string
  state: string
  phone_number: string
  website: string
  instagram: string
  facebook: string
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
  results: Lead[]
  session: SearchSession
  next_page_token: string | null
}
