import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeftIcon, InfoIcon } from '@/components/icons/Icons'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import { VenueLoadError } from '@/components/VenueLoadError/VenueLoadError'
import { VenueNotFound } from '@/components/VenueNotFound/VenueNotFound'
import { submissionErrorText } from '@/features/booking/errorText'
import type { BookingFieldName, BookingStep } from '@/features/booking/types'
import { useBookingForm } from '@/features/booking/useBookingForm'
import { useAnnouncedMessage } from '@/hooks/useAnnouncedMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useVenue } from '@/hooks/useVenue'
import type { VenueWithAvailability } from '@/types'
import { BookingFieldError } from './BookingFieldError'
import { BookingPageSkeleton } from './BookingPageSkeleton'
import { BookingStepContacts } from './BookingStepContacts'
import { BookingStepDates } from './BookingStepDates'
import { BookingStepper } from './BookingStepper'
import { BookingStepReview } from './BookingStepReview'
import { BookingSuccess } from './BookingSuccess'
import { BookingSummary } from './BookingSummary'
import styles from './BookingPage.module.css'

// Where a step transition (or a rejected Continue/Confirm) should send
// focus once the next render lands. The handler can't move focus itself: on
// a step change the old step unmounts and the browser drops focus onto
// <body> before the new step's heading exists. Recording an intent and
// consuming it from an effect lets the DOM catch up first.
type FocusIntent = { type: 'heading' } | { type: 'field'; field: BookingFieldName }

interface BookingFormProps {
  venue: VenueWithAvailability
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
    goToStep,
    submission,
    submit,
  } = useBookingForm({
    minDays: venue.minDays,
    maxDays: venue.maxDays,
    capacity: venue.capacity,
    bookedRanges: venue.bookedRanges,
  })

  const [searchParams] = useSearchParams()

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

  // No dependency array on purpose: a rejected Continue on already-touched
  // fields leaves the reducer state unchanged, so the only render comes
  // from announceRejection — this has to run after every render to catch
  // it. The ref check keeps it a no-op otherwise.
  useEffect(() => {
    const intent = focusIntentRef.current
    if (intent === null) return
    focusIntentRef.current = null
    if (intent.type === 'heading') headingRef.current?.focus()
    else fieldRefs[intent.field].current?.focus()
  })

  // Success is terminal and replaces the form; its heading is in the DOM
  // by the time this runs.
  useEffect(() => {
    if (submission.type === 'success') headingRef.current?.focus()
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
    const attempt = submit(slug)
    if (attempt.type === 'invalid') {
      handleRejection(attempt.field)
    } else if (attempt.type === 'started') {
      announceRejection('')
      setSubmissionAttempt((value) => value + 1)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submission.type === 'submitting') return
    if (step === 3) handleConfirm()
    else handleNext()
  }

  function handleBack() {
    goBack()
    focusIntentRef.current = { type: 'heading' }
    announceRejection('')
  }

  function handleEdit(target: BookingStep) {
    goToStep(target)
    focusIntentRef.current = { type: 'heading' }
    announceRejection('')
  }

  if (submission.type === 'success') {
    return (
      <div className={styles.page}>
        <BookingSuccess confirmation={submission.confirmation} venue={venue} headingRef={headingRef} />
      </div>
    )
  }

  const isSubmitting = submission.type === 'submitting'
  const venueSearch = new URLSearchParams()
  for (const key of ['check-in', 'check-out', 'guests']) {
    const value = searchParams.get(key)
    if (value !== null) venueSearch.set(key, value)
  }

  return (
    <div className={styles.page}>
      <Link to={{ pathname: `/venue/${slug}`, search: venueSearch.toString() }} className={styles.backLink}>
        <ArrowLeftIcon />
        Back to {venue.name}
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Request a booking</h1>
        <p className={styles.demoBanner}>
          <InfoIcon />
          <span>
            <strong>Demo booking.</strong> Nothing is reserved, charged or emailed.
          </span>
        </p>
      </header>

      <BookingStepper step={step} />

      <div className={styles.layout}>
        <form className={styles.formCard} noValidate onSubmit={handleSubmit} aria-busy={isSubmitting || undefined}>
          <BookingFieldError id={formMessageId} message={rejectionText || undefined} />

          {/* Keyed by step so each step enters with a short transition; it
              does not replay while typing inside a step. */}
          <div key={step} className={styles.stepPanel}>
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
                onEdit={handleEdit}
                headingRef={headingRef}
                agreementFieldRef={agreementFieldRef}
              />
            )}
          </div>

          <div className={styles.submissionError}>
            {/* Stays mounted across submission states so the live region
                exists before its text changes; the word joiner toggled by
                attempt parity makes a repeated identical failure re-announce
                without changing what's visible. */}
            <BookingFieldError
              id={submissionErrorId}
              message={
                submission.type === 'error'
                  ? submissionErrorText(submission.code) + (submissionAttempt % 2 === 1 ? '⁠' : '')
                  : undefined
              }
            />
            {submission.type === 'error' && submission.code === 'unavailable' && (
              <button type="button" className={buttonClass({ variant: 'secondary', size: 'small' })} onClick={() => handleEdit(1)}>
                Edit dates
              </button>
            )}
          </div>

          <div className={styles.actions}>
            {step > 1 && (
              <button
                type="button"
                className={buttonClass({ variant: 'secondary', size: 'large' })}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className={buttonClass({ size: 'large', className: styles.primaryAction })}
              aria-disabled={isSubmitting || undefined}
            >
              {step < 3 ? 'Continue' : isSubmitting ? 'Confirming…' : submission.type === 'error' && submission.code === 'network' ? 'Try again' : 'Confirm demo booking'}
              {isSubmitting && <span className={styles.spinner} aria-hidden="true" />}
            </button>
          </div>
        </form>

        <BookingSummary venue={venue} draft={draft} />
      </div>
    </div>
  )
}

export function BookingPage() {
  const { slug } = useParams<{ slug: string }>()
  const venue = useVenue(slug ?? '')

  useDocumentTitle(venue.status === 'success' ? `Book ${venue.data.name} · Stayline` : null)

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
