import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2, Trash2, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useToast } from '@/hooks/use-toast'
import { getUserInitials } from '@/lib/profile'
import { profileFormSchema, type ProfileFormValues } from '@/lib/schemas'
import {
  removeProfileAvatar,
  updateProfileName,
  uploadProfileAvatar,
} from '@/services/profile-service'
import useAuth from '@/stores/use-auth'

export function ProfileSettingsCard() {
  const { user, profile, avatarUrl, refreshProfile } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: profile?.full_name ?? '' },
  })

  useEffect(() => {
    form.reset({ fullName: profile?.full_name ?? '' })
  }, [form, profile?.full_name])

  async function handleNameSubmit(values: ProfileFormValues) {
    if (!profile) return
    const result = await updateProfileName(profile.id, values.fullName)

    if (!result.success) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    await refreshProfile()
    toast({ title: 'Perfil atualizado', description: 'Seu nome foi salvo.' })
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    const result = await uploadProfileAvatar(user.id, file)
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (!result.success) {
      setIsUploading(false)
      toast({ title: 'Erro ao enviar foto', description: result.error, variant: 'destructive' })
      return
    }

    await refreshProfile()
    setIsUploading(false)
    toast({ title: 'Foto atualizada', description: 'Seu novo avatar foi salvo.' })
  }

  async function handleRemoveAvatar() {
    if (!user || !profile?.avatar_path) return

    setIsRemoving(true)
    const result = await removeProfileAvatar(user.id, profile.avatar_path)

    if (!result.success) {
      setIsRemoving(false)
      toast({ title: 'Erro ao remover foto', description: result.error, variant: 'destructive' })
      return
    }

    await refreshProfile()
    setIsRemoving(false)
    toast({ title: 'Foto removida' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserRound className="h-5 w-5 text-primary" />
          Perfil
        </CardTitle>
        <CardDescription>Atualize seu nome e sua foto de identificação.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Avatar className="h-24 w-24 border-4 border-primary/10">
            <AvatarImage src={avatarUrl ?? undefined} alt="Foto do perfil" />
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {getUserInitials(profile?.full_name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button asChild variant="outline" disabled={isUploading}>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                Escolher foto
              </label>
            </Button>
            <Input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={isUploading}
              onChange={handleAvatarChange}
            />
            {profile?.avatar_path && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={isRemoving}
                onClick={handleRemoveAvatar}
              >
                {isRemoving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Remover
              </Button>
            )}
            <p className="w-full text-center text-xs text-muted-foreground sm:text-left">
              JPG, PNG ou WebP de até 2 MB.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNameSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do perfil</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>E-mail</FormLabel>
              <Input value={user?.email ?? ''} disabled className="mt-2" />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar perfil
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
