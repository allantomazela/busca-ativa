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
import { Search, Users, Settings, Zap, MapPin } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { title: 'Nova Busca', url: '/', icon: Search },
    { title: 'Meus Leads', url: '/history', icon: Users },
    { title: 'Configurações', url: '/settings', icon: Settings },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <Sidebar className="border-r shadow-sm hidden md:flex">
          <SidebarContent>
            <div className="p-6 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                Busca Ativa Pro
              </span>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-6 mb-2">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-3 gap-1">
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="py-5 px-4 transition-all duration-200 ease-in-out hover:bg-secondary"
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
          <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="font-semibold text-lg md:hidden">Busca Ativa Pro</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Status da API: Operacional</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
                US
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50/50 dark:bg-transparent relative">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
