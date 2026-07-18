import { Navigate } from 'react-router-dom'
import { Ban, LogOut } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useAuth from '@/stores/use-auth'

export default function RejectedAccess() {
  const { user, isApproved, accessStatus, signOut } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (isApproved) return <Navigate to="/" replace />
  if (accessStatus === 'pending') return <Navigate to="/pending" replace />

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <BrandLogo className="mb-6 justify-center" />
        <Card className="relative overflow-hidden border-destructive/20 shadow-xl">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-destructive" />
          <CardHeader className="space-y-3 pb-2 pt-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Ban className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Acesso negado</CardTitle>
            <CardDescription>
              Seu cadastro foi rejeitado pelo administrador. Se acredita que isso foi um engano,
              entre em contato com a equipe responsável.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
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
