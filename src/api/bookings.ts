import { findVenueBySlug } from '@/data/venues'
import { getBookedRanges } from '@/data/bookedRanges'
import { quoteBooking } from '@/features/booking/pricing'
import type { BookingConfirmation, BookingRequest } from '@/features/booking/types'
import { requestToDraft, toBookingRequest } from '@/features/booking/validation'
import { todayIso } from '@/lib/date/isoDate'
import { BookingInvalidError, BookingUnavailableError, NotFoundError } from './errors'
import { simulateNetwork } from './delay'

// Mock endpoint. Nothing leaves the browser: there is no reservation, no
// payment and no email — the confirmation is generated locally.
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

  // Re-checks the whole request with the form's own rules, against
  // availability as it is now — a real server would never trust the client.
  const result = toBookingRequest(requestToDraft(request), {
    minDays: venue.minDays,
    maxDays: venue.maxDays,
    capacity: venue.capacity,
    bookedRanges: getBookedRanges(slug, todayIso()),
    today: todayIso(),
  })

  if (!result.ok) {
    if (result.errors.checkOut === 'unavailable') {
      throw new BookingUnavailableError(`Venue "${slug}" is not available for the selected dates`)
    }
    throw new BookingInvalidError(`Booking request for "${slug}" failed validation`)
  }

  const { days, total } = quoteBooking(venue.pricePerDay, result.request.checkIn, result.request.checkOut)

  return {
    id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    request: result.request,
    total,
    days,
  }
}
