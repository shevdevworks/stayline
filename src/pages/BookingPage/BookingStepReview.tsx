import { useId, type RefObject } from 'react'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { bookingErrorText } from '@/features/booking/errorText'
import type { BookingSetFieldPayload } from '@/features/booking/formState'
import { quoteBooking } from '@/features/booking/pricing'
import type { BookingDraft, BookingStep, BookingValidationConstraints } from '@/features/booking/types'
import type { BookingFieldErrors } from '@/features/booking/validation'
import { formatDateLabel } from '@/lib/date/format'
import { daysLabel } from '@/lib/daysLabel'
import { guestsLabel } from '@/lib/guestsLabel'
import { formatPrice } from '@/lib/price'
import type { VenueDetail } from '@/types'
import { BookingFieldError } from './BookingFieldError'
import styles from './BookingPage.module.css'

export interface BookingStepReviewProps {
  venue: VenueDetail
  draft: BookingDraft
  errors: BookingFieldErrors
  constraints: BookingValidationConstraints
  setField: (payload: BookingSetFieldPayload) => void
  blurField: (field: 'agreement') => void
  onEdit: (step: BookingStep) => void
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
  onEdit,
  headingRef,
  agreementFieldRef,
}: BookingStepReviewProps) {
  const uid = useId()
  const agreementId = `${uid}-agreement`
  const agreementErrorId = `${agreementId}-error`
  const termsId = `${uid}-terms`
  const missingSummaryId = `${uid}-missing-summary`

  const { checkIn, checkOut, guests } = draft

  // Practically unreachable — step 1 never advances without a valid range
  // and guest count — but a visible message beats an empty summary.
  if (checkIn === undefined || checkOut === undefined || guests === undefined) {
    return (
      <div className={styles.step}>
        <h2 ref={headingRef} tabIndex={-1} className={styles.stepHeading}>
          Review and confirm
        </h2>
        <BookingFieldError
          id={missingSummaryId}
          message="Dates and guests are missing. Use Back to return to the first step and choose them."
        />
      </div>
    )
  }

  const quote = quoteBooking(venue.pricePerDay, checkIn, checkOut)

  return (
    <div className={styles.step}>
      <h2 ref={headingRef} tabIndex={-1} className={styles.stepHeading}>
        Review and confirm
      </h2>

      <section className={styles.reviewBlock} aria-labelledby={`${uid}-dates`}>
        <div className={styles.reviewBlockHead}>
          <h3 id={`${uid}-dates`} className={styles.reviewTitle}>
            Dates and guests
          </h3>
          <button type="button" className={styles.editButton} onClick={() => onEdit(1)}>
            Edit<span className="sr-only"> dates and guests</span>
          </button>
        </div>
        <dl className={styles.reviewList}>
          <div className={styles.reviewRow}>
            <dt>Check-in</dt>
            <dd>{formatDateLabel(checkIn)}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Check-out</dt>
            <dd>{formatDateLabel(checkOut)}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Guests</dt>
            <dd>{guestsLabel(Number(guests))}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.reviewBlock} aria-labelledby={`${uid}-contact`}>
        <div className={styles.reviewBlockHead}>
          <h3 id={`${uid}-contact`} className={styles.reviewTitle}>
            Your details
          </h3>
          <button type="button" className={styles.editButton} onClick={() => onEdit(2)}>
            Edit<span className="sr-only"> your details</span>
          </button>
        </div>
        <dl className={styles.reviewList}>
          <div className={styles.reviewRow}>
            <dt>Name</dt>
            <dd>{draft.name?.trim()}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Email</dt>
            <dd className={styles.breakAnywhere}>{draft.email?.trim()}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Phone</dt>
            <dd>{draft.phone?.trim()}</dd>
          </div>
          {draft.comment?.trim() && (
            <div className={styles.reviewRow}>
              <dt>Note</dt>
              <dd className={styles.preserveLines}>{draft.comment.trim()}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className={styles.reviewBlock} aria-labelledby={`${uid}-price`}>
        <h3 id={`${uid}-price`} className={styles.reviewTitle}>
          Price
        </h3>
        <dl className={styles.reviewList}>
          <div className={styles.reviewRow}>
            <dt>
              {formatPrice(quote.pricePerDay)} × {daysLabel(quote.days)}
            </dt>
            <dd>{formatPrice(quote.total)}</dd>
          </div>
          <div className={styles.reviewTotal}>
            <dt>Total</dt>
            <dd>{formatPrice(quote.total)}</dd>
          </div>
        </dl>
      </section>

      <div className={styles.terms} id={termsId}>
        <h3 className={styles.reviewTitle}>Demo terms</h3>
        <ul className={styles.termsList}>
          <li>Stayline is a portfolio demo. Confirming does not reserve this space or contact a host.</li>
          <li>No payment is taken and no confirmation email is sent.</li>
          <li>Your details stay in this browser tab and are discarded when you leave the page.</li>
        </ul>
      </div>

      <div className={styles.fieldGroup}>
        <Checkbox
          id={agreementId}
          ref={agreementFieldRef}
          label="I’ve read the demo terms and understand this is not a real booking."
          checked={draft.agreement ?? false}
          onChange={(checked) => setField({ field: 'agreement', value: checked })}
          onBlur={() => blurField('agreement')}
          invalid={errors.agreement !== undefined}
          describedBy={`${agreementErrorId} ${termsId}`}
        />
        <BookingFieldError
          id={agreementErrorId}
          message={errors.agreement ? bookingErrorText({ field: 'agreement', code: errors.agreement }, constraints) : undefined}
        />
      </div>
    </div>
  )
}
