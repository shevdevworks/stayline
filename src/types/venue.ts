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

export interface VenueImage {
  src: string
  alt: string
}

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
