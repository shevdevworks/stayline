import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { todayIso } from '@/lib/date/isoDate'
import { parseBookingParams, toSearchParams } from './bookingParams'
import type { BookingConstraints, BookingParams } from './types'
import type { IsoDate } from '@/lib/date/types'

export interface UseBookingParamsResult extends BookingParams {
  setDates: (dates: { checkIn: IsoDate | null; checkOut: IsoDate | null }) => void
  setGuests: (guests: number | null) => void
}

export function useBookingParams({
  minDays,
  maxDays,
  capacity,
  bookedRanges,
}: BookingConstraints): UseBookingParamsResult {
  const [searchParams, setSearchParams] = useSearchParams()

  // Same idiom as useBookingForm: computed once via an empty-deps useMemo,
  // since todayIso() depends on nothing that changes across renders.
  const today = useMemo(() => todayIso(), [])

  // useSearchParams returns a new URLSearchParams instance every render even
  // when the URL is unchanged, so memoize on its serialized form instead of
  // its identity to keep `booking` referentially stable across renders.
  const paramsKey = searchParams.toString()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const booking = useMemo(() => parseBookingParams(searchParams, { minDays, maxDays, capacity, bookedRanges }, today), [paramsKey, minDays, maxDays, capacity, bookedRanges, today])

  const setDates = useCallback(
    (dates: { checkIn: IsoDate | null; checkOut: IsoDate | null }) =>
      setSearchParams(
        (prev) => {
          const constraints: BookingConstraints = { minDays, maxDays, capacity, bookedRanges }
          return toSearchParams({ ...parseBookingParams(prev, constraints, today), ...dates }, constraints)
        },
        { replace: true },
      ),
    [setSearchParams, minDays, maxDays, capacity, bookedRanges, today],
  )

  const setGuests = useCallback(
    (guests: number | null) =>
      setSearchParams(
        (prev) => {
          const constraints: BookingConstraints = { minDays, maxDays, capacity, bookedRanges }
          return toSearchParams({ ...parseBookingParams(prev, constraints, today), guests }, constraints)
        },
        { replace: true },
      ),
    [setSearchParams, minDays, maxDays, capacity, bookedRanges, today],
  )

  return { ...booking, setDates, setGuests }
}
