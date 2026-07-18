import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lead, SearchSession } from '@/lib/types'
import { parseSearchForm } from '@/lib/schemas'
import {
  deleteAllLeadData,
  deleteSearchSession,
  fetchLeadData,
  searchGooglePlaces,
  type ServiceResult,
} from '@/services/lead-service'

interface LeadStoreContextValue {
  leads: Lead[]
  searchHistory: SearchSession[]
  currentSessionId: string | null
  isLoading: boolean
  nextPageToken: string | null
  error: string | null
  startSearch: (keyword: string, location: string) => Promise<void>
  loadMore: () => Promise<void>
  clearAllData: () => Promise<ServiceResult<null>>
  deleteSession: (sessionId: string) => Promise<ServiceResult<null>>
  resetCurrentSearch: () => void
  clearError: () => void
}

const LeadStoreContext = createContext<LeadStoreContextValue | null>(null)

export function LeadStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSearch, setLastSearch] = useState<{ keyword: string; location: string } | null>(null)

  useEffect(() => {
    let active = true

    void fetchLeadData().then((result) => {
      if (!active) return
      if (result.success) {
        setLeads(result.data.leads)
        setSearchHistory(result.data.searchHistory)
      } else {
        setError(result.error)
      }
      setIsLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const startSearch = useCallback(async (keyword: string, location: string) => {
    const parsed = parseSearchForm(keyword, location)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }

    const { keyword: normalizedKeyword, location: normalizedLocation } = parsed.data

    setIsLoading(true)
    setError(null)
    setNextPageToken(null)

    const result = await searchGooglePlaces({
      keyword: normalizedKeyword,
      location: normalizedLocation,
    })

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setLeads((current) => mergeLeads(result.data.results, current))
    setCurrentSessionId(result.data.session.id)
    setNextPageToken(result.data.next_page_token)
    setLastSearch({ keyword: normalizedKeyword, location: normalizedLocation })
    setSearchHistory((current) => [
      result.data.session,
      ...current.filter((session) => session.id !== result.data.session.id),
    ])
    setIsLoading(false)
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextPageToken || !currentSessionId || !lastSearch) return

    setIsLoading(true)
    setError(null)

    const result = await searchGooglePlaces({
      keyword: lastSearch.keyword,
      location: lastSearch.location,
      sessionId: currentSessionId,
      pageToken: nextPageToken,
    })

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setLeads((current) => mergeLeads(result.data.results, current))
    setNextPageToken(result.data.next_page_token)
    setSearchHistory((current) =>
      current.map((session) => (session.id === currentSessionId ? result.data.session : session)),
    )
    setIsLoading(false)
  }, [nextPageToken, currentSessionId, lastSearch])

  const clearAllData = useCallback(async () => {
    const result = await deleteAllLeadData()
    if (result.success) {
      setLeads([])
      setSearchHistory([])
      setCurrentSessionId(null)
      setNextPageToken(null)
      setLastSearch(null)
    }
    return result
  }, [])

  const deleteSession = useCallback(
    async (sessionId: string) => {
      const result = await deleteSearchSession(sessionId)
      if (!result.success) return result

      setLeads((current) => current.filter((lead) => lead.search_session_id !== sessionId))
      setSearchHistory((current) => current.filter((session) => session.id !== sessionId))

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setNextPageToken(null)
        setLastSearch(null)
      }

      return result
    },
    [currentSessionId],
  )

  const clearError = useCallback(() => setError(null), [])
  const resetCurrentSearch = useCallback(() => {
    setCurrentSessionId(null)
    setNextPageToken(null)
    setLastSearch(null)
    setError(null)
  }, [])

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
        clearAllData,
        deleteSession,
        resetCurrentSearch,
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

function mergeLeads(incoming: Lead[], current: Lead[]) {
  const incomingIds = new Set(incoming.map((lead) => lead.id))
  return [...incoming, ...current.filter((lead) => !incomingIds.has(lead.id))]
}
