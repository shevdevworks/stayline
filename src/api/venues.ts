import { getBookedRanges } from '@/data/bookedRanges'
import { findVenueBySlug, venues } from '@/data/venues'
import type { SortKey, VenueFilters } from '@/features/filters/types'
import { todayIso } from '@/lib/date/isoDate'
import { AMENITY_IDS } from '@/types'
import type { FilterFacets, VenueDetail, VenueSummary, VenueWithAvailability } from '@/types'
import { NotFoundError } from './errors'
import { simulateNetwork } from './delay'

function toSummary(venue: VenueDetail): VenueSummary {
  const { slug, name, type, city, pricePerDay, capacity, amenities, rating, images } = venue
  return { slug, name, type, city, pricePerDay, capacity, amenities, rating, coverImage: images[0] }
}

function sortVenues(list: VenueDetail[], sort: SortKey): VenueDetail[] {
  switch (sort) {
    case 'recommended':
      return list.sort((a, b) => b.rating - a.rating || a.slug.localeCompare(b.slug))
    case 'price-asc':
      return list.sort((a, b) => a.pricePerDay - b.pricePerDay)
    case 'price-desc':
      return list.sort((a, b) => b.pricePerDay - a.pricePerDay)
    case 'capacity-desc':
      return list.sort((a, b) => b.capacity - a.capacity)
  }
}

// The synchronous "server side" of each endpoint. The fetch* wrappers below
// add simulated latency on top; the first, prerendered render calls these
// directly (see lib/initialRender.ts).

export function getFilterFacets(): FilterFacets {
  const cities = Array.from(new Set(venues.map((venue) => venue.city))).sort()
  const types = Array.from(new Set(venues.map((venue) => venue.type))).sort()
  const prices = venues.map((venue) => venue.pricePerDay)

  return {
    cities,
    types,
    amenities: [...AMENITY_IDS],
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
  }
}

export function queryVenues(filters: VenueFilters): VenueSummary[] {
  const query = filters.query.trim().toLowerCase()
  const city = filters.city?.trim().toLowerCase() ?? null

  const filtered = venues.filter((venue) => {
    if (query !== '') {
      const matchesName = venue.name.toLowerCase().includes(query)
      const matchesCity = venue.city.toLowerCase().includes(query)
      if (!matchesName && !matchesCity) return false
    }

    if (city !== null && venue.city.toLowerCase() !== city) return false
    if (filters.types.length > 0 && !filters.types.includes(venue.type)) return false
    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((amenity) => venue.amenities.includes(amenity))
    ) {
      return false
    }
    if (filters.priceMin !== null && venue.pricePerDay < filters.priceMin) return false
    if (filters.priceMax !== null && venue.pricePerDay > filters.priceMax) return false
    if (filters.capacity !== null && venue.capacity < filters.capacity) return false

    return true
  })

  return sortVenues(filtered, filters.sort).map(toSummary)
}

export function getVenueWithAvailability(slug: string): VenueWithAvailability {
  const venue = findVenueBySlug(slug)
  if (!venue) {
    throw new NotFoundError(`Venue with slug "${slug}" not found`)
  }

  return { ...venue, bookedRanges: getBookedRanges(slug, todayIso()) }
}

export async function fetchFilterFacets(signal?: AbortSignal): Promise<FilterFacets> {
  await simulateNetwork(signal)
  return getFilterFacets()
}

export async function fetchVenues(filters: VenueFilters, signal?: AbortSignal): Promise<VenueSummary[]> {
  await simulateNetwork(signal)
  return queryVenues(filters)
}

export async function fetchVenueBySlug(slug: string, signal?: AbortSignal): Promise<VenueWithAvailability> {
  await simulateNetwork(signal)
  return getVenueWithAvailability(slug)
}
