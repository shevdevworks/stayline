import { fromIso } from './isoDate'
import type { IsoDate, WeekStartsOn } from './types'

// A known Sunday, used only as a stable anchor for reading weekday names
// back out of Intl — never surfaced to users.
const REFERENCE_SUNDAY = new Date(2026, 0, 4)

export function formatDateLabel(iso: IsoDate, locale = 'en-GB'): string {
  const date = fromIso(iso)
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatShortDateLabel(iso: IsoDate, locale = 'en-GB'): string {
  const date = fromIso(iso)
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date)
}

export function formatMonthLabel(year: number, month: number, locale = 'en-GB'): string {
  const date = new Date(year, month - 1, 1)
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
}

export function getWeekdayLabels(weekStartsOn: WeekStartsOn, locale = 'en-GB'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const labels: string[] = []

  for (let i = 0; i < 7; i++) {
    const dayOffset = (weekStartsOn + i) % 7
    const date = new Date(
      REFERENCE_SUNDAY.getFullYear(),
      REFERENCE_SUNDAY.getMonth(),
      REFERENCE_SUNDAY.getDate() + dayOffset,
    )
    labels.push(formatter.format(date))
  }

  return labels
}
