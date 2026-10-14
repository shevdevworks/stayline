import { describe, expect, it } from 'vitest'
import { addDays, isDateInRanges, overlapsAnyRange, rangeLengthDays } from './isoDate'

describe('rangeLengthDays (both ends count)', () => {
  it('counts 20–21 as two days and a same-day booking as one', () => {
    expect(rangeLengthDays('2026-10-20', '2026-10-21')).toBe(2)
    expect(rangeLengthDays('2026-10-20', '2026-10-20')).toBe(1)
  })

  it('crosses month and year ends', () => {
    expect(rangeLengthDays('2026-10-31', '2026-11-01')).toBe(2)
    expect(rangeLengthDays('2026-12-31', '2027-01-01')).toBe(2)
    expect(rangeLengthDays('2026-12-30', '2027-01-02')).toBe(4)
  })

  it('handles February in common and leap years', () => {
    expect(rangeLengthDays('2027-02-28', '2027-03-01')).toBe(2)
    expect(rangeLengthDays('2028-02-28', '2028-03-01')).toBe(3)
  })

  // The test environment runs in Europe/Kyiv (see vite.config.ts), where
  // clocks change on these dates; calendar-day maths must not notice.
  it('is unaffected by daylight-saving changes', () => {
    // Guards the guard: the offsets differ only if the TZ setting took hold.
    expect(new Date(2026, 2, 28).getTimezoneOffset()).not.toBe(new Date(2026, 2, 30).getTimezoneOffset())
    expect(rangeLengthDays('2026-03-28', '2026-03-30')).toBe(3)
    expect(rangeLengthDays('2026-10-24', '2026-10-26')).toBe(3)
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
  })
})

describe('booked ranges', () => {
  const booked = [{ start: '2026-10-17', end: '2026-10-19' }]

  it('treats both ends of a booked range as taken', () => {
    expect(isDateInRanges('2026-10-17', booked)).toBe(true)
    expect(isDateInRanges('2026-10-19', booked)).toBe(true)
    expect(isDateInRanges('2026-10-20', booked)).toBe(false)
  })

  it('rejects a stay that spans a booked range without touching its ends', () => {
    expect(overlapsAnyRange({ start: '2026-10-15', end: '2026-10-22' }, booked)).toBe(true)
    expect(overlapsAnyRange({ start: '2026-10-20', end: '2026-10-22' }, booked)).toBe(false)
  })
})
