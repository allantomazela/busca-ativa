import { useState } from 'react'
import { Database, ExternalLink, Info, Loader2, ShieldCheck, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import useLeadStore from '@/stores/use-lead-store'

export function AdminSystemSettings() {
  const { leads, searchHistory, clearAllData } = useLeadStore()
  const [isClearing, setIsClearing] = useState(false)

  async function handleClearData() {
    setIsClearing(true)
    const result = await clearAllData()
    setIsClearing(false)

    toast(
      result.success
        ? { title: 'Dados removidos', description: 'Seus leads e pesquisas foram excluídos.' }
        : { title: 'Erro ao remover dados', description: result.error, variant: 'destructive' },
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Google Places API
          </CardTitle>
          <CardDescription>
            Configuração administrativa da busca de estabelecimentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-brand-orange/20 bg-brand-yellow/10 p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
            <p>
              A integração usa uma Edge Function autenticada. Configure o segredo
              <code className="mx-1 rounded bg-muted px-1">GOOGLE_PLACES_API_KEY</code>
              no Supabase para liberar as buscas reais.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Google Cloud Console
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Banco de dados
          </CardTitle>
          <CardDescription>
            Informações administrativas dos dados armazenados no Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Metric value={leads.length} label="Leads salvos" />
            <Metric value={searchHistory.length} label="Buscas realizadas" />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isClearing}
                className="w-full gap-2 border-destructive/30 text-destructive hover:border-destructive/50 hover:text-destructive"
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Excluir meus dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir todos os seus dados?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação removerá permanentemente seus leads e histórico de pesquisas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Excluir permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </>
  )
}

function Metric({ value, label }: MetricProps) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

interface MetricProps {
  value: number
  label: string
}
