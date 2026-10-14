import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon'
import { InfoIcon } from '@/components/icons/Icons'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import { DateRangeField } from '@/components/ui/DateRangeField/DateRangeField'
import { toDigits, toNumberOrNull } from '@/components/ui/NumberRangeField/digits'
import { TextField } from '@/components/ui/TextField/TextField'
import { toSearchParams } from '@/features/booking/bookingParams'
import { isValidGuestsCount } from '@/features/booking/guests'
import { quoteBooking } from '@/features/booking/pricing'
import { useBookingParams } from '@/features/booking/useBookingParams'
import { useAnnouncedMessage } from '@/hooks/useAnnouncedMessage'
import type { DateRangeRejectionReason } from '@/hooks/useDateRangePicker'
import { useDebouncedInput } from '@/hooks/useDebouncedInput'
import { isDateInRanges, todayIso } from '@/lib/date/isoDate'
import { daysLabel } from '@/lib/daysLabel'
import { formatPrice } from '@/lib/price'
import type { VenueDetail, VenueWithAvailability } from '@/types'
import styles from './PricePanel.module.css'

export interface PricePanelProps {
  venue: VenueWithAvailability
}

function stayHint(minDays: number, maxDays: number): string {
  if (minDays === maxDays) return `Book for exactly ${daysLabel(minDays)}.`
  if (minDays === 1) return `Book for up to ${daysLabel(maxDays)}.`
  return `Book for ${minDays} to ${daysLabel(maxDays)}.`
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
  return value === 0 ? 'Enter at least 1 guest.' : `This space holds up to ${capacity} guests.`
}

function InlineMessage({ id, text }: { id?: string; text: string }) {
  return (
    <p id={id} className={styles.message} aria-live="polite">
      {text && (
        <>
          <AlertTriangleIcon />
          {text}
        </>
      )}
    </p>
  )
}

export function PricePanel({ venue }: PricePanelProps) {
  const constraints = {
    minDays: venue.minDays,
    maxDays: venue.maxDays,
    capacity: venue.capacity,
    bookedRanges: venue.bookedRanges,
  }
  const { checkIn, checkOut, guests, setDates, setGuests } = useBookingParams(constraints)

  const uid = useId()
  const datesId = `${uid}-dates`
  const datesHintId = `${datesId}-hint`
  const datesErrorId = `${datesId}-error`
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

  const debouncedGuests = useDebouncedInput(guests === null ? '' : String(guests), handleGuestsCommit, 350)

  const quote = checkIn !== null && checkOut !== null ? quoteBooking(venue.pricePerDay, checkIn, checkOut) : null
  const showPendingCheckoutHint = !isFieldOpen && hasPendingCheckIn && quote === null

  // Read from what's typed, not from the URL: an out-of-range count never
  // reaches the URL (toSearchParams drops it), so the link would otherwise
  // go through with the guests silently missing.
  const typedGuests = toNumberOrNull(debouncedGuests.value)
  const guestsInvalid = typedGuests !== null && !isValidGuestsCount(typedGuests, venue.capacity)
  const canBook = quote !== null && !guestsInvalid

  let bookNote: string | null = null
  if (quote === null) {
    if (!showPendingCheckoutHint) bookNote = 'Choose check-in and check-out dates to continue.'
  } else if (guestsInvalid) {
    bookNote = 'Enter a valid number of guests to continue.'
  }

  return (
    <div className={styles.panel}>
      <p className={styles.price}>
        <span className={styles.priceValue}>{formatPrice(venue.pricePerDay)}</span>
        <span className={styles.priceUnit}> / day</span>
      </p>

      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
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
            isDateDisabled={(iso) => isDateInRanges(iso, venue.bookedRanges)}
            describedBy={`${datesHintId} ${datesErrorId}`}
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
            {showPendingCheckoutHint
              ? 'Check-out wasn’t picked, so the dates were cleared.'
              : stayHint(venue.minDays, venue.maxDays)}
          </p>
          <InlineMessage id={datesErrorId} text={rejectionText} />
        </div>

        <div className={styles.fieldGroup}>
          <TextField
            id={guestsId}
            label="Guests"
            inputMode="numeric"
            autoComplete="off"
            value={debouncedGuests.value}
            onChange={(raw) => debouncedGuests.setValue(toDigits(raw))}
            onBlur={debouncedGuests.flush}
            onKeyDown={(event) => {
              if (event.key === 'Enter') debouncedGuests.flush()
            }}
            placeholder={`1–${venue.capacity}`}
            hint={`Whole space, up to ${venue.capacity} guests`}
            describedBy={guestsErrorId}
            invalid={guestsErrorText !== ''}
          />
          <InlineMessage id={guestsErrorId} text={guestsErrorText} />
        </div>
      </div>

      {quote !== null && (
        <dl className={styles.breakdown}>
          <div className={styles.breakdownRow}>
            <dt>
              {formatPrice(quote.pricePerDay)} × {daysLabel(quote.days)}
            </dt>
            <dd>{formatPrice(quote.total)}</dd>
          </div>
          <div className={styles.totalRow}>
            <dt>Total</dt>
            <dd>{formatPrice(quote.total)}</dd>
          </div>
        </dl>
      )}

      {canBook ? (
        <Link
          to={{
            pathname: `/venue/${venue.slug}/book`,
            search: toSearchParams({ checkIn, checkOut, guests }, constraints).toString(),
          }}
          className={buttonClass({ size: 'large', block: true })}
        >
          Continue to booking
        </Link>
      ) : (
        <>
          <button
            type="button"
            className={buttonClass({ size: 'large', block: true })}
            aria-disabled="true"
            aria-describedby={bookNote !== null ? `${uid}-book-note` : undefined}
          >
            Continue to booking
          </button>
          {bookNote !== null && (
            <p id={`${uid}-book-note`} className={styles.hint}>
              {bookNote}
            </p>
          )}
        </>
      )}

      <p className={styles.demoNote}>
        <InfoIcon />
        Demo booking: nothing is reserved or charged.
      </p>
    </div>
  )
}
