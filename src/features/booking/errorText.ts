import { daysLabel } from '@/lib/daysLabel'
import type { BookingConstraints, BookingSubmissionErrorCode } from './types'
import type {
  AgreementErrorCode,
  BookingFieldErrorCodeMap,
  CheckInErrorCode,
  CheckOutErrorCode,
  EmailErrorCode,
  GuestsErrorCode,
  NameErrorCode,
  PhoneErrorCode,
} from './validation'

// Distributive over BookingFieldErrorCodeMap's keys, same construction as
// formState.ts's BookingSetFieldPayload — a generic <K> parameter can't
// narrow a sibling type indexed by K inside a switch on K's value, so
// pairing field with its own code type needs this union, not a generic.
export type BookingFieldErrorArgs = {
  [K in keyof BookingFieldErrorCodeMap]: { field: K; code: BookingFieldErrorCodeMap[K] }
}[keyof BookingFieldErrorCodeMap]

function checkInText(code: CheckInErrorCode): string {
  switch (code) {
    case 'required':
      return 'Select a check-in date.'
    case 'invalid-format':
      return 'This date is not valid.'
    case 'in-past':
      return 'Check-in date cannot be in the past.'
  }
}

function checkOutText(code: CheckOutErrorCode, constraints: BookingConstraints): string {
  switch (code) {
    case 'required':
      return 'Select a check-out date.'
    case 'invalid-format':
      return 'This date is not valid.'
    case 'in-past':
      return 'Check-out date cannot be in the past.'
    case 'before-check-in':
      return 'Check-out date must be after check-in.'
    case 'unavailable':
      return 'Some of these dates are already booked. Choose different dates.'
    case 'too-short':
      return `Stay must be at least ${daysLabel(constraints.minDays)}.`
    case 'too-long':
      return `Stay can be at most ${daysLabel(constraints.maxDays)}.`
  }
}

function guestsText(code: GuestsErrorCode, constraints: BookingConstraints): string {
  switch (code) {
    case 'required':
      return 'Enter the number of guests.'
    case 'invalid':
      return `Guests must be between 1 and ${constraints.capacity}.`
  }
}

function nameText(code: NameErrorCode): string {
  switch (code) {
    case 'required':
      return 'Enter your name.'
  }
}

function emailText(code: EmailErrorCode): string {
  switch (code) {
    case 'required':
      return 'Enter your email address.'
    case 'invalid-format':
      return 'Enter an email address like name@example.com.'
  }
}

function phoneText(code: PhoneErrorCode): string {
  switch (code) {
    case 'required':
      return 'Enter your phone number.'
    case 'invalid-format':
      return 'Enter a phone number with 7 to 20 digits, e.g. +31 20 123 4567.'
  }
}

function agreementText(code: AgreementErrorCode): string {
  switch (code) {
    case 'not-checked':
      return 'Tick the box to confirm you’ve read the demo terms.'
  }
}

export function bookingErrorText(args: BookingFieldErrorArgs, constraints: BookingConstraints): string {
  switch (args.field) {
    case 'checkIn':
      return checkInText(args.code)
    case 'checkOut':
      return checkOutText(args.code, constraints)
    case 'guests':
      return guestsText(args.code, constraints)
    case 'name':
      return nameText(args.code)
    case 'email':
      return emailText(args.code)
    case 'phone':
      return phoneText(args.code)
    case 'agreement':
      return agreementText(args.code)
  }
}

export function submissionErrorText(code: BookingSubmissionErrorCode): string {
  switch (code) {
    case 'network':
      return 'The demo booking service didn’t respond. Your details are kept — try again.'
    case 'unavailable':
      return 'These dates were just taken. Edit the dates and try again.'
    case 'invalid':
      return 'Some details need another look. They’re highlighted on the step shown.'
  }
}
