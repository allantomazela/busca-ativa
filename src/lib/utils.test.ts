import { describe, expect, it } from 'vitest'
import {
  createLeadCsv,
  normalizeFacebookUrl,
  normalizeInstagramUrl,
  normalizeWebsiteUrl,
} from './utils'
import type { Lead } from './types'

describe('normalizeWebsiteUrl', () => {
  it('adiciona https quando o protocolo estiver ausente', () => {
    expect(normalizeWebsiteUrl('www.exemplo.com.br')).toBe('https://www.exemplo.com.br')
  })

  it('preserva protocolo existente', () => {
    expect(normalizeWebsiteUrl('https://www.exemplo.com.br')).toBe('https://www.exemplo.com.br')
    expect(normalizeWebsiteUrl('http://www.exemplo.com.br')).toBe('http://www.exemplo.com.br')
  })
})

describe('normalizeInstagramUrl', () => {
  it('normaliza handle e URL parcial', () => {
    expect(normalizeInstagramUrl('@replay')).toBe('https://instagram.com/replay')
    expect(normalizeInstagramUrl('instagram.com/replay')).toBe('https://instagram.com/replay')
  })
})

describe('normalizeFacebookUrl', () => {
  it('normaliza handle e URL parcial', () => {
    expect(normalizeFacebookUrl('@replay')).toBe('https://facebook.com/replay')
    expect(normalizeFacebookUrl('facebook.com/replay')).toBe('https://facebook.com/replay')
  })
})

describe('createLeadCsv', () => {
  it('exporta as colunas da tela com cidade, estado, redes e separador compatível com Excel', () => {
    const csv = createLeadCsv([leadFixture])
    const [headers, row] = csv.replace('\uFEFF', '').split('\r\n')

    expect(headers).toBe(
      '"Nome";"Endereço";"Cidade";"Estado";"Telefone";"Website";"Instagram";"Facebook";"Avaliação";"Status"',
    )
    expect(row).toContain('"Campinas";"SP"')
    expect(row).toContain('"@replaysports"')
    expect(row).toContain('"facebook.com/replaysports"')
    expect(row).toContain('"4,8 (120)"')
    expect(row).toContain('"Aberto"')
  })
})

const leadFixture: Lead = {
  id: 'lead-1',
  search_session_id: 'session-1',
  name: 'Arena Replay',
  formatted_address: 'Rua das Flores, 10 - Centro, Campinas, SP',
  city: 'Campinas',
  state: 'SP',
  phone_number: '(19) 99999-9999',
  website: 'www.replay.com.br',
  instagram: '@replaysports',
  facebook: 'facebook.com/replaysports',
  rating: 4.8,
  user_ratings_total: 120,
  latitude: -22.9,
  longitude: -47.06,
  is_open: true,
  opening_hours: ['Seg-Sex: 08:00-18:00'],
  place_id: 'place-1',
  created_at: '2026-07-17T12:00:00.000Z',
}
