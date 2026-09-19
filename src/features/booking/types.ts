import type { DateRange, IsoDate } from '@/lib/date/types'

export interface BookingParams {
  checkIn: IsoDate | null
  checkOut: IsoDate | null
  guests: number | null
}

export interface BookingConstraints {
  minDays: number
  maxDays: number
  capacity: number
  bookedRanges: readonly DateRange[]
}

// Raw form input: every field is an optional string, including dates and
// guests. Untrusted until it passes through validation.ts.
export interface BookingDraft {
  checkIn?: string
  checkOut?: string
  guests?: string
  name?: string
  email?: string
  phone?: string
  comment?: string
  agreement?: boolean
}

// What goes to the API: every field required and typed. Only produced by
// toBookingRequest's success branch — never constructed from a BookingDraft
// directly.
export interface BookingRequest {
  checkIn: IsoDate
  checkOut: IsoDate
  guests: number
  name: string
  email: string
  phone: string
  comment?: string
  agreement: true
}

export interface BookingConfirmation {
  id: string
  request: BookingRequest
  total: number
  days: number
}

export interface BookingValidationConstraints extends BookingConstraints {
  today: IsoDate
}

export type BookingStep = 1 | 2 | 3

// The BookingDraft fields that can carry a validation error. comment is
// deliberately excluded — it has no error code and can never be the first
// invalid field.
export type BookingFieldName = 'checkIn' | 'checkOut' | 'guests' | 'name' | 'email' | 'phone' | 'agreement'

// Field order within each step matches the future step markup — 8.2 walks
// this to focus the first invalid field. Step order is governed only by
// BOOKING_STEP_ORDER; this object's own key order is never relied on.
// `as const satisfies` (rather than a plain Record<...> annotation) keeps
// each step's value narrowed to its literal tuple — a plain Record would
// widen every value to `readonly BookingFieldName[]`, which would hide from
// the exhaustiveness check below which specific fields are actually covered.
export const BOOKING_STEP_FIELDS = {
  1: ['checkIn', 'checkOut', 'guests'],
  2: ['name', 'email', 'phone'],
  3: ['agreement'],
} as const satisfies Record<BookingStep, readonly BookingFieldName[]>

type AssertNever<T extends never> = T

// Record<BookingStep, ...> only guarantees every step has a field list — it
// does not guarantee every BookingFieldName was actually placed under some
// step. UnassignedBookingFieldName computes the fields that were declared
// but never wired into a step; requiring it to be never means adding a
// field to BookingFieldName without adding it to BOOKING_STEP_FIELDS fails
// to compile here, instead of leaving firstErrorStep's "an error is
// guaranteed to exist" assumption silently false at runtime.
type UnassignedBookingFieldName = Exclude<BookingFieldName, (typeof BOOKING_STEP_FIELDS)[BookingStep][number]>
export type AssertBookingStepFieldsCoverAllFields = AssertNever<UnassignedBookingFieldName>

export const BOOKING_STEP_ORDER = [1, 2, 3] as const satisfies readonly BookingStep[]

// Every BookingStep must appear in BOOKING_STEP_ORDER — stepByOffset walks
// this array by index, so a step missing here is silently unreachable by
// next/back instead of failing to compile.
type StepMissingFromOrder = Exclude<BookingStep, (typeof BOOKING_STEP_ORDER)[number]>
export type AssertBookingStepOrderCoversAllSteps = AssertNever<StepMissingFromOrder>

// A duplicated step would silently occupy the slot a missing step should
// have had, without tripping the coverage check above.
type StepOrderHasDuplicate<T extends readonly unknown[]> = T extends readonly [infer Head, ...infer Rest]
  ? Head extends Rest[number]
    ? true
    : StepOrderHasDuplicate<Rest>
  : false
export type AssertBookingStepOrderHasNoDuplicates = AssertNever<
  StepOrderHasDuplicate<typeof BOOKING_STEP_ORDER> extends true ? BookingStep : never
>

export type BookingSubmissionErrorCode = 'network' | 'unavailable' | 'invalid'

// A discriminated union, not a flat status plus a separate confirmation
// field — useVenue's VenueState carries data/error/status as siblings, which
// lets code read confirmation before checking status is 'success'. Here
// confirmation only exists inside the 'success' branch, so that mistake
// can't compile.
export type BookingSubmission =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'error'; code: BookingSubmissionErrorCode }
  | { type: 'success'; confirmation: BookingConfirmation }
