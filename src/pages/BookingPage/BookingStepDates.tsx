import { useId, type RefObject } from 'react'
import { DateRangeField } from '@/components/ui/DateRangeField/DateRangeField'
import { toDigits } from '@/components/ui/NumberRangeField/digits'
import { TextField } from '@/components/ui/TextField/TextField'
import { bookingErrorText } from '@/features/booking/errorText'
import type { BookingSetFieldPayload } from '@/features/booking/formState'
import type { BookingDraft, BookingValidationConstraints } from '@/features/booking/types'
import type { BookingFieldErrors } from '@/features/booking/validation'
import { BookingFieldError } from './BookingFieldError'
import styles from './BookingPage.module.css'

export interface BookingStepDatesProps {
  draft: BookingDraft
  errors: BookingFieldErrors
  constraints: BookingValidationConstraints
  setField: (payload: BookingSetFieldPayload) => void
  setDateRange: (checkIn: string | undefined, checkOut: string | undefined) => void
  blurField: (field: 'guests') => void
  headingRef: RefObject<HTMLHeadingElement | null>
  dateFieldRef: RefObject<HTMLButtonElement | null>
  guestsFieldRef: RefObject<HTMLInputElement | null>
}

export function BookingStepDates({
  draft,
  errors,
  constraints,
  setField,
  setDateRange,
  blurField,
  headingRef,
  dateFieldRef,
  guestsFieldRef,
}: BookingStepDatesProps) {
  const uid = useId()
  const datesId = `${uid}-dates`
  const datesErrorId = `${datesId}-error`
  const guestsId = `${uid}-guests`
  const guestsErrorId = `${guestsId}-error`

  const dateErrorText = errors.checkIn
    ? bookingErrorText({ field: 'checkIn', code: errors.checkIn }, constraints)
    : errors.checkOut
      ? bookingErrorText({ field: 'checkOut', code: errors.checkOut }, constraints)
      : undefined

  const dateInvalid = errors.checkIn !== undefined || errors.checkOut !== undefined

  return (
    <div className={styles.step}>
      <h2 ref={headingRef} tabIndex={-1} className={styles.stepHeading}>
        Dates and guests
      </h2>

      <DateRangeField
        id={datesId}
        ref={dateFieldRef}
        value={{ start: draft.checkIn ?? null, end: draft.checkOut ?? null }}
        onChange={(range) => setDateRange(range.start ?? undefined, range.end ?? undefined)}
        minDate={constraints.today}
        minDays={constraints.minDays}
        maxDays={constraints.maxDays}
        describedBy={dateErrorText ? datesErrorId : undefined}
        invalid={dateInvalid}
      />
      <BookingFieldError id={datesErrorId} message={dateErrorText} />

      <TextField
        id={guestsId}
        ref={guestsFieldRef}
        label="Guests"
        type="text"
        inputMode="numeric"
        value={draft.guests ?? ''}
        onChange={(raw) => setField({ field: 'guests', value: toDigits(raw) })}
        onBlur={() => blurField('guests')}
        describedBy={errors.guests ? guestsErrorId : undefined}
        invalid={errors.guests !== undefined}
      />
      <BookingFieldError
        id={guestsErrorId}
        message={errors.guests ? bookingErrorText({ field: 'guests', code: errors.guests }, constraints) : undefined}
      />
    </div>
  )
}
