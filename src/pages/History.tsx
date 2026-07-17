import { useState, useMemo } from 'react'
import useLeadStore from '@/stores/use-lead-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/utils'
import { Download, Search, Clock, MapPin, Users, Trash2, FileDown } from 'lucide-react'

export default function History() {
  const { leads, searchHistory } = useLeadStore()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  const sessionLeads = useMemo(() => {
    if (!selectedSession) return []
    return leads.filter((l) => l.search_session_id === selectedSession)
  }, [leads, selectedSession])

  const handleExportSession = (sessionId: string) => {
    const sessionLeadsList = leads.filter((l) => l.search_session_id === sessionId)
    if (sessionLeadsList.length > 0) {
      exportToCSV(sessionLeadsList, `leads_${sessionId}`)
    }
  }

  const handleExportAll = () => {
    if (leads.length > 0) {
      exportToCSV(leads, `todos_leads_${Date.now()}`)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Meus Leads</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Histórico de buscas e leads capturados.
          </p>
        </div>
        {leads.length > 0 && (
          <Button
            onClick={handleExportAll}
            variant="outline"
            className="gap-2 border-emerald-500/30 text-emerald-700 hover:text-emerald-800"
          >
            <FileDown className="w-4 h-4" />
            Exportar Todos ({leads.length})
          </Button>
        )}
      </div>

      {searchHistory.length === 0 ? (
        <Card className="py-20">
          <CardContent className="flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Nenhuma busca realizada</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Inicie uma nova busca para ver o histórico aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {searchHistory.map((session) => {
            const sessionCount = leads.filter((l) => l.search_session_id === session.id).length
            const isSelected = selectedSession === session.id
            return (
              <Card
                key={session.id}
                className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => setSelectedSession(isSelected ? null : session.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Search className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold text-sm sm:text-base truncate">
                          {session.keyword}
                        </span>
                        {session.location && (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <MapPin className="w-3 h-3" />
                            {session.location}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {sessionCount} leads
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    {sessionCount > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-emerald-700 hover:text-emerald-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportSession(session.id)
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        CSV
                      </Button>
                    )}
                  </div>

                  {isSelected && sessionLeads.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-2 animate-fade-in-up">
                      {sessionLeads.slice(0, 5).map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded hover:bg-muted/50"
                        >
                          <span className="font-medium truncate">{lead.name}</span>
                          <span className="text-muted-foreground text-xs shrink-0">
                            {lead.phone_number || 'Sem telefone'}
                          </span>
                        </div>
                      ))}
                      {sessionLeads.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{sessionLeads.length - 5} outros leads...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
