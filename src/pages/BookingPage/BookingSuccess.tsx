import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon } from '@/components/icons/Icons'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import type { BookingConfirmation } from '@/features/booking/types'
import { formatDateLabel } from '@/lib/date/format'
import { daysLabel } from '@/lib/daysLabel'
import { guestsLabel } from '@/lib/guestsLabel'
import { formatPrice } from '@/lib/price'
import type { VenueDetail } from '@/types'
import styles from './BookingPage.module.css'

export interface BookingSuccessProps {
  confirmation: BookingConfirmation
  venue: VenueDetail
  headingRef: RefObject<HTMLHeadingElement | null>
}

// Honest about what happened: the mock API generated a reference locally.
// No reservation exists and no email went anywhere.
export function BookingSuccess({ confirmation, venue, headingRef }: BookingSuccessProps) {
  const { request } = confirmation

  return (
    <div className={styles.success}>
      <span className={styles.successIcon} aria-hidden="true">
        <CheckIcon />
      </span>
      {/* h1: this view replaces the whole booking page. */}
      <h1 ref={headingRef} tabIndex={-1} className={`${styles.stepHeading} ${styles.successTitle}`}>
        Demo booking completed
      </h1>
      <p className={styles.successText}>
        This is a portfolio demo. No reservation was made and no email was sent.
      </p>

      <dl className={styles.successList}>
        <div className={styles.reviewRow}>
          <dt>Demo reference</dt>
          <dd>{confirmation.id}</dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Space</dt>
          <dd>{venue.name}</dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Check-in</dt>
          <dd>{formatDateLabel(request.checkIn)}</dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Check-out</dt>
          <dd>{formatDateLabel(request.checkOut)}</dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Guests</dt>
          <dd>{guestsLabel(request.guests)}</dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>
            {formatPrice(venue.pricePerDay)} × {daysLabel(confirmation.days)}
          </dt>
          <dd>{formatPrice(confirmation.total)}</dd>
        </div>
        <div className={styles.reviewTotal}>
          <dt>Total</dt>
          <dd>{formatPrice(confirmation.total)}</dd>
        </div>
      </dl>

      <div className={styles.successActions}>
        <Link to="/" className={buttonClass()}>
          Browse more spaces
        </Link>
        <Link to={`/venue/${venue.slug}`} className={buttonClass({ variant: 'secondary' })}>
          Back to {venue.name}
        </Link>
      </div>
    </div>
  )
}
