import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { ProfileRow, ProfileStatus } from '@/lib/database.types'
import { listProfiles, reviewProfile } from '@/services/profile-service'
import useAuth from '@/stores/use-auth'

export default function AdminUsers() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const loadProfiles = useCallback(async () => {
    setIsLoading(true)
    const result = await listProfiles()
    setIsLoading(false)

    if (!result.success) {
      toast({
        title: 'Erro ao carregar usuários',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    setProfiles(result.data)
  }, [toast])

  useEffect(() => {
    void loadProfiles()
  }, [loadProfiles])

  async function handleReview(
    profileId: string,
    status: Extract<ProfileStatus, 'approved' | 'rejected'>,
  ) {
    if (!user) return
    setPendingId(profileId)
    const result = await reviewProfile(profileId, status, user.id)
    setPendingId(null)

    if (!result.success) {
      toast({
        title: 'Falha na revisão',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    setProfiles((current) =>
      current.map((profile) => (profile.id === profileId ? result.data : profile)),
    )
    toast({
      title: status === 'approved' ? 'Usuário aprovado' : 'Usuário rejeitado',
      description:
        status === 'approved'
          ? 'O acesso ao sistema foi liberado.'
          : 'O usuário permanecerá bloqueado.',
    })
  }

  const pendingCount = profiles.filter((profile) => profile.status === 'pending').length

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Aprovação de usuários
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Libere ou rejeite contas criadas na tela de cadastro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Solicitações
          </CardTitle>
          <CardDescription>
            {pendingCount === 0
              ? 'Não há pedidos pendentes no momento.'
              : `${pendingCount} pedido(s) aguardando revisão.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : profiles.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum usuário cadastrado.
            </p>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">
                      {profile.full_name || 'Usuário sem nome'}
                    </p>
                    <StatusBadge status={profile.status} />
                    {profile.is_admin && <Badge variant="secondary">Admin</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Cadastro em {new Date(profile.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>

                {profile.status === 'pending' && !profile.is_admin ? (
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Button
                      type="button"
                      size="sm"
                      disabled={pendingId === profile.id}
                      onClick={() => void handleReview(profile.id, 'approved')}
                    >
                      {pendingId === profile.id ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                      )}
                      Aprovar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:text-destructive"
                      disabled={pendingId === profile.id}
                      onClick={() => void handleReview(profile.id, 'rejected')}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: ProfileStatus }) {
  if (status === 'approved') {
    return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Aprovado</Badge>
  }
  if (status === 'rejected') {
    return (
      <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">
        Rejeitado
      </Badge>
    )
  }
  return (
    <Badge className="bg-brand-yellow/20 text-brand-orange hover:bg-brand-yellow/20">
      Pendente
    </Badge>
  )
}
