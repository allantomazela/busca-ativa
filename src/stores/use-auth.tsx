import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { ProfileRow } from '@/lib/database.types'
import { createAvatarSignedUrl, fetchMyProfile } from '@/services/profile-service'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const loadedUserIdRef = useRef<string | null>(null)

  const loadProfile = useCallback(
    async (nextSession: Session | null, options?: { silent?: boolean }) => {
      if (!nextSession) {
        loadedUserIdRef.current = null
        setProfile(null)
        setAvatarUrl(null)
        setIsProfileLoading(false)
        return
      }

      if (!options?.silent) setIsProfileLoading(true)
      const result = await fetchMyProfile()
      const nextProfile = result.success ? result.data : null
      setProfile(nextProfile)
      setAvatarUrl(await createAvatarSignedUrl(nextProfile?.avatar_path ?? null))
      loadedUserIdRef.current = nextSession.user.id
      setIsProfileLoading(false)
    },
    [],
  )

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadProfile(data.session)
      if (active) setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      // Refresh de token (ex.: ao voltar para a aba) mantém o mesmo usuário.
      // Evita reentrar em estado de carregamento, que desmontaria as rotas
      // protegidas e descartaria o estado da busca em andamento.
      if (nextSession?.user?.id && nextSession.user.id === loadedUserIdRef.current) {
        if (active) setIsLoading(false)
        return
      }

      void loadProfile(nextSession).then(() => {
        if (active) setIsLoading(false)
      })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { success: false, error: getAuthErrorMessage(error.message) } : { success: true }
  }, [])

  const signUp = useCallback(
    async (fullName: string, email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) return { success: false, error: getSignUpErrorMessage(error.message) }

      if (!data.session) {
        return {
          success: true,
          message: 'Conta criada. Faça login para acompanhar a aprovação do administrador.',
        }
      }

      return {
        success: true,
        message: 'Conta criada. Aguarde a aprovação do administrador para liberar o acesso.',
      }
    },
    [],
  )

  const signOut = useCallback(async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut()
    return error
      ? { success: false, error: 'Não foi possível sair. Tente novamente.' }
      : { success: true }
  }, [])

  const refreshProfile = useCallback(async () => {
    await loadProfile(session)
  }, [loadProfile, session])

  const isAdmin = Boolean(profile?.is_admin || session?.user?.app_metadata?.role === 'admin')
  const isApproved = isAdmin || profile?.status === 'approved'
  const accessStatus = isAdmin ? 'approved' : (profile?.status ?? null)

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      avatarUrl,
      isLoading: isLoading || isProfileLoading,
      isAdmin,
      isApproved,
      accessStatus,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [
      session,
      profile,
      avatarUrl,
      isLoading,
      isProfileLoading,
      isAdmin,
      isApproved,
      accessStatus,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (normalized.includes('email not confirmed')) return 'Confirme seu e-mail antes de acessar.'
  return 'Não foi possível entrar. Tente novamente.'
}

function getSignUpErrorMessage(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('user already registered')) return 'Já existe uma conta com este e-mail.'
  if (normalized.includes('password')) {
    return 'A senha deve ter ao menos 8 caracteres, com letra maiúscula, minúscula e número.'
  }
  return 'Não foi possível criar a conta. Tente novamente.'
}

interface AuthProviderProps {
  children: React.ReactNode
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: ProfileRow | null
  avatarUrl: string | null
  isLoading: boolean
  isAdmin: boolean
  isApproved: boolean
  accessStatus: ProfileRow['status'] | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (fullName: string, email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  refreshProfile: () => Promise<void>
}

interface AuthResult {
  success: boolean
  error?: string
  message?: string
}
