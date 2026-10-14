import { rangeLengthDays } from '@/lib/date/isoDate'
import type { IsoDate } from '@/lib/date/types'

export interface BookingQuote {
  pricePerDay: number
  // Inclusive of both ends: 20–21 is two days (see rangeLengthDays).
  days: number
  total: number
}

// The one place a booking's price is computed. The venue panel, every form
// step, the summary card, the mock API and the success screen all call
// this, so the number can't drift between them. No fees or taxes: the demo
// only knows a daily rate.
export function quoteBooking(pricePerDay: number, checkIn: IsoDate, checkOut: IsoDate): BookingQuote {
  const days = rangeLengthDays(checkIn, checkOut)
  return { pricePerDay, days, total: pricePerDay * days }
}
