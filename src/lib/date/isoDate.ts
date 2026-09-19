import type { DateRange, IsoDate } from './types'

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value: string): value is IsoDate {
  if (!ISO_DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  // Round-tripping through the local-midnight constructor and reading the
  // fields back catches both malformed input and dates that don't exist
  // (2026-02-30 rolls over to March 2, so the fields won't match).
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function toIso(date: Date): IsoDate {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromIso(iso: IsoDate): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayIso(): IsoDate {
  return toIso(new Date())
}

export function compareIso(a: IsoDate, b: IsoDate): number {
  // Fixed-width zero-padded ISO strings sort lexicographically the same as
  // chronologically — no Date construction needed.
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

// Single source of truth for "is this date before today". Callers supply
// today rather than calling todayIso() themselves, same reasoning as
// checkRangeLength's bounds argument.
export function isPastDate(date: IsoDate, today: IsoDate): boolean {
  return compareIso(date, today) < 0
}

// Single source of truth for "is end not before start". checkRangeLength's
// precondition assumes this already holds — call this first when order
// itself needs checking, not just length.
export function isChronological(start: IsoDate, end: IsoDate): boolean {
  return compareIso(end, start) >= 0
}

export function addDays(iso: IsoDate, amount: number): IsoDate {
  // Field arithmetic via the Date constructor, not millisecond math — the
  // only approach that survives a DST transition falling inside the range.
  const [year, month, day] = iso.split('-').map(Number)
  return toIso(new Date(year, month - 1, day + amount))
}

export function daysInMonth(year: number, month: number): number {
  // Passing the 1-based month into the constructor's 0-based slot targets
  // "next month"; day 0 rolls back to the last day of the target month.
  return new Date(year, month, 0).getDate()
}

export function addMonths(iso: IsoDate, amount: number): IsoDate {
  const [year, month, day] = iso.split('-').map(Number)
  const totalMonths = year * 12 + (month - 1) + amount
  const targetYear = Math.floor(totalMonths / 12)
  const targetMonth = (totalMonths % 12) + 1
  const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonth))
  return toIso(new Date(targetYear, targetMonth - 1, clampedDay))
}

export function diffInDays(a: IsoDate, b: IsoDate): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const msPerDay = 86_400_000

  // Date.UTC has no DST, so it's used here purely as a clock for the
  // subtraction — not for formatting/output, so this doesn't conflict with
  // the "no toISOString" rule (that rule is about display losing the day).
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / msPerDay)
}

// Inclusive day count of a range: start === end is a 1-day span, Aug 10 to
// Aug 12 is 3 days. The one place this arithmetic should happen — anything
// checking or displaying a range's length in days should call this instead
// of re-deriving diffInDays + 1 locally.
export function rangeLengthDays(start: IsoDate, end: IsoDate): number {
  return diffInDays(start, end) + 1
}

export function endOfMonth(iso: IsoDate): IsoDate {
  const [year, month] = iso.split('-').map(Number)
  return toIso(new Date(year, month - 1, daysInMonth(year, month)))
}

export function clampIso(iso: IsoDate, min: IsoDate | null, max: IsoDate | null): IsoDate {
  if (min !== null && compareIso(iso, min) < 0) return min
  if (max !== null && compareIso(iso, max) > 0) return max
  return iso
}

// Inclusive-both-ends overlap: 10-12 and 12-14 overlap (they share day 12).
// The one place this rule should be evaluated — anything checking whether
// two date ranges collide should call this instead of re-deriving it.
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return compareIso(a.start, b.end) <= 0 && compareIso(b.start, a.end) <= 0
}

export function overlapsAnyRange(range: DateRange, ranges: readonly DateRange[]): boolean {
  return ranges.some((other) => rangesOverlap(other, range))
}

export function isDateInRanges(date: IsoDate, ranges: readonly DateRange[]): boolean {
  return overlapsAnyRange({ start: date, end: date }, ranges)
}

// Precondition: start <= end — order and "in the past" are the caller's
// responsibility, this only checks the inclusive day count against the given
// bounds. The one place this comparison should happen — anywhere deciding
// whether a range's length is acceptable should call this instead of
// re-deriving it. If the precondition is violated, rangeLengthDays goes
// negative and lands below minDays, so 'too-short' comes back — but that's a
// side effect of the arithmetic, not a guarantee: don't call this to detect
// a reversed pair, check order first.
export function checkRangeLength(
  start: IsoDate,
  end: IsoDate,
  bounds: { minDays: number; maxDays: number | null },
): 'valid' | 'too-short' | 'too-long' {
  const days = rangeLengthDays(start, end)
  if (days < bounds.minDays) return 'too-short'
  if (bounds.maxDays !== null && days > bounds.maxDays) return 'too-long'
  return 'valid'
}
