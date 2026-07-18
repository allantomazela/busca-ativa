import type { Lead } from '@/lib/types'

const BRAZILIAN_UF = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
])

export function parseCityState(value: string): LeadLocation {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) return { city: '', state: '' }

  // Exemplos: "Botucatu-SP", "Campinas, SP", "... Centro, Botucatu-SP"
  const endCityState = normalized.match(
    /(?:^|,\s*)([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]*?)\s*[-/,]\s*([A-Za-z]{2})\s*$/i,
  )
  if (endCityState && isBrazilianState(endCityState[2])) {
    return {
      city: endCityState[1].trim(),
      state: endCityState[2].toUpperCase(),
    }
  }

  // Exemplo: "Botucatu SP"
  const spacedCityState = normalized.match(
    /(?:^|,\s*)([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]*)\s+([A-Za-z]{2})\s*$/i,
  )
  if (spacedCityState && isBrazilianState(spacedCityState[2])) {
    return {
      city: spacedCityState[1].trim(),
      state: spacedCityState[2].toUpperCase(),
    }
  }

  const parts = normalized
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const possibleState = parts.at(-1) ?? ''
  if (isBrazilianState(possibleState) && parts.length >= 2) {
    return {
      city: parts.at(-2) ?? '',
      state: possibleState.toUpperCase(),
    }
  }

  return { city: normalized, state: '' }
}

export function resolveLeadLocation(lead: LeadLocationSource): LeadLocation {
  const city = lead.city?.trim() ?? ''
  const state = lead.state?.trim().toUpperCase() ?? ''

  if (city && isBrazilianState(state) && !looksLikeCombinedCityState(city)) {
    return { city, state }
  }

  if (city) {
    const fromCity = parseCityState(city)
    if (fromCity.state) return fromCity
  }

  if (state && city && !looksLikeCombinedCityState(city)) {
    return { city, state }
  }

  return parseCityState(lead.formatted_address || city)
}

export function getLeadTableRow(lead: Lead): LeadTableRow {
  const { city, state } = resolveLeadLocation(lead)

  return {
    name: lead.name,
    address: lead.formatted_address,
    city,
    state,
    phone: lead.phone_number,
    website: lead.website,
    instagram: lead.instagram || '',
    facebook: lead.facebook || '',
    rating:
      lead.rating > 0
        ? `${ratingFormatter.format(lead.rating)} (${lead.user_ratings_total})`
        : 'Sem avaliação',
    status: lead.is_open ? 'Aberto' : 'Fechado',
  }
}

export interface LeadTableRow {
  name: string
  address: string
  city: string
  state: string
  phone: string
  website: string
  instagram: string
  facebook: string
  rating: string
  status: string
}

interface LeadLocation {
  city: string
  state: string
}

interface LeadLocationSource {
  city?: string
  state?: string
  formatted_address: string
}

interface LeadTableColumn {
  key: keyof LeadTableRow
  label: string
}

export const leadTableColumns: LeadTableColumn[] = [
  { key: 'name', label: 'Nome' },
  { key: 'address', label: 'Endereço' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'Estado' },
  { key: 'phone', label: 'Telefone' },
  { key: 'website', label: 'Website' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'rating', label: 'Avaliação' },
  { key: 'status', label: 'Status' },
]

function isBrazilianState(value: string) {
  return BRAZILIAN_UF.has(value.trim().toUpperCase())
}

function looksLikeCombinedCityState(value: string) {
  return /[-/]\s*[A-Za-z]{2}$/i.test(value.trim()) || /,\s*[A-Za-z]{2}$/i.test(value.trim())
}

const ratingFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
