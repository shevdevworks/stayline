import { findVenueBySlug } from '@/data/venues'
import { getBookedRanges } from '@/data/bookedRanges'
import { rangeLengthDays, rangesOverlap, todayIso } from '@/lib/date/isoDate'
import type { BookingConfirmation, BookingRequest } from '@/features/booking/types'
import { BookingUnavailableError, NotFoundError } from './errors'
import { simulateNetwork } from './delay'

export async function submitBooking(
  slug: string,
  request: BookingRequest,
  signal?: AbortSignal,
): Promise<BookingConfirmation> {
  await simulateNetwork(signal)

  const venue = findVenueBySlug(slug)
  if (!venue) {
    throw new NotFoundError(`Venue with slug "${slug}" not found`)
  }

  const requestedRange = { start: request.checkIn, end: request.checkOut }
  const bookedRanges = getBookedRanges(slug, todayIso())
  if (bookedRanges.some((range) => rangesOverlap(range, requestedRange))) {
    throw new BookingUnavailableError(`Venue "${slug}" is not available for the selected dates`)
  }

  const days = rangeLengthDays(request.checkIn, request.checkOut)

  return {
    id: `BK-${crypto.randomUUID().slice(0, 8)}`,
    request,
    total: days * venue.pricePerDay,
    days,
  }
}
