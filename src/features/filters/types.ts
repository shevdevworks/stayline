import type { AmenityId, VenueType } from '@/types'

export const SORT_KEYS = ['recommended', 'price-asc', 'price-desc', 'capacity-desc'] as const

export type SortKey = (typeof SORT_KEYS)[number]

export interface VenueFilters {
  query: string
  city: string | null
  types: VenueType[]
  amenities: AmenityId[]
  priceMin: number | null
  priceMax: number | null
  capacity: number | null
  sort: SortKey
}

export const DEFAULT_FILTERS: VenueFilters = {
  query: '',
  city: null,
  types: [],
  amenities: [],
  priceMin: null,
  priceMax: null,
  capacity: null,
  sort: 'recommended',
}
