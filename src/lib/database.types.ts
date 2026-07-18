export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_path: string | null
          status: ProfileStatus
          is_admin: boolean
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_path?: string | null
          status?: ProfileStatus
          is_admin?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_path?: string | null
          status?: ProfileStatus
          is_admin?: boolean
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_sessions: {
        Row: {
          id: string
          user_id: string
          keyword: string
          location: string
          lead_count: number
          next_page_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          keyword: string
          location?: string
          lead_count?: number
          next_page_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          keyword?: string
          location?: string
          lead_count?: number
          next_page_token?: string | null
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
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
        Insert: {
          id?: string
          user_id?: string
          search_session_id: string
          google_place_id: string
          name: string
          formatted_address?: string
          city?: string
          state?: string
          phone_number?: string
          website?: string
          instagram?: string
          facebook?: string
          rating?: number
          user_ratings_total?: number
          latitude?: number | null
          longitude?: number | null
          is_open?: boolean
          opening_hours?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_session_id?: string
          google_place_id?: string
          name?: string
          formatted_address?: string
          city?: string
          state?: string
          phone_number?: string
          website?: string
          instagram?: string
          facebook?: string
          rating?: number
          user_ratings_total?: number
          latitude?: number | null
          longitude?: number | null
          is_open?: boolean
          opening_hours?: string[]
          created_at?: string
        }
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
    Enums: {
      profile_status: ProfileStatus
    }
    CompositeTypes: Record<string, never>
  }
}

export type ProfileStatus = 'pending' | 'approved' | 'rejected'
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type SearchSessionRow = Database['public']['Tables']['search_sessions']['Row']
export type LeadRow = Database['public']['Tables']['leads']['Row']
