import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon'
import { DateRangeField } from '@/components/ui/DateRangeField/DateRangeField'
import { toDigits, toNumberOrNull } from '@/components/ui/NumberRangeField/digits'
import { TextField } from '@/components/ui/TextField/TextField'
import { toSearchParams } from '@/features/booking/bookingParams'
import { isValidGuestsCount } from '@/features/booking/guests'
import { useBookingParams } from '@/features/booking/useBookingParams'
import { useAnnouncedMessage } from '@/hooks/useAnnouncedMessage'
import type { DateRangeRejectionReason } from '@/hooks/useDateRangePicker'
import { useDebouncedInput } from '@/hooks/useDebouncedInput'
import { rangeLengthDays, todayIso } from '@/lib/date/isoDate'
import { daysLabel } from '@/lib/daysLabel'
import { formatPrice } from '@/lib/price'
import type { VenueDetail } from '@/types'
import styles from './PricePanel.module.css'

export interface PricePanelProps {
  venue: VenueDetail
}

function stayHint(minDays: number, maxDays: number): string {
  if (minDays === maxDays) return `Book for exactly ${daysLabel(minDays)}`
  if (minDays === 1) return `Book for up to ${daysLabel(maxDays)}`
  return `Book from ${minDays} to ${daysLabel(maxDays)}`
}

function rejectionMessage(reason: DateRangeRejectionReason, venue: VenueDetail): string {
  switch (reason) {
    case 'too-short':
      return `Stay must be at least ${daysLabel(venue.minDays)}.`
    case 'too-long':
      return `Stay can be at most ${daysLabel(venue.maxDays)}.`
  }
}

function guestsErrorMessage(value: number, capacity: number): string {
  return value === 0 ? 'Enter at least 1 guest.' : `This venue holds up to ${capacity} guests.`
}

export function PricePanel({ venue }: PricePanelProps) {
  const { checkIn, checkOut, guests, setDates, setGuests } = useBookingParams({
    minDays: venue.minDays,
    maxDays: venue.maxDays,
    capacity: venue.capacity,
  })

  const uid = useId()
  const datesId = `${uid}-dates`
  const datesHintId = `${datesId}-hint`
  const guestsId = `${uid}-guests`
  const guestsErrorId = `${guestsId}-error`

  const [rejectionText, announceRejection] = useAnnouncedMessage()
  const [guestsErrorText, announceGuestsError] = useAnnouncedMessage()
  const [isFieldOpen, setIsFieldOpen] = useState(false)
  const [hasPendingCheckIn, setHasPendingCheckIn] = useState(false)

  function handleGuestsCommit(digits: string) {
    const value = toNumberOrNull(digits)
    setGuests(value)

    if (value === null || isValidGuestsCount(value, venue.capacity)) {
      announceGuestsError('')
    } else {
      announceGuestsError(guestsErrorMessage(value, venue.capacity))
    }
  }

  const debouncedGuests = useDebouncedInput(
    guests === null ? '' : String(guests),
    handleGuestsCommit,
    350,
  )

  const days = checkIn !== null && checkOut !== null ? rangeLengthDays(checkIn, checkOut) : null
  const showPendingCheckoutHint = !isFieldOpen && hasPendingCheckIn && days === null

  return (
    <div className={styles.panel}>
      {days !== null ? (
        <div className={styles.breakdown}>
          <p className={styles.breakdownLine}>
            {formatPrice(venue.pricePerDay)} × {daysLabel(days)}
          </p>
          <p className={styles.total}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>{formatPrice(venue.pricePerDay * days)}</span>
          </p>
        </div>
      ) : (
        <p className={styles.price}>
          {formatPrice(venue.pricePerDay)} <span className={styles.priceUnit}>/ day</span>
        </p>
      )}

      <DateRangeField
        id={datesId}
        value={{ start: checkIn, end: checkOut }}
        onChange={(range) => {
          setDates({ checkIn: range.start, checkOut: range.end })
          announceRejection('')
          setHasPendingCheckIn(false)
        }}
        minDate={todayIso()}
        minDays={venue.minDays}
        maxDays={venue.maxDays}
        describedBy={datesHintId}
        onRejectedSelection={(reason) => announceRejection(rejectionMessage(reason, venue))}
        onSelectionStart={() => {
          announceRejection('')
          setHasPendingCheckIn(true)
        }}
        onOpenChange={(isOpen) => {
          setIsFieldOpen(isOpen)
          if (!isOpen) announceRejection('')
        }}
      />
      <p id={datesHintId} className={styles.hint}>
        {stayHint(venue.minDays, venue.maxDays)}
      </p>
      <p className={styles.rejectionMessage} aria-live="polite">
        {rejectionText && (
          <>
            <span className={styles.warningIcon}>
              <AlertTriangleIcon />
            </span>{' '}
            {rejectionText}
          </>
        )}
      </p>
      {showPendingCheckoutHint && (
        <p className={styles.hint}>Check-out wasn't picked, so the dates were cleared.</p>
      )}

      <TextField
        id={guestsId}
        label="Guests"
        type="text"
        inputMode="numeric"
        value={debouncedGuests.value}
        onChange={(raw) => debouncedGuests.setValue(toDigits(raw))}
        onBlur={debouncedGuests.flush}
        onKeyDown={(event) => {
          if (event.key === 'Enter') debouncedGuests.flush()
        }}
        hint={`Whole space · up to ${venue.capacity} guests`}
        describedBy={guestsErrorId}
        invalid={guestsErrorText !== ''}
      />
      <p id={guestsErrorId} className={styles.rejectionMessage} aria-live="polite">
        {guestsErrorText && (
          <>
            <span className={styles.warningIcon}>
              <AlertTriangleIcon />
            </span>{' '}
            {guestsErrorText}
          </>
        )}
      </p>

      {days !== null ? (
        <Link
          to={{
            pathname: `/venue/${venue.slug}/book`,
            search: toSearchParams(
              { checkIn, checkOut, guests },
              { minDays: venue.minDays, maxDays: venue.maxDays, capacity: venue.capacity },
            ).toString(),
          }}
          className={styles.bookButton}
        >
          Book
        </Link>
      ) : (
        <>
          <button type="button" className={styles.bookButton} disabled>
            Book
          </button>
          {!showPendingCheckoutHint && (
            <p className={styles.bookNote}>Select valid check-in and check-out dates to book.</p>
          )}
        </>
      )}
    </div>
  )
}
