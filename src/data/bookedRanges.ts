import { addDays } from '@/lib/date/isoDate'
import type { DateRange, IsoDate } from '@/lib/date/types'

export interface BookedRangeOffset {
  startOffset: number
  endOffset: number
}

export const BOOKED_RANGE_OFFSETS: Record<string, readonly BookedRangeOffset[]> = {
  'berlin-kreuzberg-loft': [{ startOffset: 3, endOffset: 5 }],
  'berlin-mitte-coworking': [
    { startOffset: 8, endOffset: 9 },
    { startOffset: 11, endOffset: 13 },
  ],
  'amsterdam-canal-meeting-room': [{ startOffset: 15, endOffset: 16 }],
}

export function getBookedRanges(slug: string, today: IsoDate): DateRange[] {
  const offsets = BOOKED_RANGE_OFFSETS[slug] ?? []
  return offsets.map((offset) => ({
    start: addDays(today, offset.startOffset),
    end: addDays(today, offset.endOffset),
  }))
}
