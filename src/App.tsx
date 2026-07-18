import { lazy, Suspense } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LeadStoreProvider } from '@/stores/use-lead-store'
import { AuthProvider } from '@/stores/use-auth'
import { AdminRoute, ApprovedRoute, AuthenticatedRoute } from '@/components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<AuthenticatedRoute />}>
                <Route path="/pending" element={<PendingApproval />} />
                <Route path="/rejected" element={<RejectedAccess />} />
                <Route element={<ApprovedRoute />}>
                  <Route element={<ProtectedApp />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route element={<AdminRoute />}>
                        <Route path="/admin/users" element={<AdminUsers />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  )
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando página" />
    </div>
  )
}

function ProtectedApp() {
  return (
    <LeadStoreProvider>
      <Outlet />
    </LeadStoreProvider>
  )
}

const Index = lazy(() => import('./pages/Index'))
const History = lazy(() => import('./pages/History'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const PendingApproval = lazy(() => import('./pages/PendingApproval'))
const RejectedAccess = lazy(() => import('./pages/RejectedAccess'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Layout = lazy(() => import('./components/Layout'))

export default App
