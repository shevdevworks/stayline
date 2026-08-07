import type { VenueDetail } from '@/types'

import berlinKreuzbergLoft1 from '@/assets/venues/berlin-kreuzberg-loft/1.webp'
import berlinKreuzbergLoft2 from '@/assets/venues/berlin-kreuzberg-loft/2.webp'
import berlinKreuzbergLoft3 from '@/assets/venues/berlin-kreuzberg-loft/3.webp'
import berlinKreuzbergLoft4 from '@/assets/venues/berlin-kreuzberg-loft/4.webp'
import berlinKreuzbergLoft5 from '@/assets/venues/berlin-kreuzberg-loft/5.webp'
import berlinMitteCoworking1 from '@/assets/venues/berlin-mitte-coworking/1.webp'
import berlinMitteCoworking2 from '@/assets/venues/berlin-mitte-coworking/2.webp'
import berlinMitteCoworking3 from '@/assets/venues/berlin-mitte-coworking/3.webp'
import berlinMitteCoworking4 from '@/assets/venues/berlin-mitte-coworking/4.webp'
import berlinMitteCoworking5 from '@/assets/venues/berlin-mitte-coworking/5.webp'
import amsterdamCanalMeetingRoom1 from '@/assets/venues/amsterdam-canal-meeting-room/1.webp'
import amsterdamCanalMeetingRoom2 from '@/assets/venues/amsterdam-canal-meeting-room/2.webp'
import amsterdamCanalMeetingRoom3 from '@/assets/venues/amsterdam-canal-meeting-room/3.webp'
import amsterdamCanalMeetingRoom4 from '@/assets/venues/amsterdam-canal-meeting-room/4.webp'
import amsterdamCanalMeetingRoom5 from '@/assets/venues/amsterdam-canal-meeting-room/5.webp'
import amsterdamJordaanPhotoStudio1 from '@/assets/venues/amsterdam-jordaan-photo-studio/1.webp'
import amsterdamJordaanPhotoStudio2 from '@/assets/venues/amsterdam-jordaan-photo-studio/2.webp'
import amsterdamJordaanPhotoStudio3 from '@/assets/venues/amsterdam-jordaan-photo-studio/3.webp'
import amsterdamJordaanPhotoStudio4 from '@/assets/venues/amsterdam-jordaan-photo-studio/4.webp'
import amsterdamJordaanPhotoStudio5 from '@/assets/venues/amsterdam-jordaan-photo-studio/5.webp'
import lisbonAlfamaCreativeSpace1 from '@/assets/venues/lisbon-alfama-creative-space/1.webp'
import lisbonAlfamaCreativeSpace2 from '@/assets/venues/lisbon-alfama-creative-space/2.webp'
import lisbonAlfamaCreativeSpace3 from '@/assets/venues/lisbon-alfama-creative-space/3.webp'
import lisbonAlfamaCreativeSpace4 from '@/assets/venues/lisbon-alfama-creative-space/4.webp'
import lisbonAlfamaCreativeSpace5 from '@/assets/venues/lisbon-alfama-creative-space/5.webp'
import lisbonBaixaRehearsalStudio1 from '@/assets/venues/lisbon-baixa-rehearsal-studio/1.webp'
import lisbonBaixaRehearsalStudio2 from '@/assets/venues/lisbon-baixa-rehearsal-studio/2.webp'
import lisbonBaixaRehearsalStudio3 from '@/assets/venues/lisbon-baixa-rehearsal-studio/3.webp'
import lisbonBaixaRehearsalStudio4 from '@/assets/venues/lisbon-baixa-rehearsal-studio/4.webp'
import lisbonBaixaRehearsalStudio5 from '@/assets/venues/lisbon-baixa-rehearsal-studio/5.webp'
import warsawPragaIndustrialStudio1 from '@/assets/venues/warsaw-praga-industrial-studio/1.webp'
import warsawPragaIndustrialStudio2 from '@/assets/venues/warsaw-praga-industrial-studio/2.webp'
import warsawPragaIndustrialStudio3 from '@/assets/venues/warsaw-praga-industrial-studio/3.webp'
import warsawPragaIndustrialStudio4 from '@/assets/venues/warsaw-praga-industrial-studio/4.webp'
import warsawPragaIndustrialStudio5 from '@/assets/venues/warsaw-praga-industrial-studio/5.webp'
import warsawMokotowBusinessLounge1 from '@/assets/venues/warsaw-mokotow-business-lounge/1.webp'
import warsawMokotowBusinessLounge2 from '@/assets/venues/warsaw-mokotow-business-lounge/2.webp'
import warsawMokotowBusinessLounge3 from '@/assets/venues/warsaw-mokotow-business-lounge/3.webp'
import warsawMokotowBusinessLounge4 from '@/assets/venues/warsaw-mokotow-business-lounge/4.webp'
import warsawMokotowBusinessLounge5 from '@/assets/venues/warsaw-mokotow-business-lounge/5.webp'
import barcelonaGraciaPodcastStudio1 from '@/assets/venues/barcelona-gracia-podcast-studio/1.webp'
import barcelonaGraciaPodcastStudio2 from '@/assets/venues/barcelona-gracia-podcast-studio/2.webp'
import barcelonaGraciaPodcastStudio3 from '@/assets/venues/barcelona-gracia-podcast-studio/3.webp'
import barcelonaGraciaPodcastStudio4 from '@/assets/venues/barcelona-gracia-podcast-studio/4.webp'
import barcelonaGraciaPodcastStudio5 from '@/assets/venues/barcelona-gracia-podcast-studio/5.webp'
import barcelonaEixampleCoworkingLoft1 from '@/assets/venues/barcelona-eixample-coworking-loft/1.webp'
import barcelonaEixampleCoworkingLoft2 from '@/assets/venues/barcelona-eixample-coworking-loft/2.webp'
import barcelonaEixampleCoworkingLoft3 from '@/assets/venues/barcelona-eixample-coworking-loft/3.webp'
import barcelonaEixampleCoworkingLoft4 from '@/assets/venues/barcelona-eixample-coworking-loft/4.webp'
import barcelonaEixampleCoworkingLoft5 from '@/assets/venues/barcelona-eixample-coworking-loft/5.webp'
import copenhagenVesterbroMeetingRoom1 from '@/assets/venues/copenhagen-vesterbro-meeting-room/1.webp'
import copenhagenVesterbroMeetingRoom2 from '@/assets/venues/copenhagen-vesterbro-meeting-room/2.webp'
import copenhagenVesterbroMeetingRoom3 from '@/assets/venues/copenhagen-vesterbro-meeting-room/3.webp'
import copenhagenVesterbroMeetingRoom4 from '@/assets/venues/copenhagen-vesterbro-meeting-room/4.webp'
import copenhagenVesterbroMeetingRoom5 from '@/assets/venues/copenhagen-vesterbro-meeting-room/5.webp'
import copenhagenNorrebroDesignStudio1 from '@/assets/venues/copenhagen-norrebro-design-studio/1.webp'
import copenhagenNorrebroDesignStudio2 from '@/assets/venues/copenhagen-norrebro-design-studio/2.webp'
import copenhagenNorrebroDesignStudio3 from '@/assets/venues/copenhagen-norrebro-design-studio/3.webp'
import copenhagenNorrebroDesignStudio4 from '@/assets/venues/copenhagen-norrebro-design-studio/4.webp'
import copenhagenNorrebroDesignStudio5 from '@/assets/venues/copenhagen-norrebro-design-studio/5.webp'

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
    images: [
      {
        src: berlinKreuzbergLoft1,
        alt: 'Open studio floor with a structural column, stools and a kitchen counter along the back wall',
      },
      {
        src: berlinKreuzbergLoft2,
        alt: 'White brick walls, a long table and a large potted plant in the main shooting area',
      },
      {
        src: berlinKreuzbergLoft3,
        alt: 'A photographer working with a subject on set under studio lighting',
      },
      {
        src: berlinKreuzbergLoft4,
        alt: 'Exposed brick and ceiling cabling in the unfinished corner of the loft',
      },
      {
        src: berlinKreuzbergLoft5,
        alt: 'A camera operator filming under pendant lamps in the furnished corner of the studio',
      },
    ],
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
    images: [
      {
        src: berlinMitteCoworking1,
        alt: 'Open-plan floor with rows of desks under industrial ceiling beams',
      },
      {
        src: berlinMitteCoworking2,
        alt: 'Members working side by side on laptops at a shared table',
      },
      {
        src: berlinMitteCoworking3,
        alt: 'A wide, well-lit work area with laptops on long shared desks',
      },
      {
        src: berlinMitteCoworking4,
        alt: 'Empty desks and chairs along the window wall',
      },
      {
        src: berlinMitteCoworking5,
        alt: 'Lounge seating at the edge of the open-plan floor',
      },
    ],
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
    images: [
      {
        src: amsterdamCanalMeetingRoom1,
        alt: 'Empty boardroom with dark chairs around a long table and a ceiling projector',
      },
      {
        src: amsterdamCanalMeetingRoom2,
        alt: 'Glass-walled meeting room with a long table and office chairs',
      },
      {
        src: amsterdamCanalMeetingRoom3,
        alt: 'Conference table fitted with microphones and a wall display',
      },
      {
        src: amsterdamCanalMeetingRoom4,
        alt: 'Meeting room with designer chairs and tall windows along one side',
      },
      {
        src: amsterdamCanalMeetingRoom5,
        alt: 'A small group meeting at the boardroom table',
      },
    ],
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
    images: [
      {
        src: amsterdamJordaanPhotoStudio1,
        alt: 'Studio floor with lighting equipment and rolls of backdrop paper',
      },
      {
        src: amsterdamJordaanPhotoStudio2,
        alt: 'A photographer adjusting a light stand next to a tripod',
      },
      {
        src: amsterdamJordaanPhotoStudio3,
        alt: 'Empty white shooting area with bare walls',
      },
      {
        src: amsterdamJordaanPhotoStudio4,
        alt: 'Angled ceiling and wooden floor in the main shooting space',
      },
      {
        src: amsterdamJordaanPhotoStudio5,
        alt: 'Lighting gear set up beside a window with daylight coming in',
      },
    ],
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
    images: [
      {
        src: lisbonAlfamaCreativeSpace4,
        alt: 'Bright work area with white walls and minimal furniture',
      },
      {
        src: lisbonAlfamaCreativeSpace2,
        alt: 'A member working on a laptop at a desk against the wall',
      },
      {
        src: lisbonAlfamaCreativeSpace3,
        alt: 'Shared tables and lounge chairs in the main room',
      },
      {
        src: lisbonAlfamaCreativeSpace5,
        alt: 'Members at individual desks across the open floor',
      },
      {
        src: lisbonAlfamaCreativeSpace1,
        alt: 'Open coworking floor with desks under high ceilings',
      },
    ],
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
    images: [
      {
        src: lisbonBaixaRehearsalStudio1,
        alt: 'Drum kit and amplifiers set up on the rehearsal stage',
      },
      {
        src: lisbonBaixaRehearsalStudio2,
        alt: 'Wooden chairs, an upright piano and a music stand in the smaller room',
      },
      {
        src: lisbonBaixaRehearsalStudio3,
        alt: 'A musician rehearsing with a guitar in the corner of the room',
      },
      {
        src: lisbonBaixaRehearsalStudio4,
        alt: 'A bass guitar leaning against stacked amplifiers',
      },
      {
        src: lisbonBaixaRehearsalStudio5,
        alt: 'An electric guitar on a stand beside loudspeakers on stage',
      },
    ],
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
    images: [
      {
        src: warsawPragaIndustrialStudio1,
        alt: 'Warehouse interior with exposed brick walls and a bare concrete floor',
      },
      {
        src: warsawPragaIndustrialStudio2,
        alt: 'Graffiti covering the wall along one side of the hall',
      },
      {
        src: warsawPragaIndustrialStudio3,
        alt: 'Wide hall with peeling paint and daylight from high windows',
      },
      {
        src: warsawPragaIndustrialStudio4,
        alt: 'Steel roof framework above the open warehouse floor',
      },
      {
        src: warsawPragaIndustrialStudio5,
        alt: 'Sunlight falling across the empty floor from a tall window',
      },
    ],
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
    images: [
      {
        src: warsawMokotowBusinessLounge1,
        alt: 'Boardroom with a wooden table and matching chairs',
      },
      {
        src: warsawMokotowBusinessLounge2,
        alt: 'Long white desk with upholstered chairs on a carpeted floor',
      },
      {
        src: warsawMokotowBusinessLounge3,
        alt: 'Desks and chairs arranged in front of a large window',
      },
      {
        src: warsawMokotowBusinessLounge4,
        alt: 'Rows of white chairs set up for a presentation',
      },
      {
        src: warsawMokotowBusinessLounge5,
        alt: 'Armchairs around a table with plants along the far wall',
      },
    ],
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
    images: [
      {
        src: barcelonaGraciaPodcastStudio1,
        alt: 'Recording room with a mixing console and wood-panelled walls',
      },
      {
        src: barcelonaGraciaPodcastStudio2,
        alt: 'Studio desk with audio equipment under low lighting',
      },
      {
        src: barcelonaGraciaPodcastStudio3,
        alt: 'Mixing console in use during a recording session',
      },
      {
        src: barcelonaGraciaPodcastStudio4,
        alt: 'Upright piano in the treated live room',
      },
      {
        src: barcelonaGraciaPodcastStudio5,
        alt: 'Vintage speakers and a reel-to-reel player against the wall',
      },
    ],
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
    images: [
      {
        src: barcelonaEixampleCoworkingLoft1,
        alt: 'Loft meeting area with exposed wooden beams and daylight',
      },
      {
        src: barcelonaEixampleCoworkingLoft2,
        alt: 'Empty loft floor with light coming through a tall window',
      },
      {
        src: barcelonaEixampleCoworkingLoft3,
        alt: 'Brick walls and long tables in the busy common area',
      },
      {
        src: barcelonaEixampleCoworkingLoft4,
        alt: 'Attic space with skylights and a brick pillar',
      },
      {
        src: barcelonaEixampleCoworkingLoft5,
        alt: 'Seating area beside a large curtained window',
      },
    ],
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
    images: [
      {
        src: copenhagenVesterbroMeetingRoom1,
        alt: 'Meeting room with a large table, a wall display and a whiteboard',
      },
      {
        src: copenhagenVesterbroMeetingRoom2,
        alt: 'Minimalist room with tables and chairs arranged in a loose grid',
      },
      {
        src: copenhagenVesterbroMeetingRoom3,
        alt: 'Compact meeting room with a wall-mounted screen',
      },
      {
        src: copenhagenVesterbroMeetingRoom4,
        alt: 'Conference table with a laptop and a planning board on the wall',
      },
      {
        src: copenhagenVesterbroMeetingRoom5,
        alt: 'Rows of desks and chairs facing a whiteboard',
      },
    ],
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
    images: [
      {
        src: copenhagenNorrebroDesignStudio1,
        alt: 'Work tables with sewing machines and paper patterns',
      },
      {
        src: copenhagenNorrebroDesignStudio2,
        alt: 'Corner desk with open shelving and a lamp',
      },
      {
        src: copenhagenNorrebroDesignStudio3,
        alt: 'Wooden furniture and rugs beside a curtained window',
      },
      {
        src: copenhagenNorrebroDesignStudio4,
        alt: 'Thread racks and hanging plants above the work benches',
      },
      {
        src: copenhagenNorrebroDesignStudio5,
        alt: 'Bright white room with an equipment cart in the middle',
      },
    ],
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
