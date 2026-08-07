import type { IsoDate } from '@/lib/date/types'
import type { BookingParams } from './types'
import type { BookingFieldResults } from './validation'

export function resultsToBookingParams(results: BookingFieldResults): BookingParams {
  const { checkIn, checkOut, guests } = results

  // Dates are written only as a validated pair — if either failed to parse,
  // neither is a range the person actually selected.
  let checkInValue: IsoDate | null = null
  let checkOutValue: IsoDate | null = null
  if (checkIn.ok && checkOut.ok) {
    checkInValue = checkIn.value
    checkOutValue = checkOut.value
  }

  return {
    checkIn: checkInValue,
    checkOut: checkOutValue,
    guests: guests.ok ? guests.value : null,
  }
}

// Every BookingParams field is a nullable primitive, so per-field === is a
// complete equality check.
export function bookingParamsEqual(a: BookingParams, b: BookingParams): boolean {
  return a.checkIn === b.checkIn && a.checkOut === b.checkOut && a.guests === b.guests
}
