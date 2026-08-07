import type { AmenityId, VenueType } from './venue'

export interface FilterFacets {
  cities: string[]
  types: VenueType[]
  amenities: AmenityId[]
  priceMin: number
  priceMax: number
}
