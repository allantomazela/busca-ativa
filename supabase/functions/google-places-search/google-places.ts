const GOOGLE_PLACES_URL = 'https://places.googleapis.com/v1/places:searchText'
const FIELD_MASK = [
  'nextPageToken',
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.location',
  'places.currentOpeningHours',
].join(',')

export async function searchPlaces(
  apiKey: string,
  input: PlacesSearchInput,
): Promise<PlacesSearchResult> {
  const response = await fetch(GOOGLE_PLACES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: [input.keyword, input.location].filter(Boolean).join(' em '),
      languageCode: 'pt-BR',
      regionCode: 'BR',
      pageSize: 20,
      ...(input.pageToken ? { pageToken: input.pageToken } : {}),
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    console.error('Google Places request failed', {
      status: response.status,
      code: getGoogleErrorCode(body),
    })
    return {
      success: false,
      status: response.status === 429 ? 429 : 502,
      error:
        response.status === 429
          ? 'Limite de buscas temporariamente atingido. Tente novamente em alguns minutos.'
          : 'O Google Places não conseguiu concluir a busca.',
    }
  }

  const data = (await response.json()) as GooglePlacesResponse
  return {
    success: true,
    places: (data.places ?? []).map(mapGooglePlace),
    nextPageToken: data.nextPageToken ?? null,
  }
}

function mapGooglePlace(place: GooglePlace): NormalizedPlace {
  const city = findAddressComponent(place.addressComponents, [
    'locality',
    'administrative_area_level_2',
  ])
  const state = normalizeState(
    findAddressComponent(place.addressComponents, ['administrative_area_level_1'], true),
  )
  const social = classifyWebsite(place.websiteUri ?? '')

  return {
    google_place_id: place.id,
    name: place.displayName?.text ?? 'Estabelecimento sem nome',
    formatted_address: place.formattedAddress ?? '',
    city,
    state,
    phone_number: place.nationalPhoneNumber ?? '',
    website: social.website,
    instagram: social.instagram,
    facebook: social.facebook,
    rating: normalizeRating(place.rating),
    user_ratings_total: Math.max(0, Math.floor(place.userRatingCount ?? 0)),
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    is_open: place.currentOpeningHours?.openNow ?? false,
    opening_hours: place.currentOpeningHours?.weekdayDescriptions ?? [],
  }
}

function normalizeState(value: string) {
  const trimmed = value.trim().toUpperCase()
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed
  return ''
}

function normalizeRating(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(5, Math.max(0, Math.round(value * 10) / 10))
}

function findAddressComponent(
  components: AddressComponent[] | undefined,
  acceptedTypes: string[],
  preferShortText = false,
) {
  const component = components?.find((item) =>
    (item.types ?? []).some((type) => acceptedTypes.includes(type)),
  )
  return (preferShortText ? component?.shortText : component?.longText) ?? ''
}

function classifyWebsite(url: string) {
  const normalized = url.toLowerCase()
  if (normalized.includes('instagram.com/')) {
    return { website: '', instagram: url, facebook: '' }
  }
  if (normalized.includes('facebook.com/')) {
    return { website: '', instagram: '', facebook: url }
  }
  return { website: url, instagram: '', facebook: '' }
}

function getGoogleErrorCode(value: unknown) {
  if (!value || typeof value !== 'object' || !('error' in value)) return 'UNKNOWN'
  const error = value.error
  if (!error || typeof error !== 'object' || !('status' in error)) return 'UNKNOWN'
  return typeof error.status === 'string' ? error.status : 'UNKNOWN'
}

export interface PlacesSearchInput {
  keyword: string
  location: string
  pageToken?: string | null
}

export interface NormalizedPlace {
  google_place_id: string
  name: string
  formatted_address: string
  city: string
  state: string
  phone_number: string
  website: string
  instagram: string
  facebook: string
  rating: number
  user_ratings_total: number
  latitude: number | null
  longitude: number | null
  is_open: boolean
  opening_hours: string[]
}

type PlacesSearchResult =
  | { success: true; places: NormalizedPlace[]; nextPageToken: string | null }
  | { success: false; status: number; error: string }

interface GooglePlacesResponse {
  places?: GooglePlace[]
  nextPageToken?: string
}

interface GooglePlace {
  id: string
  displayName?: { text?: string }
  formattedAddress?: string
  addressComponents?: AddressComponent[]
  nationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  location?: { latitude?: number; longitude?: number }
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] }
}

interface AddressComponent {
  longText?: string
  shortText?: string
  types?: string[]
}
