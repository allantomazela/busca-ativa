import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { LogOut, Search, Settings, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getUserInitials } from '@/lib/profile'
import useAuth from '@/stores/use-auth'

export default function Layout() {
  const location = useLocation()
  const { user, profile, avatarUrl, isAdmin, signOut } = useAuth()
  const { toast } = useToast()

  async function handleSignOut() {
    const result = await signOut()
    if (!result.success) {
      toast({
        title: 'Erro ao sair',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  const items = isAdmin
    ? [...navItems, { title: 'Aprovações', url: '/admin/users', icon: UserCheck }]
    : navItems

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <Sidebar className="hidden border-r border-primary/10 shadow-sm md:flex">
          <SidebarContent className="relative overflow-hidden">
            <div className="brand-gradient absolute inset-x-0 top-0 h-1" />
            <div className="px-5 pb-5 pt-7">
              <BrandLogo />
            </div>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-6 mb-2">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-3 gap-1">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="py-5 px-4 transition-all duration-200 ease-in-out hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium text-[15px]">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-primary/10 bg-card/85 px-4 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <BrandLogo compact className="md:hidden" />
              <span className="hidden text-sm font-semibold sm:inline md:hidden">
                Busca Ativa Replay Sports
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-muted-foreground sm:flex">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Ambiente seguro</span>
              </div>
              <Avatar className="h-9 w-9 border border-primary/15">
                <AvatarImage src={avatarUrl ?? undefined} alt="Foto do perfil" />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {getUserInitials(profile?.full_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-48 truncate text-sm text-muted-foreground lg:inline">
                {profile?.full_name || user?.email}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sair da conta"
                title="Sair da conta"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="relative flex-1 overflow-auto p-4 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

const navItems = [
  { title: 'Nova Busca', url: '/', icon: Search },
  { title: 'Meus Leads', url: '/history', icon: Users },
  { title: 'Configurações', url: '/settings', icon: Settings },
]
