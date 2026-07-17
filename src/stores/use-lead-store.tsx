import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Lead, SearchSession } from '@/lib/types'
import { generateMockLeads } from '@/lib/mock-data'
import { generateId } from '@/lib/utils'

interface LeadStoreContextValue {
  leads: Lead[]
  searchHistory: SearchSession[]
  currentSessionId: string | null
  isLoading: boolean
  nextPageToken: string | null
  error: string | null
  startSearch: (keyword: string, location: string) => Promise<void>
  loadMore: () => Promise<void>
  clearError: () => void
}

const LeadStoreContext = createContext<LeadStoreContextValue | null>(null)

const STORAGE_KEY = 'busca_ativa_leads'
const HISTORY_KEY = 'busca_ativa_history'

export function LeadStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSearch, setLastSearch] = useState<{ keyword: string; location: string } | null>(null)

  useEffect(() => {
    try {
      const storedLeads = localStorage.getItem(STORAGE_KEY)
      const storedHistory = localStorage.getItem(HISTORY_KEY)
      if (storedLeads) setLeads(JSON.parse(storedLeads))
      if (storedHistory) setSearchHistory(JSON.parse(storedHistory))
    } catch {
      // ignore parse errors
    }
  }, [])

  const persistLeads = useCallback((newLeads: Lead[]) => {
    setLeads(newLeads)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLeads))
    } catch {
      // ignore storage errors
    }
  }, [])

  const persistHistory = useCallback((history: SearchSession[]) => {
    setSearchHistory(history)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      // ignore storage errors
    }
  }, [])

  const startSearch = useCallback(async (keyword: string, location: string) => {
    if (!keyword.trim()) {
      setError('Por favor, informe um termo de busca.')
      return
    }

    setIsLoading(true)
    setError(null)
    setNextPageToken(null)

    try {
      await new Promise((r) => setTimeout(r, 1200))

      const sessionId = generateId()
      const mockLeads = generateMockLeads(keyword, location, sessionId, 15)
      const hasMore = Math.random() > 0.4

      setLeads((prev) => {
        const updated = [...mockLeads, ...prev]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {
          /* ignore */
        }
        return updated
      })

      setCurrentSessionId(sessionId)
      setNextPageToken(hasMore ? generateId() : null)
      setLastSearch({ keyword, location })

      const session: SearchSession = {
        id: sessionId,
        keyword,
        location,
        lead_count: mockLeads.length,
        created_at: new Date().toISOString(),
      }
      setSearchHistory((prev) => {
        const updated = [session, ...prev]
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
        } catch {
          /* ignore */
        }
        return updated
      })
    } catch {
      setError('Erro ao buscar leads. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextPageToken || !currentSessionId || !lastSearch) return

    setIsLoading(true)
    setError(null)

    try {
      await new Promise((r) => setTimeout(r, 1000))

      const moreLeads = generateMockLeads(
        lastSearch.keyword,
        lastSearch.location,
        currentSessionId,
        10,
      )
      const hasMore = Math.random() > 0.5

      setLeads((prev) => {
        const updated = [...moreLeads, ...prev]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {
          /* ignore */
        }
        return updated
      })

      setNextPageToken(hasMore ? generateId() : null)

      setSearchHistory((prev) => {
        const updated = prev.map((s) =>
          s.id === currentSessionId ? { ...s, lead_count: s.lead_count + moreLeads.length } : s,
        )
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
        } catch {
          /* ignore */
        }
        return updated
      })
    } catch {
      setError('Erro ao carregar mais resultados.')
    } finally {
      setIsLoading(false)
    }
  }, [nextPageToken, currentSessionId, lastSearch])

  const clearError = useCallback(() => setError(null), [])

  return (
    <LeadStoreContext.Provider
      value={{
        leads,
        searchHistory,
        currentSessionId,
        isLoading,
        nextPageToken,
        error,
        startSearch,
        loadMore,
        clearError,
      }}
    >
      {children}
    </LeadStoreContext.Provider>
  )
}

export default function useLeadStore() {
  const ctx = useContext(LeadStoreContext)
  if (!ctx) throw new Error('useLeadStore must be used within LeadStoreProvider')
  return ctx
}
