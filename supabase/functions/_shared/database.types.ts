export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      search_sessions: {
        Row: SearchSessionRow
        Insert: SearchSessionInsert
        Update: Partial<SearchSessionInsert>
        Relationships: []
      }
      leads: {
        Row: LeadRow
        Insert: LeadInsert
        Update: Partial<LeadInsert>
        Relationships: [
          {
            foreignKeyName: 'leads_session_owner_fk'
            columns: ['search_session_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'search_sessions'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type SearchSessionRow = {
  id: string
  user_id: string
  keyword: string
  location: string
  lead_count: number
  next_page_token: string | null
  created_at: string
}

type SearchSessionInsert = {
  id?: string
  user_id?: string
  keyword: string
  location?: string
  lead_count?: number
  next_page_token?: string | null
  created_at?: string
}

type LeadRow = {
  id: string
  user_id: string
  search_session_id: string
  google_place_id: string
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
  latitude: number | null
  longitude: number | null
  is_open: boolean
  opening_hours: string[]
  created_at: string
}

type LeadInsert = Omit<LeadRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}
