import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, LockKeyhole, Mail } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginFormSchema, type LoginFormValues } from '@/lib/schemas'
import useAuth from '@/stores/use-auth'

export default function Login() {
  const { user, isApproved, accessStatus, signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  if (user && isApproved) return <Navigate to="/" replace />
  if (user && accessStatus === 'pending') return <Navigate to="/pending" replace />
  if (user && accessStatus === 'rejected') return <Navigate to="/rejected" replace />

  async function handleSubmit(values: LoginFormValues) {
    setError(null)
    const result = await signIn(values.email, values.password)
    if (!result.success) setError(result.error ?? 'Não foi possível entrar.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <BrandLogo className="mb-6 justify-center" />
        <Card className="relative overflow-hidden border-primary/15 shadow-xl shadow-primary/10">
          <div className="brand-gradient absolute inset-x-0 top-0 h-1.5" />
          <CardHeader className="space-y-2 pb-4 pt-8 text-center">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Use sua conta para acessar o Busca Ativa Replay Sports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            autoComplete="email"
                            className="h-10 pl-9"
                            placeholder="voce@empresa.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            autoComplete="current-password"
                            className="h-10 pl-9"
                            placeholder="Sua senha"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Ainda não tem conta?{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Criar conta
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
