import { Badge } from '@/components/ui/badge'
import { AdminSystemSettings } from '@/components/settings/AdminSystemSettings'
import { PasswordSettingsCard } from '@/components/settings/PasswordSettingsCard'
import { ProfileSettingsCard } from '@/components/settings/ProfileSettingsCard'
import useAuth from '@/stores/use-auth'

export default function Settings() {
  const { isAdmin } = useAuth()

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">Configurações</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Gerencie seu perfil e a segurança da sua conta.
        </p>
      </div>

      <ProfileSettingsCard />
      <PasswordSettingsCard />
      {isAdmin && <AdminSystemSettings />}

      <div className="pb-4 text-center">
        <Badge variant="secondary" className="text-xs">
          Busca Ativa Replay Sports v1.0.0
        </Badge>
      </div>
    </div>
  )
}
