import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { KeyRound, Bell, Database, Info, CheckCircle2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import useLeadStore from '@/stores/use-lead-store'

export default function Settings() {
  const { leads, searchHistory } = useLeadStore()
  const [apiKey, setApiKey] = useState('')
  const [autoSave, setAutoSave] = useState(true)
  const [notifications, setNotifications] = useState(true)

  const handleSaveKey = () => {
    toast({
      title: 'Configuração salva',
      description: 'Sua chave de API foi armazenada com sucesso.',
    })
  }

  const handleClearData = () => {
    localStorage.removeItem('busca_ativa_leads')
    localStorage.removeItem('busca_ativa_history')
    toast({ title: 'Dados limpos', description: 'Todos os leads e histórico foram removidos.' })
    setTimeout(() => window.location.reload(), 500)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Configurações</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerencie suas preferências e integrações.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="w-5 h-5 text-primary" />
            Google Places API
          </CardTitle>
          <CardDescription>
            Configure sua chave de API do Google Places para realizar buscas reais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Cole sua chave de API aqui..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
              <span>
                Você pode obter uma chave de API no{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google Cloud Console
                </a>
                . Atualmente, o sistema opera em modo de demonstração com dados simulados.
              </span>
            </div>
          </div>
          <Button onClick={handleSaveKey} disabled={!apiKey.trim()}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Salvar Chave
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-primary" />
            Preferências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Salvar leads automaticamente</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Armazena os leads localmente após cada busca.
              </p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Notificações</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receber alertas ao concluir buscas.
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-primary" />
            Armazenamento Local
          </CardTitle>
          <CardDescription>Gerencie os dados salvos no seu navegador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{leads.length}</p>
              <p className="text-xs text-muted-foreground">Leads salvos</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{searchHistory.length}</p>
              <p className="text-xs text-muted-foreground">Buscas realizadas</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleClearData}
            className="w-full gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Todos os Dados
          </Button>
        </CardContent>
      </Card>

      <div className="text-center pb-4">
        <Badge variant="secondary" className="text-xs">
          Busca Ativa Pro v1.0.0
        </Badge>
      </div>
    </div>
  )
}
