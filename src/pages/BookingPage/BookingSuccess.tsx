import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import type { BookingConfirmation } from '@/features/booking/types'
import { formatShortDateLabel } from '@/lib/date/format'
import { formatPrice } from '@/lib/price'
import type { VenueDetail } from '@/types'
import styles from './BookingPage.module.css'

// Duplicated from BookingStepReview — not exported there yet, and a third
// differently-typed copy already exists in PricePanel/errorText. Sharing is
// planned for block 9. guests here is a number (BookingRequest), not the
// draft's string, so the comparison is `=== 1` instead of `=== '1'`.
function guestsLabel(guests: number): string {
  return `${guests} ${guests === 1 ? 'guest' : 'guests'}`
}

export interface BookingSuccessProps {
  confirmation: BookingConfirmation
  venue: VenueDetail
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function BookingSuccess({ confirmation, venue, headingRef }: BookingSuccessProps) {
  const { request } = confirmation

  return (
    <div className={styles.step}>
      {/* h1, not h2: this view replaces the whole form, venue-name h1
          included, so it is the page's only top-level heading. */}
      <h1 ref={headingRef} tabIndex={-1} className={styles.stepHeading}>
        Booking confirmed
      </h1>
      <p>A confirmation has been sent to {request.email}.</p>

      <dl className={styles.summary}>
        <div className={styles.summaryRow}>
          <dt>Booking number</dt>
          <dd>{confirmation.id}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Venue</dt>
          <dd>{venue.name}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Check-in</dt>
          <dd>{formatShortDateLabel(request.checkIn)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Check-out</dt>
          <dd>{formatShortDateLabel(request.checkOut)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Guests</dt>
          <dd>{guestsLabel(request.guests)}</dd>
        </div>
        <div className={styles.summaryTotal}>
          <dt>Total</dt>
          <dd>{formatPrice(confirmation.total)}</dd>
        </div>
      </dl>

      <Link to="/" className={styles.backLink}>
        Back to catalog
      </Link>
    </div>
  )
}
