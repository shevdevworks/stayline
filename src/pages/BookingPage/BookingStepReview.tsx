import { useId, type RefObject } from 'react'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { bookingErrorText } from '@/features/booking/errorText'
import type { BookingSetFieldPayload } from '@/features/booking/formState'
import type { BookingDraft, BookingValidationConstraints } from '@/features/booking/types'
import type { BookingFieldErrors } from '@/features/booking/validation'
import { formatShortDateLabel } from '@/lib/date/format'
import { daysLabel } from '@/lib/daysLabel'
import { rangeLengthDays } from '@/lib/date/isoDate'
import { formatPrice } from '@/lib/price'
import type { VenueDetail } from '@/types'
import { BookingFieldError } from './BookingFieldError'
import styles from './BookingPage.module.css'

function guestsLabel(guests: string): string {
  return `${guests} ${guests === '1' ? 'guest' : 'guests'}`
}

export interface BookingStepReviewProps {
  venue: VenueDetail
  draft: BookingDraft
  errors: BookingFieldErrors
  constraints: BookingValidationConstraints
  setField: (payload: BookingSetFieldPayload) => void
  blurField: (field: 'agreement') => void
  headingRef: RefObject<HTMLHeadingElement | null>
  agreementFieldRef: RefObject<HTMLInputElement | null>
}

export function BookingStepReview({
  venue,
  draft,
  errors,
  constraints,
  setField,
  blurField,
  headingRef,
  agreementFieldRef,
}: BookingStepReviewProps) {
  const uid = useId()
  const agreementId = `${uid}-agreement`
  const agreementErrorId = `${agreementId}-error`
  const missingSummaryId = `${uid}-missing-summary`

  const { checkIn, checkOut, guests } = draft

  // Practically unreachable — step 1 never advances without a valid, complete
  // date range and guest count — but if it ever happens, a visible message
  // beats the price/total rows silently vanishing from the summary.
  if (checkIn === undefined || checkOut === undefined || guests === undefined) {
    return (
      <div className={styles.step}>
        <h2 ref={headingRef} tabIndex={-1} className={styles.stepHeading}>
          Review and confirm
        </h2>
        <BookingFieldError
          id={missingSummaryId}
          message="Dates and guests are missing. Use Back to return to the first step and select them."
        />
      </div>
    )
  }

  const days = rangeLengthDays(checkIn, checkOut)

  return (
    <div className={styles.step}>
      <h2 ref={headingRef} tabIndex={-1} className={styles.stepHeading}>
        Review and confirm
      </h2>

      <dl className={styles.summary}>
        <div className={styles.summaryRow}>
          <dt>Check-in</dt>
          <dd>{formatShortDateLabel(checkIn)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Check-out</dt>
          <dd>{formatShortDateLabel(checkOut)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Guests</dt>
          <dd>{guestsLabel(guests)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Price</dt>
          <dd>
            {formatPrice(venue.pricePerDay)} × {daysLabel(days)}
          </dd>
        </div>
        <div className={styles.summaryTotal}>
          <dt>Total</dt>
          <dd>{formatPrice(venue.pricePerDay * days)}</dd>
        </div>
      </dl>

      <Checkbox
        id={agreementId}
        ref={agreementFieldRef}
        label="I agree to the booking terms and conditions."
        checked={draft.agreement ?? false}
        onChange={(checked) => setField({ field: 'agreement', value: checked })}
        onBlur={() => blurField('agreement')}
        invalid={errors.agreement !== undefined}
        describedBy={errors.agreement ? agreementErrorId : undefined}
      />
      <BookingFieldError
        id={agreementErrorId}
        message={
          errors.agreement ? bookingErrorText({ field: 'agreement', code: errors.agreement }, constraints) : undefined
        }
      />
    </div>
  )
}
