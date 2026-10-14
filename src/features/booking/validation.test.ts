import { describe, expect, it } from 'vitest'
import type { BookingDraft, BookingValidationConstraints } from './types'
import { isValidEmailFormat, toBookingRequest, validateStep } from './validation'

const constraints: BookingValidationConstraints = {
  today: '2026-12-30',
  minDays: 1,
  maxDays: 7,
  capacity: 12,
  bookedRanges: [{ start: '2027-01-04', end: '2027-01-05' }],
}

const validDraft: BookingDraft = {
  checkIn: '2026-12-31',
  checkOut: '2027-01-02',
  guests: '4',
  name: 'Anna Kovalenko',
  email: 'anna@example.com',
  phone: '+31 20 123 4567',
  agreement: true,
}

describe('email format', () => {
  it.each(['a@.', 'a@', '@example.com', 'a@b', 'a@@example.com', 'a b@example.com', 'a@example.', 'a@.com', 'a@example..com', 'a@-example.com', '.a@example.com'])(
    'rejects %s',
    (email) => {
      expect(isValidEmailFormat(email)).toBe(false)
    },
  )

  it.each(['anna@example.com', 'name+tag@example.com', 'first.last@sub.example.co.uk', 'o’neil@example.ie', 'user@münchen.de'])(
    'accepts %s',
    (email) => {
      expect(isValidEmailFormat(email)).toBe(true)
    },
  )

  it('blocks the contacts step on "a@." with an email error only', () => {
    expect(validateStep(2, { ...validDraft, email: 'a@.' }, constraints)).toEqual({ email: 'invalid-format' })
    expect(validateStep(2, { ...validDraft, email: 'name+tag@example.com' }, constraints)).toEqual({})
  })
})

describe('dates', () => {
  it('rejects a check-in before today', () => {
    expect(validateStep(1, { ...validDraft, checkIn: '2026-12-29' }, constraints).checkIn).toBe('in-past')
  })

  it('accepts today as check-in', () => {
    expect(validateStep(1, { ...validDraft, checkIn: '2026-12-30' }, constraints)).toEqual({})
  })

  it('rejects a range that starts or ends on a booked date', () => {
    expect(validateStep(1, { ...validDraft, checkIn: '2027-01-05', checkOut: '2027-01-06' }, constraints).checkOut).toBe(
      'unavailable',
    )
  })

  it('rejects a range that crosses booked dates in the middle', () => {
    expect(validateStep(1, { ...validDraft, checkIn: '2027-01-03', checkOut: '2027-01-06' }, constraints).checkOut).toBe(
      'unavailable',
    )
  })

  it('enforces the stay length with both ends counted', () => {
    const week = { ...validDraft, checkIn: '2027-01-06', checkOut: '2027-01-12' } // 7 days
    expect(validateStep(1, week, constraints)).toEqual({})
    expect(validateStep(1, { ...week, checkOut: '2027-01-13' }, constraints).checkOut).toBe('too-long')
  })

  it('rejects a check-out before check-in and impossible dates', () => {
    expect(validateStep(1, { ...validDraft, checkOut: '2026-12-29' }, constraints).checkOut).toBe('in-past')
    expect(validateStep(1, { ...validDraft, checkIn: '2027-01-02', checkOut: '2027-01-01' }, constraints).checkOut).toBe(
      'before-check-in',
    )
    expect(validateStep(1, { ...validDraft, checkIn: '2027-02-30' }, constraints).checkIn).toBe('invalid-format')
  })
})

describe('guests', () => {
  it('accepts 1 up to the capacity and nothing outside it', () => {
    expect(validateStep(1, { ...validDraft, guests: '12' }, constraints)).toEqual({})
    expect(validateStep(1, { ...validDraft, guests: '13' }, constraints).guests).toBe('invalid')
    expect(validateStep(1, { ...validDraft, guests: '0' }, constraints).guests).toBe('invalid')
    expect(validateStep(1, { ...validDraft, guests: '2.5' }, constraints).guests).toBe('invalid')
    expect(validateStep(1, { ...validDraft, guests: '' }, constraints).guests).toBe('required')
  })
})

describe('final check of the whole request', () => {
  it('builds a typed request from a valid draft', () => {
    const result = toBookingRequest({ ...validDraft, comment: '  ' }, constraints)
    expect(result).toEqual({
      ok: true,
      request: { ...validDraft, guests: 4, comment: undefined, agreement: true },
    })
  })

  it('points at the earliest step with a problem', () => {
    const result = toBookingRequest({ ...validDraft, email: 'a@.', agreement: false }, constraints)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.firstErrorStep).toBe(2)
      expect(result.errors).toEqual({ email: 'invalid-format', agreement: 'not-checked' })
    }
  })
})
