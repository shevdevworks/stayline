import { checkRangeLength, isChronological, isIsoDate, isPastDate, overlapsAnyRange } from '@/lib/date/isoDate'
import type { IsoDate } from '@/lib/date/types'
import { isValidGuestsCount, parseGuestsCount } from './guests'
import type { BookingConstraints, BookingParams } from './types'

function parseCandidateDate(raw: string | null, today: IsoDate): IsoDate | null {
  if (raw === null) return null
  if (!isIsoDate(raw)) return null
  if (isPastDate(raw, today)) return null
  return raw
}

// Single source of truth for "is this a bookable pair": order and inclusive
// day count both within range. Used on read (parseBookingParams) and on
// write (toSearchParams) so serializing can never produce a pair that a
// later parse would reject.
function isValidDateRange(checkIn: IsoDate, checkOut: IsoDate, constraints: BookingConstraints): boolean {
  if (!isChronological(checkIn, checkOut)) return false
  if (overlapsAnyRange({ start: checkIn, end: checkOut }, constraints.bookedRanges)) return false
  return checkRangeLength(checkIn, checkOut, constraints) === 'valid'
}

function parseGuests(raw: string | null, capacity: number): number | null {
  if (raw === null) return null
  const value = parseGuestsCount(raw)
  return value !== null && isValidGuestsCount(value, capacity) ? value : null
}

export function parseBookingParams(
  searchParams: URLSearchParams,
  constraints: BookingConstraints,
  today: IsoDate,
): BookingParams {
  const checkInCandidate = parseCandidateDate(searchParams.get('check-in'), today)
  const checkOutCandidate = parseCandidateDate(searchParams.get('check-out'), today)
  const guests = parseGuests(searchParams.get('guests'), constraints.capacity)

  if (checkInCandidate !== null && checkOutCandidate !== null) {
    if (!isValidDateRange(checkInCandidate, checkOutCandidate, constraints)) {
      return { checkIn: null, checkOut: null, guests }
    }

    return { checkIn: checkInCandidate, checkOut: checkOutCandidate, guests }
  }

  // Only one of the two survived (missing, malformed, past, or dropped by
  // the checks above) — the surviving date is kept as the start, regardless
  // of which URL param it came from.
  const single = checkInCandidate ?? checkOutCandidate
  return { checkIn: single, checkOut: null, guests }
}

// The invariant this enforces: nothing written here should ever come back
// rejected from parseBookingParams. A URL that already has an invalid pair
// or guest count from outside (a pasted link, a hand-edited address) is left
// alone elsewhere — this function only guards what this module itself writes.
export function toSearchParams(params: BookingParams, constraints: BookingConstraints): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (params.checkIn !== null && params.checkOut !== null) {
    if (isValidDateRange(params.checkIn, params.checkOut, constraints)) {
      searchParams.set('check-in', params.checkIn)
      searchParams.set('check-out', params.checkOut)
    }
  } else if (params.checkIn !== null) {
    // checkIn alone is written, but checkOut alone deliberately isn't:
    // parseBookingParams would read a lone check-out back as checkIn, not
    // checkOut, so writing one here would violate the invariant above
    // instead of upholding it.
    searchParams.set('check-in', params.checkIn)
  }

  if (params.guests !== null && isValidGuestsCount(params.guests, constraints.capacity)) {
    searchParams.set('guests', String(params.guests))
  }

  return searchParams
}
