import { supabase } from '@/lib/supabase'
import type { ProfileRow, ProfileStatus } from '@/lib/database.types'

export async function fetchMyProfile(): Promise<ServiceResult<ProfileRow | null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: true, data: null }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return { success: false, error: 'Não foi possível carregar seu perfil de acesso.' }
  }

  return { success: true, data }
}

export async function listProfiles(): Promise<ServiceResult<ProfileRow[]>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: 'Não foi possível carregar os usuários.' }
  }

  return { success: true, data }
}

export async function reviewProfile(
  profileId: string,
  status: Extract<ProfileStatus, 'approved' | 'rejected'>,
  reviewerId: string,
): Promise<ServiceResult<ProfileRow>> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', profileId)
    .select('*')
    .single()

  if (error || !data) {
    return { success: false, error: 'Não foi possível atualizar o status do usuário.' }
  }

  return { success: true, data }
}

export async function updateProfileName(
  profileId: string,
  fullName: string,
): Promise<ServiceResult<ProfileRow>> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', profileId)
    .select('*')
    .single()

  if (error || !data) {
    return { success: false, error: 'Não foi possível atualizar seu nome.' }
  }

  return { success: true, data }
}

export async function uploadProfileAvatar(
  userId: string,
  file: File,
): Promise<ServiceResult<string>> {
  const validationError = validateAvatar(file)
  if (validationError) return { success: false, error: validationError }

  const avatarPath = `${userId}/avatar`
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(avatarPath, file, {
      cacheControl: '60',
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { success: false, error: 'Não foi possível enviar a foto. Tente novamente.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_path: avatarPath })
    .eq('id', userId)

  if (profileError) {
    return { success: false, error: 'A foto foi enviada, mas o perfil não pôde ser atualizado.' }
  }

  return { success: true, data: avatarPath }
}

export async function removeProfileAvatar(
  userId: string,
  avatarPath: string,
): Promise<ServiceResult<null>> {
  const { error: storageError } = await supabase.storage.from(AVATAR_BUCKET).remove([avatarPath])
  if (storageError) {
    return { success: false, error: 'Não foi possível remover a foto.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_path: null })
    .eq('id', userId)

  if (profileError) {
    return { success: false, error: 'Não foi possível atualizar o perfil sem a foto.' }
  }

  return { success: true, data: null }
}

export async function createAvatarSignedUrl(avatarPath: string | null): Promise<string | null> {
  if (!avatarPath) return null

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(avatarPath, AVATAR_URL_TTL_SECONDS)

  return error ? null : data.signedUrl
}

export async function updatePassword(password: string): Promise<ServiceResult<null>> {
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return {
      success: false,
      error: 'Não foi possível alterar a senha. Entre novamente e tente outra vez.',
    }
  }

  return { success: true, data: null }
}

function validateAvatar(file: File) {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return 'Escolha uma imagem JPG, PNG ou WebP.'
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return 'A imagem deve ter no máximo 2 MB.'
  }
  return null
}

const AVATAR_BUCKET = 'avatars'
const AVATAR_URL_TTL_SECONDS = 60 * 60
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export type ServiceResult<T> = { success: true; data: T } | { success: false; error: string }
