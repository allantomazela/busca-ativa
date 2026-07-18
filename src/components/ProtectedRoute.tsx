import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAuth from '@/stores/use-auth'

export function AuthenticatedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <AuthLoading />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function ApprovedRoute() {
  const { isLoading, isApproved, accessStatus } = useAuth()

  if (isLoading) return <AuthLoading />
  if (accessStatus === 'pending') return <Navigate to="/pending" replace />
  if (accessStatus === 'rejected') return <Navigate to="/rejected" replace />
  return isApproved ? <Outlet /> : <Navigate to="/pending" replace />
}

export function AdminRoute() {
  const { isLoading, isAdmin } = useAuth()

  if (isLoading) return <AuthLoading />
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando sessão" />
    </div>
  )
}
