import type { BookingDraft } from '@/features/booking/types'
import { quoteBooking } from '@/features/booking/pricing'
import { isIsoDate } from '@/lib/date/isoDate'
import { formatShortDateLabel } from '@/lib/date/format'
import { daysLabel } from '@/lib/daysLabel'
import { guestsLabel } from '@/lib/guestsLabel'
import { formatPrice } from '@/lib/price'
import { VENUE_TYPE_LABELS } from '@/types'
import type { VenueDetail } from '@/types'
import styles from './BookingPage.module.css'

export interface BookingSummaryProps {
  venue: VenueDetail
  draft: BookingDraft
}

// Reflects the draft as typed, so it only shows what is already a valid
// date pair / guest number and says "Not chosen yet" otherwise.
export function BookingSummary({ venue, draft }: BookingSummaryProps) {
  const checkIn = draft.checkIn && isIsoDate(draft.checkIn) ? draft.checkIn : null
  const checkOut = draft.checkOut && isIsoDate(draft.checkOut) ? draft.checkOut : null
  const quote = checkIn && checkOut && checkOut >= checkIn ? quoteBooking(venue.pricePerDay, checkIn, checkOut) : null
  const guests = draft.guests && /^\d+$/.test(draft.guests) && Number(draft.guests) > 0 ? Number(draft.guests) : null

  return (
    <aside className={styles.summary} aria-labelledby="booking-summary-title">
      <div className={styles.summaryHead}>
        <img
          src={venue.images[0].srcSmall}
          alt=""
          width={600}
          height={400}
          className={styles.summaryImage}
          decoding="async"
        />
        <div className={styles.summaryTitleBlock}>
          <p className={styles.summaryEyebrow}>
            {VENUE_TYPE_LABELS[venue.type]} · {venue.city}
          </p>
          <h2 id="booking-summary-title" className={styles.summaryTitle}>
            {venue.name}
          </h2>
        </div>
      </div>

      <dl className={styles.summaryList}>
        <div className={styles.summaryRow}>
          <dt>Dates</dt>
          <dd>
            {checkIn && checkOut
              ? `${formatShortDateLabel(checkIn)} – ${formatShortDateLabel(checkOut)}`
              : 'Not chosen yet'}
          </dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Guests</dt>
          <dd>{guests !== null ? guestsLabel(guests) : 'Not chosen yet'}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>{quote ? `${formatPrice(venue.pricePerDay)} × ${daysLabel(quote.days)}` : 'Price per day'}</dt>
          <dd>{quote ? formatPrice(quote.total) : formatPrice(venue.pricePerDay)}</dd>
        </div>
      </dl>

      <div className={styles.summaryTotal}>
        <span>Total</span>
        <span className={styles.summaryTotalValue}>{quote ? formatPrice(quote.total) : '—'}</span>
      </div>
      <p className={styles.summaryNote}>No fees. Demo only: nothing is charged.</p>
    </aside>
  )
}
