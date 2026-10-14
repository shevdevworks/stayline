import type { DateRange } from '@/lib/date/types'

export const VENUE_TYPES = ['studio', 'coworking', 'meeting-room'] as const

export type VenueType = (typeof VENUE_TYPES)[number]

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  studio: 'Studio',
  coworking: 'Coworking',
  'meeting-room': 'Meeting room',
}

export const AMENITY_IDS = [
  'wifi',
  'natural-light',
  'sound-system',
  'cyclorama-wall',
  'coffee-bar',
  'phone-booths',
  'printer',
  'projector',
  'whiteboard',
  'air-conditioning',
  'blackout-curtains',
  'kitchenette',
  'standing-desks',
  'wheelchair-accessible',
  'lockers',
  'parking',
] as const

export type AmenityId = (typeof AMENITY_IDS)[number]

export const AMENITY_LABELS: Record<AmenityId, string> = {
  wifi: 'Wi-Fi',
  'natural-light': 'Natural light',
  'sound-system': 'Sound system',
  'cyclorama-wall': 'Cyclorama wall',
  'coffee-bar': 'Coffee bar',
  'phone-booths': 'Phone booths',
  printer: 'Printer',
  projector: 'Projector',
  whiteboard: 'Whiteboard',
  'air-conditioning': 'Air conditioning',
  'blackout-curtains': 'Blackout curtains',
  kitchenette: 'Kitchenette',
  'standing-desks': 'Standing desks',
  'wheelchair-accessible': 'Wheelchair accessible',
  lockers: 'Lockers',
  parking: 'Parking',
}

interface VenueCore {
  slug: string
  name: string
  type: VenueType
  city: string
  pricePerDay: number
  capacity: number
  amenities: AmenityId[]
  rating: number
}

// Illustrative stock photography (see PHOTO-CREDITS.md), always 3:2.
export interface VenueImage {
  src: string // 1200×800
  srcSmall: string // 600×400
  alt: string
}

export const VENUE_IMAGE_WIDTH = 1200
export const VENUE_IMAGE_HEIGHT = 800

export interface VenueSummary extends VenueCore {
  coverImage: VenueImage
}

export interface VenueDetail extends VenueCore {
  images: VenueImage[]
  description: string
  rules: string[]
  minDays: number
  maxDays: number
  address: string
}

// What fetchVenueBySlug returns: the static venue record plus its booked
// ranges, resolved against today at request time — kept off VenueDetail
// itself since data/venues.ts stores fixed records, not dated availability.
export interface VenueWithAvailability extends VenueDetail {
  bookedRanges: DateRange[]
}
