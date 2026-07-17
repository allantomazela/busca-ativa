import { Lead } from '@/lib/types'

const businessNames = [
  'Padaria Pão Quente',
  'Restaurante Sabor Caseiro',
  'Clinica Vitalis',
  'Auto Center Veloz',
  'Pet Shop Amigo Fiel',
  'Farmácia Saúde Total',
  'Academia Corpo em Forma',
  'Salão Beleza Pura',
  'Dentista Sorriso Perfeito',
  'Escritório Contábil Precisão',
  'Mercado Economia',
  'Lanchonete Bom Apetite',
  'Estética Facial Bella',
  'Advocacia Silva & Associados',
  'Loja de Móveis Conforto',
  'Pizzaria Forno a Lenha',
  'Barbearia Navalha de Ouro',
  'Floricultura Jardim Secreto',
  'Estúdio de Pilates Equilíbrio',
  'Borracharia 24h Socorro',
]

const streets = [
  'Rua das Flores, 123',
  'Av. Paulista, 1000',
  'Rua da Liberdade, 456',
  'Av. Brasil, 200',
  'Rua dos Pinheiros, 789',
  'Av. Napoleão, 33',
  'Rua Dom Pedro, 555',
  'Av. das Palmeiras, 77',
  'Rua das Acácias, 42',
]

const neighborhoods = [
  'Centro',
  'Vila Mariana',
  'Jardins',
  'Pinheiros',
  'Moema',
  'Itaim Bibi',
  'Bela Vista',
  'Liberdade',
]

const cities = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Curitiba, PR',
  'Porto Alegre, RS',
]

const websites = [
  'www.paoquente.com.br',
  'www.saborcaseiro.com.br',
  'www.vitalis.com.br',
  'www.veloz.com.br',
  'www.amigofiel.com.br',
  'www.saudetotal.com.br',
  '',
  '',
  '',
]

const openingHoursTemplates = [
  ['Seg-Sex: 08:00-18:00', 'Sáb: 08:00-14:00', 'Dom: Fechado'],
  ['Seg-Dom: 06:00-22:00'],
  ['Seg-Sex: 09:00-19:00', 'Sáb-Dom: Fechado'],
  ['24 horas'],
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateMockLeads(
  keyword: string,
  location: string,
  sessionId: string,
  count = 20,
): Lead[] {
  const leads: Lead[] = []
  for (let i = 0; i < count; i++) {
    const city = randomItem(cities)
    const street = randomItem(streets)
    const neighborhood = randomItem(neighborhoods)
    leads.push({
      id: `lead_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 8)}`,
      search_session_id: sessionId,
      name: `${randomItem(businessNames)} ${keyword}`,
      formatted_address: `${street} - ${neighborhood}, ${location || city}`,
      phone_number: `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: randomItem(websites),
      rating: Math.round((Math.random() * 3 + 2) * 10) / 10,
      user_ratings_total: Math.floor(Math.random() * 500) + 5,
      latitude: -23.5 + (Math.random() - 0.5) * 0.5,
      longitude: -46.6 + (Math.random() - 0.5) * 0.5,
      is_open: Math.random() > 0.3,
      opening_hours: randomItem(openingHoursTemplates),
      place_id: `ChIJ${Math.random().toString(36).substring(2, 15)}`,
      created_at: new Date().toISOString(),
    })
  }
  return leads
}
