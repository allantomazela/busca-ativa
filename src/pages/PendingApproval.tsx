import { Navigate } from 'react-router-dom'
import { Clock3, Loader2, LogOut, RefreshCw } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useAuth from '@/stores/use-auth'

export default function PendingApproval() {
  const { user, isApproved, accessStatus, refreshProfile, signOut, isLoading } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (isApproved) return <Navigate to="/" replace />
  if (accessStatus === 'rejected') return <Navigate to="/rejected" replace />

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <BrandLogo className="mb-6 justify-center" />
        <Card className="relative overflow-hidden border-brand-orange/20 shadow-xl">
          <div className="brand-gradient absolute inset-x-0 top-0 h-1.5" />
          <CardHeader className="space-y-3 pb-2 pt-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/20">
              <Clock3 className="h-6 w-6 text-brand-orange" />
            </div>
            <CardTitle className="text-2xl">Aguardando aprovação</CardTitle>
            <CardDescription>
              Sua conta foi criada. Um administrador precisa liberar o acesso antes de você usar o
              sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-center text-sm text-muted-foreground">
              {user.email}
            </p>
            <Button
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={() => void refreshProfile()}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Verificar aprovação
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
