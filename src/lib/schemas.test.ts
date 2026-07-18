import { describe, expect, it } from 'vitest'
import {
  parseSearchForm,
  passwordFormSchema,
  profileFormSchema,
  searchFormSchema,
  signupFormSchema,
} from './schemas'

describe('searchFormSchema', () => {
  it('aceita keyword e location válidos', () => {
    const result = searchFormSchema.safeParse({
      keyword: 'padaria',
      location: 'São Paulo, SP',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ keyword: 'padaria', location: 'São Paulo, SP' })
    }
  })

  it('aceita location vazia', () => {
    const result = searchFormSchema.safeParse({ keyword: 'clínica', location: '' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.location).toBe('')
    }
  })

  it('aplica trim nos campos', () => {
    const result = searchFormSchema.safeParse({
      keyword: '  restaurante  ',
      location: '  Campinas  ',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ keyword: 'restaurante', location: 'Campinas' })
    }
  })

  it('rejeita keyword com menos de 2 caracteres', () => {
    const result = searchFormSchema.safeParse({ keyword: 'a', location: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Informe um termo de busca com pelo menos 2 caracteres.',
      )
    }
  })

  it('rejeita keyword só com espaços (após trim)', () => {
    const result = searchFormSchema.safeParse({ keyword: '   ', location: '' })

    expect(result.success).toBe(false)
  })

  it('rejeita keyword com mais de 80 caracteres', () => {
    const result = searchFormSchema.safeParse({
      keyword: 'x'.repeat(81),
      location: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'O termo de busca deve ter no máximo 80 caracteres.',
      )
    }
  })

  it('rejeita location com mais de 120 caracteres', () => {
    const result = searchFormSchema.safeParse({
      keyword: 'padaria',
      location: 'y'.repeat(121),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'A localização deve ter no máximo 120 caracteres.',
      )
    }
  })

  it('aceita keyword e location no limite máximo', () => {
    const result = searchFormSchema.safeParse({
      keyword: 'k'.repeat(80),
      location: 'l'.repeat(120),
    })

    expect(result.success).toBe(true)
  })
})

describe('parseSearchForm', () => {
  it('retorna data normalizada em sucesso', () => {
    const result = parseSearchForm('  padaria  ', '  SP  ')

    expect(result).toEqual({
      success: true,
      data: { keyword: 'padaria', location: 'SP' },
    })
  })

  it('retorna a primeira mensagem amigável em falha', () => {
    const result = parseSearchForm('', 'qualquer')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Informe um termo de busca com pelo menos 2 caracteres.')
    }
  })
})

describe('signupFormSchema', () => {
  it('aceita cadastro válido', () => {
    const result = signupFormSchema.safeParse({
      fullName: 'Allan Tomazela',
      email: 'allan@example.com',
      password: 'Senha123',
      confirmPassword: 'Senha123',
    })

    expect(result.success).toBe(true)
  })

  it('rejeita senhas diferentes', () => {
    const result = signupFormSchema.safeParse({
      fullName: 'Allan Tomazela',
      email: 'allan@example.com',
      password: 'Senha123',
      confirmPassword: 'Senha124',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === 'As senhas não coincidem.'),
      ).toBe(true)
    }
  })
})

describe('profileFormSchema', () => {
  it('normaliza e aceita um nome válido', () => {
    expect(profileFormSchema.parse({ fullName: '  Maria Silva  ' })).toEqual({
      fullName: 'Maria Silva',
    })
  })
})

describe('passwordFormSchema', () => {
  it('rejeita senha fraca', () => {
    expect(
      passwordFormSchema.safeParse({
        password: 'senhafraca',
        confirmPassword: 'senhafraca',
      }).success,
    ).toBe(false)
  })

  it('aceita senha forte confirmada', () => {
    expect(
      passwordFormSchema.safeParse({
        password: 'NovaSenha123',
        confirmPassword: 'NovaSenha123',
      }).success,
    ).toBe(true)
  })
})
