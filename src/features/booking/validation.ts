import { checkRangeLength, isChronological, isIsoDate, isPastDate, overlapsAnyRange } from '@/lib/date/isoDate'
import type { IsoDate } from '@/lib/date/types'
import { isValidGuestsCount, parseGuestsCount } from './guests'
import { BOOKING_STEP_FIELDS, BOOKING_STEP_ORDER } from './types'
import type { BookingDraft, BookingFieldName, BookingRequest, BookingStep, BookingValidationConstraints } from './types'

export type CheckInErrorCode = 'required' | 'invalid-format' | 'in-past'
export type CheckOutErrorCode =
  | 'required'
  | 'invalid-format'
  | 'in-past'
  | 'before-check-in'
  | 'unavailable'
  | 'too-short'
  | 'too-long'
export type GuestsErrorCode = 'required' | 'invalid'
export type NameErrorCode = 'required'
export type EmailErrorCode = 'required' | 'invalid-format'
export type PhoneErrorCode = 'required' | 'invalid-format'
export type AgreementErrorCode = 'not-checked'

// Every BookingFieldName must have an entry here — if types.ts adds a field
// without adding its error code here, the BookingFieldErrors mapped type
// below fails to compile.
export type BookingFieldErrorCodeMap = {
  checkIn: CheckInErrorCode
  checkOut: CheckOutErrorCode
  guests: GuestsErrorCode
  name: NameErrorCode
  email: EmailErrorCode
  phone: PhoneErrorCode
  agreement: AgreementErrorCode
}

export type BookingFieldErrors = {
  [K in BookingFieldName]?: BookingFieldErrorCodeMap[K]
}

// The outcome of assembling a BookingRequest from a draft.
export type BookingRequestResult =
  | { ok: true; request: BookingRequest }
  | { ok: false; errors: BookingFieldErrors; firstErrorStep: BookingStep }

type FieldResult<Value, Code extends string> = { ok: true; value: Value } | { ok: false; error: Code }

export interface BookingFieldResults {
  checkIn: FieldResult<IsoDate, CheckInErrorCode>
  checkOut: FieldResult<IsoDate, CheckOutErrorCode>
  guests: FieldResult<number, GuestsErrorCode>
  name: FieldResult<string, NameErrorCode>
  email: FieldResult<string, EmailErrorCode>
  phone: FieldResult<string, PhoneErrorCode>
  agreement: FieldResult<true, AgreementErrorCode>
}

function parseCheckIn(raw: string | undefined, today: IsoDate): FieldResult<IsoDate, CheckInErrorCode> {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return { ok: false, error: 'required' }
  if (!isIsoDate(trimmed)) return { ok: false, error: 'invalid-format' }
  if (isPastDate(trimmed, today)) return { ok: false, error: 'in-past' }
  return { ok: true, value: trimmed }
}

function parseCheckOut(
  raw: string | undefined,
  checkIn: IsoDate | null,
  constraints: BookingValidationConstraints,
): FieldResult<IsoDate, CheckOutErrorCode> {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return { ok: false, error: 'required' }
  if (!isIsoDate(trimmed)) return { ok: false, error: 'invalid-format' }
  if (isPastDate(trimmed, constraints.today)) return { ok: false, error: 'in-past' }

  // checkIn is null when it failed its own validation (already reported
  // there) — skip range checks rather than compound the error.
  if (checkIn === null) return { ok: true, value: trimmed }

  if (!isChronological(checkIn, trimmed)) return { ok: false, error: 'before-check-in' }
  if (overlapsAnyRange({ start: checkIn, end: trimmed }, constraints.bookedRanges)) {
    return { ok: false, error: 'unavailable' }
  }

  const rangeCheck = checkRangeLength(checkIn, trimmed, constraints)
  if (rangeCheck !== 'valid') return { ok: false, error: rangeCheck }
  return { ok: true, value: trimmed }
}

function parseGuestsField(raw: string | undefined, capacity: number): FieldResult<number, GuestsErrorCode> {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return { ok: false, error: 'required' }
  const value = parseGuestsCount(trimmed)
  if (value === null || !isValidGuestsCount(value, capacity)) return { ok: false, error: 'invalid' }
  return { ok: true, value }
}

function parseName(raw: string | undefined): FieldResult<string, NameErrorCode> {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return { ok: false, error: 'required' }
  return { ok: true, value: trimmed }
}

// Domain labels: letters (any script) or digits, hyphens only inside.
const DOMAIN_LABEL = /^[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u
// Top-level domain: two or more letters, or a punycode (xn--) label.
const TOP_LEVEL_DOMAIN = /^(?:\p{L}{2,}|xn--[a-z0-9-]+)$/iu

// A shape check, deliberately not a full RFC 5322 parser: one @, a
// non-empty local part without spaces, and a dotted domain whose labels
// are non-empty. Catches typos like "a@.", "a@b" or "a@@b.com" and accepts
// tags like name+tag@example.com. Passing it does not mean the mailbox
// exists — only sending a message could tell that, and this demo doesn't.
export function isValidEmailFormat(value: string): boolean {
  if (value.length > 254 || /\s/.test(value)) return false

  const at = value.indexOf('@')
  if (at <= 0 || at !== value.lastIndexOf('@')) return false

  const local = value.slice(0, at)
  const domain = value.slice(at + 1)
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false

  const labels = domain.split('.')
  if (labels.length < 2) return false
  if (!labels.every((label) => label.length <= 63 && DOMAIN_LABEL.test(label))) return false
  return TOP_LEVEL_DOMAIN.test(labels[labels.length - 1])
}

function parseEmail(raw: string | undefined): FieldResult<string, EmailErrorCode> {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return { ok: false, error: 'required' }
  if (!isValidEmailFormat(trimmed)) return { ok: false, error: 'invalid-format' }
  return { ok: true, value: trimmed }
}

function isValidPhoneFormat(value: string): boolean {
  if (!/^[\d\s+\-()]+$/.test(value)) return false
  const digitCount = (value.match(/\d/g) ?? []).length
  return digitCount >= 7 && digitCount <= 20
}

function parsePhone(raw: string | undefined): FieldResult<string, PhoneErrorCode> {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return { ok: false, error: 'required' }
  if (!isValidPhoneFormat(trimmed)) return { ok: false, error: 'invalid-format' }
  return { ok: true, value: trimmed }
}

function parseAgreement(raw: boolean | undefined): FieldResult<true, AgreementErrorCode> {
  if (raw !== true) return { ok: false, error: 'not-checked' }
  return { ok: true, value: true }
}

// Empty and missing comments are the same thing — collapse a whitespace-only
// comment to undefined rather than keeping two representations of "none".
function normalizeComment(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim() ?? ''
  return trimmed === '' ? undefined : trimmed
}

export function parseDraft(draft: BookingDraft, constraints: BookingValidationConstraints): BookingFieldResults {
  const checkIn = parseCheckIn(draft.checkIn, constraints.today)
  return {
    checkIn,
    checkOut: parseCheckOut(draft.checkOut, checkIn.ok ? checkIn.value : null, constraints),
    guests: parseGuestsField(draft.guests, constraints.capacity),
    name: parseName(draft.name),
    email: parseEmail(draft.email),
    phone: parsePhone(draft.phone),
    agreement: parseAgreement(draft.agreement),
  }
}

function toFieldErrors(results: BookingFieldResults): BookingFieldErrors {
  const errors: BookingFieldErrors = {}
  if (!results.checkIn.ok) errors.checkIn = results.checkIn.error
  if (!results.checkOut.ok) errors.checkOut = results.checkOut.error
  if (!results.guests.ok) errors.guests = results.guests.error
  if (!results.name.ok) errors.name = results.name.error
  if (!results.email.ok) errors.email = results.email.error
  if (!results.phone.ok) errors.phone = results.phone.error
  if (!results.agreement.ok) errors.agreement = results.agreement.error
  return errors
}

function pickFields<K extends keyof BookingFieldErrors>(
  errors: BookingFieldErrors,
  fields: readonly K[],
): Pick<BookingFieldErrors, K> {
  const result = {} as Pick<BookingFieldErrors, K>
  for (const field of fields) {
    if (errors[field] !== undefined) result[field] = errors[field]
  }
  return result
}

function firstErrorStep(errors: BookingFieldErrors): BookingStep {
  for (const step of BOOKING_STEP_ORDER) {
    for (const field of BOOKING_STEP_FIELDS[step]) {
      if (errors[field] !== undefined) return step
    }
  }
  // Only called from toBookingRequest's failure branch, where at least one
  // error is guaranteed to exist.
  throw new Error('firstErrorStep: no field error found')
}

export function validateStep(
  step: BookingStep,
  draft: BookingDraft,
  constraints: BookingValidationConstraints,
): BookingFieldErrors {
  const errors = toFieldErrors(parseDraft(draft, constraints))
  return pickFields(errors, BOOKING_STEP_FIELDS[step])
}

// The inverse of toBookingRequest, so a request that arrives at the API can
// be run through the exact same checks as the form — one rule set, not a
// second copy that could drift from it.
export function requestToDraft(request: BookingRequest): BookingDraft {
  return {
    checkIn: request.checkIn,
    checkOut: request.checkOut,
    guests: String(request.guests),
    name: request.name,
    email: request.email,
    phone: request.phone,
    comment: request.comment,
    agreement: request.agreement,
  }
}

export function toBookingRequest(
  draft: BookingDraft,
  constraints: BookingValidationConstraints,
): BookingRequestResult {
  const results = parseDraft(draft, constraints)

  if (
    results.checkIn.ok &&
    results.checkOut.ok &&
    results.guests.ok &&
    results.name.ok &&
    results.email.ok &&
    results.phone.ok &&
    results.agreement.ok
  ) {
    return {
      ok: true,
      request: {
        checkIn: results.checkIn.value,
        checkOut: results.checkOut.value,
        guests: results.guests.value,
        name: results.name.value,
        email: results.email.value,
        phone: results.phone.value,
        comment: normalizeComment(draft.comment),
        agreement: results.agreement.value,
      },
    }
  }

  const errors = toFieldErrors(results)
  return { ok: false, errors, firstErrorStep: firstErrorStep(errors) }
}
