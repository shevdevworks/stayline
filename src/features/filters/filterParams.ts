import { AMENITY_IDS, VENUE_TYPES } from '@/types'
import { DEFAULT_FILTERS, SORT_KEYS } from './types'
import type { SortKey, VenueFilters } from './types'

const MAX_QUERY_LENGTH = 100

export function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value)
}

export function isSortKey(value: string): value is SortKey {
  return isOneOf(value, SORT_KEYS)
}

function parseListParam<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (raw === null) return []

  const seen = new Set<T>()
  const result: T[] = []

  for (const rawItem of raw.split(',')) {
    const item = rawItem.trim()
    if (item !== '' && isOneOf(item, allowed) && !seen.has(item)) {
      seen.add(item)
      result.push(item)
    }
  }

  return result
}

function parseNonNegativeNumber(raw: string | null): number | null {
  if (raw === null) return null

  const trimmed = raw.trim()
  if (trimmed === '') return null

  const value = Number(trimmed)
  return Number.isFinite(value) && value >= 0 ? value : null
}

export function parseFilters(params: URLSearchParams): VenueFilters {
  const query = (params.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH)

  const cityRaw = params.get('city')
  const city = cityRaw !== null && cityRaw.trim() !== '' ? cityRaw.trim() : null

  const types = parseListParam(params.get('type'), VENUE_TYPES)
  const amenities = parseListParam(params.get('amenity'), AMENITY_IDS)

  const priceMin = parseNonNegativeNumber(params.get('priceMin'))
  const priceMax = parseNonNegativeNumber(params.get('priceMax'))

  const capacity = parseNonNegativeNumber(params.get('capacity'))

  const sortRaw = params.get('sort')
  const sort = sortRaw !== null && isSortKey(sortRaw) ? sortRaw : DEFAULT_FILTERS.sort

  return { query, city, types, amenities, priceMin, priceMax, capacity, sort }
}

export function toSearchParams(filters: VenueFilters): URLSearchParams {
  const params = new URLSearchParams()

  const trimmedQuery = filters.query.trim().slice(0, MAX_QUERY_LENGTH)
  if (trimmedQuery !== '') params.set('q', trimmedQuery)
  if (filters.city !== null) params.set('city', filters.city)
  if (filters.types.length > 0) params.set('type', filters.types.join(','))
  if (filters.amenities.length > 0) params.set('amenity', filters.amenities.join(','))
  if (filters.priceMin !== null) params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax !== null) params.set('priceMax', String(filters.priceMax))
  if (filters.capacity !== null) params.set('capacity', String(filters.capacity))
  if (filters.sort !== 'recommended') params.set('sort', filters.sort)

  return params
}
