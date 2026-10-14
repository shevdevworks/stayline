import type { VenueDetail, VenueImage } from '@/types'

// Every venue ships five photos as <n>.webp (1200×800) and <n>-sm.webp
// (600×400), numbered in gallery order. Globbing keeps this file to data
// instead of 120 import lines; Vite still fingerprints and emits each file.
const photoUrls = import.meta.glob<string>('../assets/venues/*/*.webp', {
  eager: true,
  import: 'default',
})

function photoUrl(slug: string, file: string): string {
  const url = photoUrls[`../assets/venues/${slug}/${file}.webp`]
  if (url === undefined) throw new Error(`Missing venue photo: ${slug}/${file}.webp`)
  return url
}

function photos(slug: string, alts: string[]): VenueImage[] {
  return alts.map((alt, index) => ({
    src: photoUrl(slug, String(index + 1)),
    srcSmall: photoUrl(slug, `${index + 1}-sm`),
    alt,
  }))
}

const STUDIO_RULES = ['No open flame or smoke effects indoors', 'Clean up the set before checkout']
const COWORKING_RULES = ['Keep shared desks clear when you leave', 'Calls belong in the phone booths']
const MEETING_ROOM_RULES = ['Leave the room as you found it', 'Book catering at least a day in advance']

export const venues: VenueDetail[] = [
  {
    slug: 'berlin-kreuzberg-loft',
    name: 'Kreuzberg Loft Studio',
    type: 'studio',
    city: 'Berlin',
    address: 'Skalitzer Straße 104, 10997 Berlin',
    pricePerDay: 280,
    capacity: 12,
    amenities: ['natural-light', 'sound-system', 'cyclorama-wall', 'wifi'],
    rating: 4.7,
    images: photos('berlin-kreuzberg-loft', [
      'A yellow armchair surrounded by potted plants beside a large steel-framed window',
      'Whitewashed brick walls, trestle tables and a light stand under the loft windows',
      'Open studio floor with a structural column, folding director’s chairs and a kitchen counter',
      'Tall factory windows, potted plants and a long wooden worktable on the concrete studio floor',
      'A camera operator filming under pendant lamps in the furnished corner of the studio',
    ]),
    description:
      'A converted industrial loft with tall windows and a full-height cyclorama wall, popular for photo and video production.',
    rules: STUDIO_RULES,
    minDays: 1,
    maxDays: 7,
  },
  {
    slug: 'berlin-mitte-coworking',
    name: 'Mitte Coworking Hub',
    type: 'coworking',
    city: 'Berlin',
    address: 'Torstraße 68, 10119 Berlin',
    pricePerDay: 80,
    capacity: 40,
    amenities: ['wifi', 'coffee-bar', 'phone-booths', 'printer'],
    rating: 4.4,
    images: photos('berlin-mitte-coworking', [
      'Long rows of wooden desks under string lights and pendant lamps on the open coworking floor',
      'Brick walls, pendant lamps and desks on a mezzanine above the main floor',
      'Members working on laptops along a long shared desk, seen from above',
      'Two members talking at a desk beside tall curved windows',
      'Open-plan floor with desks, sofas and glass meeting rooms at the back',
    ]),
    description:
      'An open-plan coworking floor in the heart of Mitte with flexible desks and quiet phone booths for calls.',
    rules: COWORKING_RULES,
    minDays: 2,
    maxDays: 30,
  },
  {
    slug: 'amsterdam-canal-meeting-room',
    name: 'Canal View Meeting Room',
    type: 'meeting-room',
    city: 'Amsterdam',
    address: 'Herengracht 182, 1016 BR Amsterdam',
    pricePerDay: 200,
    capacity: 8,
    amenities: ['wifi', 'projector', 'whiteboard', 'air-conditioning'],
    rating: 4.8,
    images: photos('amsterdam-canal-meeting-room', [
      'Oval meeting table with black office chairs on a wooden floor, sunlight through the blinds',
      'Glass-walled meeting room with a long white table and a wall-mounted screen',
      'Long boardroom table lined with leather chairs facing a projection screen',
      'Conference table fitted with microphones and table-top screens',
      'Three people reviewing documents at the meeting table, a screen on the wall behind',
    ]),
    description:
      'A boardroom overlooking the Herengracht canal, fitted with a large display and video conferencing setup.',
    rules: MEETING_ROOM_RULES,
    minDays: 1,
    maxDays: 2,
  },
  {
    slug: 'amsterdam-jordaan-photo-studio',
    name: 'Jordaan Photo Studio',
    type: 'studio',
    city: 'Amsterdam',
    address: 'Westerstraat 51, 1015 LX Amsterdam',
    pricePerDay: 320,
    capacity: 10,
    amenities: ['natural-light', 'blackout-curtains', 'kitchenette', 'wifi'],
    rating: 4.6,
    images: photos('amsterdam-jordaan-photo-studio', [
      'Attic shooting space with a wooden floor, an arched window and a draped backdrop',
      'Bright white studio with barred windows and a lighting cart',
      'A photographer setting up a large reflector lamp next to a black backdrop',
      'Lighting stands and diffusion fabric in front of a window',
      'Softbox lights and a curved backdrop lit in warm orange',
    ]),
    description:
      'A bright canal-house studio in Jordaan with adjustable blackout curtains for controlled lighting setups.',
    rules: STUDIO_RULES,
    minDays: 1,
    maxDays: 5,
  },
  {
    slug: 'lisbon-alfama-creative-space',
    name: 'Alfama Creative Space',
    type: 'coworking',
    city: 'Lisbon',
    address: 'Rua de São Pedro 12, 1100-500 Lisbon',
    pricePerDay: 60,
    capacity: 30,
    amenities: ['wifi', 'coffee-bar', 'standing-desks', 'wheelchair-accessible'],
    rating: 4.3,
    images: photos('lisbon-alfama-creative-space', [
      'Sunny open floor with wooden boards, shared tables and an orange armchair under a vaulted ceiling',
      'Window bench, café tables and potted plants along the main room',
      'A member working on a laptop at a desk framed by plants',
      'Row of white desks with monitors beside a tall French window',
      'Members at desks under pendant lamps against a dusty pink wall',
    ]),
    description:
      'A tiled Alfama townhouse turned coworking space, with a mix of standing desks and shared tables.',
    rules: COWORKING_RULES,
    minDays: 3,
    maxDays: 21,
  },
  {
    slug: 'lisbon-baixa-rehearsal-studio',
    name: 'Baixa Rehearsal Studio',
    type: 'studio',
    city: 'Lisbon',
    address: 'Rua Augusta 220, 1100-053 Lisbon',
    pricePerDay: 160,
    capacity: 15,
    amenities: ['sound-system', 'air-conditioning', 'lockers', 'wifi'],
    rating: 4.5,
    images: photos('lisbon-baixa-rehearsal-studio', [
      'Bass guitar and amplifiers in front of a red plaster wall',
      'Drum kit and amplifiers on the rehearsal stage',
      'Folding wooden chairs, an upright piano and a music stand in the smaller room',
      'A musician with an acoustic guitar seated in front of the stage speakers',
      'An electric guitar and stacked amplifiers against a blue wall',
    ]),
    description:
      'A soundproofed rehearsal room on the pedestrian Rua Augusta, equipped with a full PA system and lockers.',
    rules: STUDIO_RULES,
    minDays: 1,
    maxDays: 10,
  },
  {
    slug: 'warsaw-praga-industrial-studio',
    name: 'Praga Industrial Studio',
    type: 'studio',
    city: 'Warsaw',
    address: 'Ząbkowska 27, 03-736 Warsaw',
    pricePerDay: 130,
    capacity: 20,
    amenities: ['natural-light', 'parking', 'sound-system', 'wifi'],
    rating: 4.2,
    images: photos('warsaw-praga-industrial-studio', [
      'Former factory hall with brick columns, arched windows and a concrete floor',
      'Sunlight falling between exposed brick columns beside tall windows',
      'Brick hall lit by strings of warm lights',
      'White-panelled hall with rows of windows and string lights overhead',
      'Empty room with green walls and daylight across the floor',
    ]),
    description:
      'A raw brick warehouse space in the Praga district, well suited for larger shoots and events.',
    rules: STUDIO_RULES,
    minDays: 2,
    maxDays: 14,
  },
  {
    slug: 'warsaw-mokotow-business-lounge',
    name: 'Mokotów Business Lounge',
    type: 'meeting-room',
    city: 'Warsaw',
    address: 'Puławska 145, 02-715 Warsaw',
    pricePerDay: 110,
    capacity: 6,
    amenities: ['wifi', 'projector', 'coffee-bar', 'air-conditioning'],
    rating: 4.5,
    images: photos('warsaw-mokotow-business-lounge', [
      'Meeting room with a long oak table and burgundy chairs',
      'Long wooden table with blue chairs and a planter running down the middle',
      'Training room with white desks and blue chairs facing a screen',
      'Compact navy meeting booth with white chairs around a small table',
      'Rows of white chairs set up for a presentation',
    ]),
    description:
      'A quiet meeting room in a Mokotów business centre, geared toward client presentations and interviews.',
    rules: MEETING_ROOM_RULES,
    minDays: 1,
    maxDays: 3,
  },
  {
    slug: 'barcelona-gracia-podcast-studio',
    name: 'Gràcia Podcast Studio',
    type: 'studio',
    city: 'Barcelona',
    address: 'Carrer de Verdi 32, 08012 Barcelona',
    pricePerDay: 180,
    capacity: 4,
    amenities: ['sound-system', 'air-conditioning', 'wifi'],
    rating: 4.9,
    images: photos('barcelona-gracia-podcast-studio', [
      'Recording room with a large mixing console and wood-panelled walls',
      'Podcast table with microphone arms and headphones beside a window and a brick wall',
      'An engineer working at the mixing console in front of studio monitors',
      'Upright piano in the treated live room',
      'Reel-to-reel player and vintage speakers on a wooden shelf',
    ]),
    description:
      'A treated, acoustically isolated room built for podcast and voiceover recording, with a four-mic setup.',
    rules: STUDIO_RULES,
    minDays: 1,
    maxDays: 7,
  },
  {
    slug: 'barcelona-eixample-coworking-loft',
    name: 'Eixample Coworking Loft',
    type: 'coworking',
    city: 'Barcelona',
    address: 'Carrer de Mallorca 401, 08013 Barcelona',
    pricePerDay: 70,
    capacity: 50,
    amenities: ['wifi', 'coffee-bar', 'phone-booths', 'standing-desks'],
    rating: 4.4,
    images: photos('barcelona-eixample-coworking-loft', [
      'Shared tables under exposed wooden beams, with plants and an arched window',
      'Bright lounge with a wooden floor, plants and green armchairs by the windows',
      'Brick walls and long tables in the busy common area',
      'Attic space with skylights and a brick pillar',
      'Lounge chairs and tables beside a wall of curtained windows',
    ]),
    description:
      'A high-ceilinged Eixample loft with modernist details, hosting one of the largest coworking floors in the city.',
    rules: COWORKING_RULES,
    minDays: 1,
    maxDays: 30,
  },
  {
    slug: 'copenhagen-vesterbro-meeting-room',
    name: 'Vesterbro Meeting Room',
    type: 'meeting-room',
    city: 'Copenhagen',
    address: 'Istedgade 45, 1650 Copenhagen',
    pricePerDay: 240,
    capacity: 10,
    amenities: ['wifi', 'projector', 'whiteboard', 'wheelchair-accessible'],
    rating: 4.6,
    images: photos('copenhagen-vesterbro-meeting-room', [
      'Meeting room with an oak table, a wall display and a sketched whiteboard wall',
      'High table with stools beside a brick feature wall and a garden door',
      'Round table with a laptop under a weekly planning whiteboard',
      'Large carpeted room with tables pushed together in the middle',
      'Rows of desks and chairs facing a whiteboard',
    ]),
    description:
      'A minimalist meeting room near Vesterbro station, designed for half-day workshops and stakeholder reviews.',
    rules: MEETING_ROOM_RULES,
    minDays: 1,
    maxDays: 2,
  },
  {
    slug: 'copenhagen-norrebro-design-studio',
    name: 'Nørrebro Design Studio',
    type: 'studio',
    city: 'Copenhagen',
    address: 'Jægersborggade 15, 2200 Copenhagen',
    pricePerDay: 220,
    capacity: 8,
    amenities: ['natural-light', 'kitchenette', 'wifi', 'parking'],
    rating: 4.7,
    images: photos('copenhagen-norrebro-design-studio', [
      'Plant-filled studio with a rug, wooden crates and a round window',
      'Designers at a long oval worktable in a bright atelier',
      'Thread racks, hanging plants and white work benches',
      'Corner desk with open shelving and a lamp',
      'Bright white room with an equipment cart in the middle',
    ]),
    description:
      'A daylight studio on a quiet Nørrebro street, frequently booked for design workshops and small shoots.',
    rules: STUDIO_RULES,
    minDays: 2,
    maxDays: 5,
  },
]

export function findVenueBySlug(slug: string): VenueDetail | undefined {
  return venues.find((item) => item.slug === slug)
}
