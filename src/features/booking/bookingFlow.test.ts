import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitBooking } from '@/api/bookings'
import { findVenueBySlug } from '@/data/venues'
import { getBookedRanges } from '@/data/bookedRanges'
import { bookingFormReducer, createInitialFormState, type BookingFormAction, type BookingFormState } from './formState'
import { quoteBooking } from './pricing'
import { createSubmissionGuard } from './submissionGuard'
import type { BookingConfirmation, BookingValidationConstraints } from './types'
import { toBookingRequest } from './validation'

// "Today" is pinned so availability and past-date checks never depend on
// when the suite runs. Kreuzberg Loft is booked from today+3 to today+5.
const TODAY = '2026-10-14'
const SLUG = 'berlin-kreuzberg-loft'
const venue = findVenueBySlug(SLUG)!

const constraints: BookingValidationConstraints = {
  minDays: venue.minDays,
  maxDays: venue.maxDays,
  capacity: venue.capacity,
  bookedRanges: getBookedRanges(SLUG, TODAY),
  today: TODAY,
}

function run(state: BookingFormState, ...actions: BookingFormAction[]): BookingFormState {
  return actions.reduce(bookingFormReducer, state)
}

function filledToReview(): BookingFormState {
  return run(
    createInitialFormState({ checkIn: '2026-10-20', checkOut: '2026-10-21', guests: '4' }),
    { type: 'next', constraints },
    { type: 'setField', field: 'name', value: 'Anna Kovalenko' },
    { type: 'setField', field: 'email', value: 'name+tag@example.com' },
    { type: 'setField', field: 'phone', value: '+31 20 123 4567' },
    { type: 'setField', field: 'comment', value: 'Arriving at 9.' },
    { type: 'next', constraints },
  )
}

beforeEach(() => {
  vi.useFakeTimers({ now: new Date(2026, 9, 14, 12, 0) })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('moving between steps', () => {
  it('keeps every entered value when going back and forward again', () => {
    const review = filledToReview()
    expect(review.step).toBe(3)

    const backTwice = run(review, { type: 'back' }, { type: 'back' })
    expect(backTwice.step).toBe(1)
    expect(backTwice.draft).toEqual(review.draft)

    const forwardAgain = run(backTwice, { type: 'next', constraints }, { type: 'next', constraints })
    expect(forwardAgain.step).toBe(3)
    expect(forwardAgain.draft).toEqual(review.draft)
  })

  it('lets Edit jump back but never skip ahead', () => {
    const review = filledToReview()
    expect(run(review, { type: 'goToStep', step: 1 }).step).toBe(1)
    const atStepOne = run(review, { type: 'goToStep', step: 1 })
    expect(run(atStepOne, { type: 'goToStep', step: 3 }).step).toBe(1)
  })

  it('stays on the contacts step while the email is invalid', () => {
    const state = run(
      createInitialFormState({ checkIn: '2026-10-20', checkOut: '2026-10-21', guests: '4' }),
      { type: 'next', constraints },
      { type: 'setField', field: 'name', value: 'Anna' },
      { type: 'setField', field: 'email', value: 'a@.' },
      { type: 'setField', field: 'phone', value: '+31 20 123 4567' },
      { type: 'next', constraints },
    )
    expect(state.step).toBe(2)
    expect(state.touched.email).toBe(true)
  })
})

describe('price', () => {
  it('is the same on the venue panel, in the form and on the confirmation', async () => {
    const review = run(filledToReview(), { type: 'setField', field: 'agreement', value: true })
    const result = toBookingRequest(review.draft, constraints)
    if (!result.ok) throw new Error('expected a valid request')

    // Venue panel, review step and summary card all call quoteBooking.
    const shown = quoteBooking(venue.pricePerDay, '2026-10-20', '2026-10-21')
    expect(shown).toEqual({ pricePerDay: 280, days: 2, total: 560 })

    const pending = submitBooking(SLUG, result.request)
    await vi.advanceTimersByTimeAsync(1000)
    const confirmation = await pending
    expect(confirmation.total).toBe(shown.total)
    expect(confirmation.days).toBe(shown.days)
  })
})

describe('full demo booking', () => {
  it('goes from dates to a confirmation, and a second click sends nothing', async () => {
    let state = run(filledToReview(), { type: 'setField', field: 'agreement', value: true })
    const result = toBookingRequest(state.draft, constraints)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const api = vi.fn((request: typeof result.request) => submitBooking(SLUG, request))
    const guard = createSubmissionGuard()
    const dispatch = (action: BookingFormAction) => {
      state = bookingFormReducer(state, action)
    }

    const send = () =>
      guard.run(async () => {
        dispatch({ type: 'submitStarted' })
        const confirmation: BookingConfirmation = await api(result.request)
        dispatch({ type: 'submitSucceeded', confirmation })
      })

    const first = send()
    const second = send() // same tick as the first click
    expect(first).not.toBeNull()
    expect(second).toBeNull()
    expect(state.submission.type).toBe('submitting')

    await vi.advanceTimersByTimeAsync(1000)
    await first

    expect(api).toHaveBeenCalledTimes(1)
    expect(state.submission.type).toBe('success')
    if (state.submission.type === 'success') {
      expect(state.submission.confirmation.request.email).toBe('name+tag@example.com')
      expect(state.submission.confirmation.id).toMatch(/^DEMO-/)
    }

    // Once confirmed, the form is frozen: nothing can change or resend it.
    const frozen = run(state, { type: 'setField', field: 'name', value: 'Someone else' }, { type: 'submitStarted' })
    expect(frozen).toBe(state)
  })

  it('is rejected by the mock API when the dates were taken meanwhile', async () => {
    const pending = submitBooking(SLUG, {
      checkIn: '2026-10-16',
      checkOut: '2026-10-18',
      guests: 2,
      name: 'Anna',
      email: 'anna@example.com',
      phone: '+31 20 123 4567',
      agreement: true,
    })
    const assertion = expect(pending).rejects.toMatchObject({ name: 'BookingUnavailableError' })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })

  it('is rejected by the mock API when guests exceed capacity', async () => {
    const pending = submitBooking(SLUG, {
      checkIn: '2026-10-20',
      checkOut: '2026-10-21',
      guests: venue.capacity + 1,
      name: 'Anna',
      email: 'anna@example.com',
      phone: '+31 20 123 4567',
      agreement: true,
    })
    const assertion = expect(pending).rejects.toMatchObject({ name: 'BookingInvalidError' })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })
})
