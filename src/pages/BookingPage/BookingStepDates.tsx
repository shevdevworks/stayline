import { useId, type RefObject } from 'react'
import { DateRangeField } from '@/components/ui/DateRangeField/DateRangeField'
import { toDigits } from '@/components/ui/NumberRangeField/digits'
import { TextField } from '@/components/ui/TextField/TextField'
import { bookingErrorText } from '@/features/booking/errorText'
import type { BookingSetFieldPayload } from '@/features/booking/formState'
import type { BookingDraft, BookingValidationConstraints } from '@/features/booking/types'
import type { BookingFieldErrors } from '@/features/booking/validation'
import { isDateInRanges } from '@/lib/date/isoDate'
import { daysLabel } from '@/lib/daysLabel'
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

function stayHint(minDays: number, maxDays: number): string {
  if (minDays === maxDays) return `This space is booked for exactly ${daysLabel(minDays)}.`
  return `Book from ${daysLabel(minDays)} up to ${daysLabel(maxDays)}. Both the first and last day count.`
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
  const datesHintId = `${datesId}-hint`
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

      <div className={styles.fieldGroup}>
        <DateRangeField
          id={datesId}
          ref={dateFieldRef}
          value={{ start: draft.checkIn ?? null, end: draft.checkOut ?? null }}
          onChange={(range) => setDateRange(range.start ?? undefined, range.end ?? undefined)}
          minDate={constraints.today}
          minDays={constraints.minDays}
          maxDays={constraints.maxDays}
          isDateDisabled={(iso) => isDateInRanges(iso, constraints.bookedRanges)}
          describedBy={`${datesErrorId} ${datesHintId}`}
          invalid={dateInvalid}
        />
        <BookingFieldError id={datesErrorId} message={dateErrorText} />
        <p id={datesHintId} className={styles.fieldHint}>
          {stayHint(constraints.minDays, constraints.maxDays)}
        </p>
      </div>

      <div className={styles.fieldGroup}>
        <TextField
          id={guestsId}
          ref={guestsFieldRef}
          label="Guests"
          inputMode="numeric"
          autoComplete="off"
          required
          value={draft.guests ?? ''}
          onChange={(raw) => setField({ field: 'guests', value: toDigits(raw) })}
          onBlur={() => blurField('guests')}
          placeholder={`1–${constraints.capacity}`}
          hint={`Up to ${constraints.capacity} people`}
          describedBy={guestsErrorId}
          invalid={errors.guests !== undefined}
        />
        <BookingFieldError
          id={guestsErrorId}
          message={errors.guests ? bookingErrorText({ field: 'guests', code: errors.guests }, constraints) : undefined}
        />
      </div>
    </div>
  )
}
