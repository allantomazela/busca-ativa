import { useState, useMemo } from 'react'
import useLeadStore from '@/stores/use-lead-store'
import { SearchForm } from '@/components/SearchForm'
import { LeadTable, LeadCardsMobile } from '@/components/LeadTable'
import { LeadDetailsSheet } from '@/components/LeadDetailsSheet'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Target, BarChart3, Building2, Globe, Search } from 'lucide-react'
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
    error,
    clearError,
  } = useLeadStore()

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const sessionLeads = useMemo(() => {
    if (!currentSessionId) return []
    return leads.filter((l) => l.search_session_id === currentSessionId)
  }, [leads, currentSessionId])

  const handleExport = () => {
    if (sessionLeads.length > 0) {
      exportToCSV(sessionLeads, `leads_export_${new Date().getTime()}`)
    }
  }

  const hasLeads = sessionLeads.length > 0

  const stats = useMemo(() => {
    const withPhone = sessionLeads.filter((l) => l.phone_number).length
    const withWeb = sessionLeads.filter((l) => l.website).length
    return { total: sessionLeads.length, withPhone, withWeb }
  }, [sessionLeads])

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Extração de Leads</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Encontre novos clientes no Google Maps e exporte os dados rapidamente.
        </p>
      </div>

      <SearchForm
        onSearch={startSearch}
        isLoading={isLoading && sessionLeads.length === 0}
        error={error}
        onClearError={clearError}
      />

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
              <div className="bg-emerald-500/10 p-3 rounded-full">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Telefone</p>
                <h3 className="text-2xl font-bold text-foreground">{stats.withPhone}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Globe className="w-5 h-5 text-blue-600" />
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
        <div className="flex justify-between items-center mt-4 mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Resultados da Busca
          </h2>
          <Button
            onClick={handleExport}
            variant="outline"
            className="bg-white hover:bg-slate-50 border-emerald-500/30 text-emerald-700 hover:text-emerald-800 gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar para Planilha</span>
          </Button>
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
