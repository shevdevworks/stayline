import { useEffect, useId, useRef, useState, type RefObject } from 'react'
import { useParams } from 'react-router-dom'
import { VenueLoadError } from '@/components/VenueLoadError/VenueLoadError'
import { VenueNotFound } from '@/components/VenueNotFound/VenueNotFound'
import { submissionErrorText } from '@/features/booking/errorText'
import { BOOKING_STEP_ORDER } from '@/features/booking/types'
import type { BookingFieldName } from '@/features/booking/types'
import { useBookingForm } from '@/features/booking/useBookingForm'
import { useAnnouncedMessage } from '@/hooks/useAnnouncedMessage'
import { useVenue } from '@/hooks/useVenue'
import type { VenueDetail } from '@/types'
import { BookingFieldError } from './BookingFieldError'
import { BookingPageSkeleton } from './BookingPageSkeleton'
import { BookingStepContacts } from './BookingStepContacts'
import { BookingStepDates } from './BookingStepDates'
import { BookingStepReview } from './BookingStepReview'
import { BookingSuccess } from './BookingSuccess'
import styles from './BookingPage.module.css'

// Where a step transition (or a rejected "Next"/"Confirm booking") should
// send focus once the next render lands. The handler that decides this can't
// move focus itself: on a step change, the old step's markup unmounts and the
// browser synchronously drops focus onto <body> before the new step's own
// heading exists in the DOM. Recording an intent and consuming it from an
// effect (below) lets the DOM catch up first — same reasoning as Calendar's
// keyboardMoveRef.
type FocusIntent = { type: 'heading' } | { type: 'field'; field: BookingFieldName }

interface BookingFormProps {
  venue: VenueDetail
  slug: string
}

function BookingForm({ venue, slug }: BookingFormProps) {
  const {
    draft,
    step,
    errors,
    constraints,
    setField,
    setDateRange,
    blurField,
    goBack,
    goNext,
    submission,
    submit,
  } = useBookingForm({
    minDays: venue.minDays,
    maxDays: venue.maxDays,
    capacity: venue.capacity,
  })

  const headingRef = useRef<HTMLHeadingElement>(null)
  const dateFieldRef = useRef<HTMLButtonElement>(null)
  const guestsFieldRef = useRef<HTMLInputElement>(null)
  const nameFieldRef = useRef<HTMLInputElement>(null)
  const emailFieldRef = useRef<HTMLInputElement>(null)
  const phoneFieldRef = useRef<HTMLInputElement>(null)
  const agreementFieldRef = useRef<HTMLInputElement>(null)

  const fieldRefs: Record<BookingFieldName, RefObject<HTMLElement | null>> = {
    checkIn: dateFieldRef,
    checkOut: dateFieldRef,
    guests: guestsFieldRef,
    name: nameFieldRef,
    email: emailFieldRef,
    phone: phoneFieldRef,
    agreement: agreementFieldRef,
  }

  const focusIntentRef = useRef<FocusIntent | null>(null)
  const [submissionAttempt, setSubmissionAttempt] = useState(0)
  const [rejectionText, announceRejection] = useAnnouncedMessage()
  const formMessageId = useId()
  const submissionErrorId = useId()

  // No dependency array: a rejected "Next"/"Confirm booking" on fields that
  // were already touched leaves useBookingForm's state reference unchanged
  // (the reducer bails out), so a [step]-keyed effect would never fire for
  // it. The render that does happen in that case comes from announceRejection
  // itself (its own useState, called right below in the same handler) — this
  // effect has to run after every render to catch that one too. The ref-read
  // at the top keeps it a no-op otherwise.
  useEffect(() => {
    const intent = focusIntentRef.current
    if (intent === null) return
    focusIntentRef.current = null
    if (intent.type === 'heading') headingRef.current?.focus()
    else fieldRefs[intent.field].current?.focus()
  })

  // submission only gets a new object identity on an actual reducer
  // transition (setField/setDateRange preserve it unless resetting an
  // 'error' back to 'idle' — see formState.ts), so depending on the object
  // itself is enough to fire exactly once per transition. Success is a
  // terminal state (isBlocked freezes everything after it), so this can't
  // re-fire once entered. Error needs no handling here — see the comment by
  // the submissionError block below for why.
  useEffect(() => {
    if (submission.type === 'success') {
      focusIntentRef.current = { type: 'heading' }
    }
  }, [submission])

  function handleRejection(field: BookingFieldName) {
    focusIntentRef.current = { type: 'field', field }
    announceRejection('Some fields need your attention before you can continue.')
  }

  function handleNext() {
    const result = goNext()
    if (result.ok) {
      focusIntentRef.current = { type: 'heading' }
      announceRejection('')
    } else {
      handleRejection(result.firstInvalidField)
    }
  }

  function handleConfirm() {
    const result = goNext()
    if (result.ok) {
      announceRejection('')
      setSubmissionAttempt((attempt) => attempt + 1)
      submit(slug)
    } else {
      handleRejection(result.firstInvalidField)
    }
  }

  function handleRetry() {
    setSubmissionAttempt((attempt) => attempt + 1)
    submit(slug)
  }

  function handleBack() {
    goBack()
    focusIntentRef.current = { type: 'heading' }
    announceRejection('')
  }

  if (submission.type === 'success') {
    return <BookingSuccess confirmation={submission.confirmation} venue={venue} headingRef={headingRef} />
  }

  return (
    <div className={styles.page}>
      <h1>{venue.name}</h1>
      <p className={styles.stepIndicator}>
        Step {step} of {BOOKING_STEP_ORDER.length}
      </p>
      <BookingFieldError id={formMessageId} message={rejectionText || undefined} />

      {step === 1 && (
        <BookingStepDates
          draft={draft}
          errors={errors}
          constraints={constraints}
          setField={setField}
          setDateRange={setDateRange}
          blurField={blurField}
          headingRef={headingRef}
          dateFieldRef={dateFieldRef}
          guestsFieldRef={guestsFieldRef}
        />
      )}
      {step === 2 && (
        <BookingStepContacts
          draft={draft}
          errors={errors}
          constraints={constraints}
          setField={setField}
          blurField={blurField}
          headingRef={headingRef}
          nameFieldRef={nameFieldRef}
          emailFieldRef={emailFieldRef}
          phoneFieldRef={phoneFieldRef}
        />
      )}
      {step === 3 && (
        <BookingStepReview
          venue={venue}
          draft={draft}
          errors={errors}
          constraints={constraints}
          setField={setField}
          blurField={blurField}
          headingRef={headingRef}
          agreementFieldRef={agreementFieldRef}
        />
      )}

      <div className={styles.actions}>
        {step > 1 && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleBack}
            disabled={submission.type === 'submitting'}
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" className={styles.primaryButton} onClick={handleNext}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleConfirm}
            disabled={submission.type === 'submitting'}
          >
            {submission.type === 'submitting' ? 'Sending…' : 'Confirm booking'}
          </button>
        )}
      </div>

      <div className={styles.submissionError}>
        {/* Stays mounted regardless of submission state (same reasoning as
            BookingFieldError's own doc comment for the banner above): a
            screen reader announces mutations to a live region that already
            existed, not one inserted into the DOM already containing text.
            Try again drives submission through 'submitting', which used to
            unmount this whole block and remount it fresh on the next
            failure — the live region was reborn with its content already
            in place, so nothing was ever announced regardless of the text.
            aria-live also only re-announces when the text actually changes,
            so a second failure with the same code needs its text to differ
            too — a word joiner toggled by attempt parity is silent and
            invisible, forcing that without touching the visible message or
            the top rejection banner (reserved for goNext rejections). */}
        <BookingFieldError
          id={submissionErrorId}
          message={
            submission.type === 'error'
              ? submissionErrorText(submission.code) + (submissionAttempt % 2 === 1 ? '⁠' : '')
              : undefined
          }
        />
        {submission.type === 'error' && submission.code === 'network' && (
          <button type="button" className={styles.secondaryButton} onClick={handleRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export function BookingPage() {
  const { slug } = useParams<{ slug: string }>()
  const venue = useVenue(slug ?? '')

  if (venue.status === 'loading') {
    return <BookingPageSkeleton />
  }

  if (venue.status === 'not-found') {
    return <VenueNotFound />
  }

  if (venue.status === 'error') {
    return <VenueLoadError onRetry={venue.refetch} />
  }

  return <BookingForm venue={venue.data} slug={slug ?? ''} />
}
