import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookingInvalidError, BookingUnavailableError, submitBooking } from '@/api'
import { todayIso } from '@/lib/date/isoDate'
import { parseBookingParams, toSearchParams } from './bookingParams'
import { bookingFormReducer, createInitialFormState } from './formState'
import type { BookingSetFieldPayload, BookingTouched } from './formState'
import { parseDraft, toBookingRequest, validateStep } from './validation'
import type { BookingFieldErrors } from './validation'
import { bookingParamsEqual, resultsToBookingParams } from './formUrl'
import { createSubmissionGuard } from './submissionGuard'
import { BOOKING_STEP_FIELDS } from './types'
import type {
  BookingConstraints,
  BookingDraft,
  BookingFieldName,
  BookingParams,
  BookingStep,
  BookingSubmission,
  BookingValidationConstraints,
} from './types'

export interface UseBookingFormResult {
  draft: BookingDraft
  step: BookingStep
  touched: BookingTouched
  errors: BookingFieldErrors
  constraints: BookingValidationConstraints
  submission: BookingSubmission
  setField: (payload: BookingSetFieldPayload) => void
  setDateRange: (checkIn: string | undefined, checkOut: string | undefined) => void
  blurField: (field: BookingFieldName) => void
  goBack: () => void
  goNext: () => { ok: true } | { ok: false; firstInvalidField: BookingFieldName }
  goToStep: (step: BookingStep) => void
  submit: (slug: string) => SubmitAttempt
}

// What a Confirm click led to, decided synchronously before any request:
// 'invalid' carries where the first problem is so the page can move focus.
export type SubmitAttempt =
  | { type: 'started' }
  | { type: 'ignored' }
  | { type: 'invalid'; step: BookingStep; field: BookingFieldName }

// URL -> draft: parseBookingParams already collapsed anything invalid to
// null, so a missing/garbage param correctly becomes an empty draft field
// here rather than carrying junk in.
function paramsToDraft(params: BookingParams): BookingDraft {
  return {
    checkIn: params.checkIn ?? undefined,
    checkOut: params.checkOut ?? undefined,
    guests: params.guests !== null ? String(params.guests) : undefined,
  }
}

// Same generic-K shape as validation.ts's own pickFields — needed so
// `result[field] = errors[field]` type-checks against BookingFieldErrors'
// per-key mapped type instead of a plain BookingFieldName union.
function pickTouchedErrors<K extends BookingFieldName>(
  errors: BookingFieldErrors,
  fields: readonly K[],
  touched: BookingTouched,
): Pick<BookingFieldErrors, K> {
  const result = {} as Pick<BookingFieldErrors, K>
  for (const field of fields) {
    if (touched[field] && errors[field] !== undefined) result[field] = errors[field]
  }
  return result
}

export function useBookingForm(constraints: BookingConstraints): UseBookingFormResult {
  const [searchParams, setSearchParams] = useSearchParams()

  // The only place in this module that reads the current date — same idiom
  // as useDateRangePicker's useMemo(() => todayIso(), []), and the empty
  // deps array is honest here too: todayIso() depends on nothing.
  const today = useMemo(() => todayIso(), [])

  // constraints arrives as a fresh object identity from the caller on every
  // render, so depending on it directly would rebuild this object (and
  // re-trigger the URL-sync effect below, which depends on it) on every
  // render even when the actual values haven't changed. Depending on its
  // three primitive fields instead keeps identity stable across renders
  // where minDays/maxDays/capacity stay the same.
  const constraintsWithToday = useMemo<BookingValidationConstraints>(
    () => ({
      minDays: constraints.minDays,
      maxDays: constraints.maxDays,
      capacity: constraints.capacity,
      bookedRanges: constraints.bookedRanges,
      today,
    }),
    [constraints.minDays, constraints.maxDays, constraints.capacity, constraints.bookedRanges, today],
  )

  // The initializer runs exactly once on mount regardless of later
  // searchParams identity changes — this is the one point where the URL is
  // read into the draft.
  const [state, dispatch] = useReducer(
    bookingFormReducer,
    searchParams,
    (initialSearchParams: URLSearchParams) =>
      createInitialFormState(paramsToDraft(parseBookingParams(initialSearchParams, constraints, today))),
  )

  // Starts unseeded; the first effect run below seeds it from that run's own
  // projection and returns before ever calling setSearchParams, so mount —
  // including a direct visit to someone else's link — never triggers an
  // immediate write. Lazy null-seeding (instead of calling parseDraft in the
  // useRef initializer) avoids running parseDraft on every render just to
  // produce a value React discards after mount.
  const lastEmittedRef = useRef<BookingParams | null>(null)

  // A flag rather than AbortSignal: submitBooking has no way to guarantee
  // the server never saw the request, so aborting on unmount would risk
  // silently dropping a booking that actually went through. Ignoring a late
  // result instead of cancelling it keeps that possibility honest. The
  // body sets it back to true on every run, not just at declaration —
  // StrictMode's mount/cleanup/remount in dev would otherwise leave it
  // false forever after the first cleanup.
  const mountedRef = useRef(true)
  const [submissionGuard] = useState(createSubmissionGuard)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const projection = resultsToBookingParams(parseDraft(state.draft, constraintsWithToday))
    if (lastEmittedRef.current === null) {
      lastEmittedRef.current = projection
      return
    }
    if (bookingParamsEqual(projection, lastEmittedRef.current)) return
    lastEmittedRef.current = projection

    setSearchParams(
      (prev) => {
        // toSearchParams always returns a fresh, empty URLSearchParams, so
        // clone prev and only touch the three keys this hook owns —
        // unrelated query params must survive untouched.
        const next = new URLSearchParams(prev)
        next.delete('check-in')
        next.delete('check-out')
        next.delete('guests')
        for (const [key, value] of toSearchParams(projection, constraintsWithToday)) {
          next.set(key, value)
        }
        return next
      },
      { replace: true },
    )
    // state.draft only: blurField/next/back never change the draft
    // reference (see formState.ts), so this effect can't refire from its
    // own write.
  }, [state.draft, constraintsWithToday, setSearchParams])

  const stepErrors = validateStep(state.step, state.draft, constraintsWithToday)
  const errors = pickTouchedErrors(stepErrors, BOOKING_STEP_FIELDS[state.step], state.touched)

  function setField(payload: BookingSetFieldPayload): void {
    dispatch({ type: 'setField', ...payload })
  }

  function setDateRange(checkIn: string | undefined, checkOut: string | undefined): void {
    dispatch({ type: 'setDateRange', checkIn, checkOut })
  }

  function blurField(field: BookingFieldName): void {
    dispatch({ type: 'blurField', field })
  }

  function goBack(): void {
    dispatch({ type: 'back' })
  }

  // Validates the whole draft with the same rules as the steps, then sends
  // it. A click while a request is in flight (or after success) is ignored
  // without touching the API — see submissionGuard.ts for why the reducer
  // state alone can't guarantee that.
  function submit(slug: string): SubmitAttempt {
    if (state.submission.type === 'success' || submissionGuard.inFlight) return { type: 'ignored' }

    const result = toBookingRequest(state.draft, constraintsWithToday)
    if (!result.ok) {
      dispatch({ type: 'showErrors', step: result.firstErrorStep })
      const field = BOOKING_STEP_FIELDS[result.firstErrorStep].find((name) => result.errors[name] !== undefined)
      return { type: 'invalid', step: result.firstErrorStep, field: field ?? BOOKING_STEP_FIELDS[result.firstErrorStep][0] }
    }

    const request = result.request
    const run = submissionGuard.run(async () => {
      dispatch({ type: 'submitStarted' })
      try {
        const confirmation = await submitBooking(slug, request)
        if (mountedRef.current) dispatch({ type: 'submitSucceeded', confirmation })
      } catch (err) {
        if (mountedRef.current) {
          const code =
            err instanceof BookingUnavailableError ? 'unavailable' : err instanceof BookingInvalidError ? 'invalid' : 'network'
          dispatch({ type: 'submitFailed', code })
        }
      }
    })
    return run === null ? { type: 'ignored' } : { type: 'started' }
  }

  function goToStep(step: BookingStep): void {
    dispatch({ type: 'goToStep', step })
  }

  function goNext(): { ok: true } | { ok: false; firstInvalidField: BookingFieldName } {
    const nextStepErrors = validateStep(state.step, state.draft, constraintsWithToday)
    dispatch({ type: 'next', constraints: constraintsWithToday })

    for (const field of BOOKING_STEP_FIELDS[state.step]) {
      if (nextStepErrors[field] !== undefined) return { ok: false, firstInvalidField: field }
    }
    return { ok: true }
  }

  return {
    draft: state.draft,
    step: state.step,
    touched: state.touched,
    errors,
    constraints: constraintsWithToday,
    submission: state.submission,
    setField,
    setDateRange,
    blurField,
    goBack,
    goNext,
    goToStep,
    submit,
  }
}
