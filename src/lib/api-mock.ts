import { Lead } from './types'
import { generateId } from './utils'

const FIRST_NAMES = ['Clínica', 'Consultório', 'Studio', 'Instituto', 'Centro', 'Espaço']
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira']
const STREETS = ['Rua das Flores', 'Av. Paulista', 'Rua Augusta', 'Av. Brasil', 'Rua da Paz']

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMockLead(term: string, location: string, sessionId: string): Lead {
  const isGeneric = !term
  const namePrefix = isGeneric ? randomChoice(FIRST_NAMES) : term

  return {
    id: generateId(),
    search_session_id: sessionId,
    google_place_id: `ChIJ${generateId()}`,
    name: `${namePrefix} ${randomChoice(LAST_NAMES)}`,
    formatted_address: `${randomChoice(STREETS)}, ${Math.floor(Math.random() * 1000)} - ${location}`,
    phone_number: `+55 ${Math.floor(Math.random() * 90) + 11} 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    website:
      Math.random() > 0.3
        ? `https://www.${namePrefix.toLowerCase().replace(/\s/g, '')}${randomChoice(LAST_NAMES).toLowerCase()}.com.br`
        : '',
    rating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
    user_ratings_total: Math.floor(Math.random() * 500) + 10,
    latitude: -23.5505 + (Math.random() * 0.1 - 0.05),
    longitude: -46.6333 + (Math.random() * 0.1 - 0.05),
    is_open: Math.random() > 0.2,
  }
}

export async function fetchGooglePlacesMock(
  term: string,
  location: string,
  sessionId: string,
  pageToken: string | null = null,
): Promise<{ data: Lead[]; next_page_token: string | null }> {
  // Simulate network delay (Google API requirement approx 2s)
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const itemsCount = 20 // Simulated page size
  const data: Lead[] = Array.from({ length: itemsCount }).map(() =>
    generateMockLead(term, location, sessionId),
  )

  // Simulate up to 3 pages (60 items max per Google session limits)
  const pageNumber = pageToken ? parseInt(pageToken.split('-')[1]) : 1
  let next_page_token = null

  if (pageNumber < 3) {
    next_page_token = `token-${pageNumber + 1}`
  }

  return { data, next_page_token }
}
