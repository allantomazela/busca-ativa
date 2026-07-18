import { z } from 'zod'

export const searchFormSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(2, 'Informe um termo de busca com pelo menos 2 caracteres.')
    .max(80, 'O termo de busca deve ter no máximo 80 caracteres.'),
  location: z.string().trim().max(120, 'A localização deve ter no máximo 120 caracteres.'),
})

export const loginFormSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(128),
})

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Informe seu nome completo.')
  .max(80, 'O nome deve ter no máximo 80 caracteres.')

const strongPasswordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .max(128)
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula.')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula.')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número.')

export const signupFormSchema = z
  .object({
    fullName: fullNameSchema,
    email: z.string().trim().email('Informe um e-mail válido.'),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(8, 'Confirme sua senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export const profileFormSchema = z.object({
  fullName: fullNameSchema,
})

export const passwordFormSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(8, 'Confirme sua nova senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export type SearchFormValues = z.infer<typeof searchFormSchema>
export type LoginFormValues = z.infer<typeof loginFormSchema>
export type SignupFormValues = z.infer<typeof signupFormSchema>
export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type PasswordFormValues = z.infer<typeof passwordFormSchema>

/** Valida e normaliza os campos de busca. Em falha, retorna a primeira mensagem amigável. */
export function parseSearchForm(
  keyword: string,
  location: string,
): { success: true; data: SearchFormValues } | { success: false; error: string } {
  const result = searchFormSchema.safeParse({ keyword, location })

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      success: false,
      error: firstIssue?.message ?? 'Dados de busca inválidos.',
    }
  }

  return { success: true, data: result.data }
}
