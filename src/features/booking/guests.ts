// Single source of truth for "is this a bookable guest count", same reasoning
// as bookingParams.ts's isValidDateRange: used on read, on write, and by
// PricePanel to flag an out-of-range value in the UI without a second copy
// of this rule.
export function isValidGuestsCount(value: number, capacity: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= capacity
}

// Number() also accepts hex (0x4), exponential (2e1), and a leading sign,
// so a decimal-only regex must gate it — otherwise "0x4" parses as a
// plausible integer. Capacity is not this function's concern: check the
// result against isValidGuestsCount separately.
export function parseGuestsCount(raw: string): number | null {
  if (!/^[0-9]+$/.test(raw)) return null
  return Number(raw)
}
