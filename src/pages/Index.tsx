import { useState, useMemo } from 'react'
import useLeadStore from '@/stores/use-lead-store'
import { SearchForm } from '@/components/SearchForm'
import { LeadTable, LeadCardsMobile } from '@/components/LeadTable'
import { LeadDetailsSheet } from '@/components/LeadDetailsSheet'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import {
  Download,
  Loader2,
  Target,
  BarChart3,
  Building2,
  Globe,
  Search,
  Sparkles,
  Plus,
} from 'lucide-react'
import { exportToCSV } from '@/lib/utils'
import { Lead } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

export default function Index() {
  const {
    startSearch,
    leads,
    currentSessionId,
    isLoading,
    nextPageToken,
    loadMore,
    resetCurrentSearch,
    error,
    clearError,
  } = useLeadStore()

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [searchFormKey, setSearchFormKey] = useState(0)

  const sessionLeads = useMemo(() => {
    if (!currentSessionId) return []
    return leads.filter((l) => l.search_session_id === currentSessionId)
  }, [leads, currentSessionId])

  const handleExport = () => {
    if (sessionLeads.length > 0) {
      exportToCSV(sessionLeads, `leads_export_${new Date().getTime()}`)
    }
  }

  const handleNewSearch = () => {
    resetCurrentSearch()
    setSelectedLead(null)
    setSearchFormKey((current) => current + 1)
    requestAnimationFrame(() => {
      document.getElementById('search-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const hasLeads = sessionLeads.length > 0

  const stats = useMemo(() => {
    const withPhone = sessionLeads.filter((l) => l.phone_number).length
    const withWeb = sessionLeads.filter((l) => l.website).length
    return { total: sessionLeads.length, withPhone, withWeb }
  }, [sessionLeads])

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.08] via-card to-brand-yellow/10 p-5 shadow-sm sm:p-7">
        <div className="brand-gradient absolute inset-y-0 left-0 w-1.5" />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-pink/15 bg-brand-pink/5 px-3 py-1 text-xs font-semibold text-brand-pink">
              <Sparkles className="h-3.5 w-3.5" />
              Inteligência para prospecção
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Extração de <span className="brand-gradient-text">Leads</span>
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Encontre novos clientes no Google Maps e exporte os dados rapidamente.
            </p>
          </div>
          <BrandLogo compact className="hidden shrink-0 sm:flex" />
        </div>
      </div>

      <div id="search-form" className="scroll-mt-20">
        <SearchForm
          key={searchFormKey}
          onSearch={startSearch}
          isLoading={isLoading && sessionLeads.length === 0}
          error={error}
          onClearError={clearError}
        />
      </div>

      {hasLeads && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Encontrado</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full bg-brand-pink/10 p-3">
                <BarChart3 className="h-5 w-5 text-brand-pink" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Telefone</p>
                <h3 className="text-2xl font-bold text-foreground">{stats.withPhone}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full bg-brand-orange/10 p-3">
                <Globe className="h-5 w-5 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Website</p>
                <h3 className="text-2xl font-bold">{stats.withWeb}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {hasLeads && (
        <div className="mt-4 mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Resultados da Busca
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              onClick={handleNewSearch}
              disabled={isLoading}
              className="gap-2 shadow-sm shadow-primary/15"
            >
              <Plus className="h-4 w-4" />
              Nova pesquisa
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2 border-brand-orange/30 bg-white text-brand-orange shadow-sm hover:bg-brand-orange/5 hover:text-brand-orange"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar para Planilha</span>
              <span className="sm:hidden">Exportar</span>
            </Button>
          </div>
        </div>
      )}

      <LeadTable leads={sessionLeads} onViewDetails={setSelectedLead} />
      <LeadCardsMobile leads={sessionLeads} onViewDetails={setSelectedLead} />

      {!hasLeads && !isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Pronto para prospectar</h3>
          <p className="text-muted-foreground max-w-sm">
            Inicie uma busca informando o nicho e a localidade desejada para encontrar novos leads.
          </p>
        </div>
      )}

      {nextPageToken && hasLeads && (
        <div className="flex justify-center mt-6 py-4 animate-fade-in-up">
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="secondary"
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...
              </>
            ) : (
              'Carregar Mais Resultados'
            )}
          </Button>
        </div>
      )}

      <LeadDetailsSheet
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  )
}
