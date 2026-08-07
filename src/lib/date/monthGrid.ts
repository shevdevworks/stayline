import { toIso } from './isoDate'
import type { GetMonthGridParams, MonthGridDay } from './types'

const DAYS_PER_WEEK = 7
const WEEKS_IN_GRID = 6

export function getMonthGrid({ year, month, weekStartsOn }: GetMonthGridParams): MonthGridDay[][] {
  const firstOfMonth = new Date(year, month - 1, 1)
  const firstWeekday = firstOfMonth.getDay()
  // Both terms are in [0,6], so the difference is in [-6,6]; +7 before %7
  // keeps the result in [0,6] instead of JS's negative-modulo result.
  const leadingDays = (firstWeekday - weekStartsOn + 7) % 7
  const gridStart = new Date(year, month - 1, 1 - leadingDays)

  const days: MonthGridDay[] = []
  for (let i = 0; i < WEEKS_IN_GRID * DAYS_PER_WEEK; i++) {
    const current = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    days.push({
      iso: toIso(current),
      isOutsideMonth: current.getMonth() !== month - 1 || current.getFullYear() !== year,
    })
  }

  const weeks: MonthGridDay[][] = []
  for (let week = 0; week < WEEKS_IN_GRID; week++) {
    weeks.push(days.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK))
  }
  return weeks
}
