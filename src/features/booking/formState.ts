import { BOOKING_STEP_FIELDS, BOOKING_STEP_ORDER } from './types'
import type {
  BookingConfirmation,
  BookingDraft,
  BookingFieldName,
  BookingStep,
  BookingSubmission,
  BookingSubmissionErrorCode,
  BookingValidationConstraints,
} from './types'
import { validateStep } from './validation'

export type BookingTouched = Record<BookingFieldName, boolean>

export interface BookingFormState {
  draft: BookingDraft
  touched: BookingTouched
  step: BookingStep
  submission: BookingSubmission
}

// Pairs each BookingDraft key with its own value type, then unions over the
// keys — this is what lets setField accept any draft field without widening
// `value` to `string | boolean | undefined` and losing the link to `field`.
// -? strips the optionality that mapped types otherwise copy from each
// BookingDraft property onto the corresponding union member itself — without
// it, indexing by keyof BookingDraft would pull `undefined` into the whole
// payload type. It does nothing to `value`: the mapped type's template is an
// object literal, not BookingDraft[K] itself, so -? has no optional
// property there to strip. NonNullable<BookingDraft[K]> is what removes the
// `undefined` that optional draft fields would otherwise carry into value.
// Exported so useBookingForm's setField can take this union as its single
// argument instead of a generic <K> field/value pair that loses correlation
// whenever K isn't inferred from a literal at the call site.
export type BookingSetFieldPayload = {
  [K in keyof BookingDraft]-?: { field: K; value: NonNullable<BookingDraft[K]> }
}[keyof BookingDraft]

// Intersecting the literal discriminant with the payload union — rather
// than embedding `type: 'setField'` inside the mapped type's own template —
// still distributes into a per-field discriminated union for narrowing
// purposes (see updateDraftField below): TypeScript builds an intersection
// of a plain object type with a union of object types as the union of the
// pairwise intersections, not as one flattened shape with `value` widened.
type SetFieldAction = { type: 'setField' } & BookingSetFieldPayload

// checkIn and checkOut are written together so a partial pair (new checkIn,
// stale checkOut) never exists as a committed state, not even for one
// render between two setField dispatches.
interface SetDateRangeAction {
  type: 'setDateRange'
  checkIn: string | undefined
  checkOut: string | undefined
}

interface BlurFieldAction {
  type: 'blurField'
  field: BookingFieldName
}

interface NextAction {
  type: 'next'
  constraints: BookingValidationConstraints
}

interface BackAction {
  type: 'back'
}

interface SubmitStartedAction {
  type: 'submitStarted'
}

interface SubmitSucceededAction {
  type: 'submitSucceeded'
  confirmation: BookingConfirmation
}

interface SubmitFailedAction {
  type: 'submitFailed'
  code: BookingSubmissionErrorCode
}

export type BookingFormAction =
  | SetFieldAction
  | SetDateRangeAction
  | BlurFieldAction
  | NextAction
  | BackAction
  | SubmitStartedAction
  | SubmitSucceededAction
  | SubmitFailedAction

const ALL_FIELDS_UNTOUCHED: BookingTouched = {
  checkIn: false,
  checkOut: false,
  guests: false,
  name: false,
  email: false,
  phone: false,
  agreement: false,
}

export function createInitialFormState(draft: BookingDraft): BookingFormState {
  return { draft, touched: { ...ALL_FIELDS_UNTOUCHED }, step: 1, submission: { type: 'idle' } }
}

// Switching on action.field narrows the whole SetFieldAction union
// member-wise, so action.value comes out correctly typed in every branch —
// no cast needed.
function updateDraftField(draft: BookingDraft, action: SetFieldAction): BookingDraft {
  switch (action.field) {
    case 'checkIn':
      return { ...draft, checkIn: action.value }
    case 'checkOut':
      return { ...draft, checkOut: action.value }
    case 'guests':
      return { ...draft, guests: action.value }
    case 'name':
      return { ...draft, name: action.value }
    case 'email':
      return { ...draft, email: action.value }
    case 'phone':
      return { ...draft, phone: action.value }
    case 'comment':
      return { ...draft, comment: action.value }
    case 'agreement':
      return { ...draft, agreement: action.value }
  }
}

// No step + 1 arithmetic — the neighbor is whatever sits at the adjacent
// index in BOOKING_STEP_ORDER, clamped at the ends.
function stepByOffset(step: BookingStep, offset: 1 | -1): BookingStep {
  const index = BOOKING_STEP_ORDER.indexOf(step)
  const target = index + offset
  if (target < 0 || target >= BOOKING_STEP_ORDER.length) return step
  return BOOKING_STEP_ORDER[target]
}

function markStepFieldsTouched(touched: BookingTouched, fields: readonly BookingFieldName[]): BookingTouched {
  let changed = false
  const next = { ...touched }
  for (const field of fields) {
    if (!next[field]) {
      next[field] = true
      changed = true
    }
  }
  return changed ? next : touched
}

// Locks the form while a request is in flight and freezes it once a request
// has succeeded; also drops submitSucceeded/submitFailed that arrive while
// nothing is in flight, since those belong to a request this state no
// longer recognizes (a stale or duplicate result). submitStarted itself is
// exempt from the submitting branch on purpose — that's what gates the
// double-click case below.
function isBlocked(submission: BookingSubmission, action: BookingFormAction): boolean {
  if (submission.type === 'success') return true
  if (submission.type === 'submitting') return action.type !== 'submitSucceeded' && action.type !== 'submitFailed'
  return action.type === 'submitSucceeded' || action.type === 'submitFailed'
}

export function bookingFormReducer(state: BookingFormState, action: BookingFormAction): BookingFormState {
  if (isBlocked(state.submission, action)) return state

  switch (action.type) {
    case 'setField': {
      const draft = updateDraftField(state.draft, action)
      if (state.submission.type === 'error') return { ...state, draft, submission: { type: 'idle' } }
      return { ...state, draft }
    }

    case 'setDateRange': {
      if (state.draft.checkIn === action.checkIn && state.draft.checkOut === action.checkOut) return state
      const draft = { ...state.draft, checkIn: action.checkIn, checkOut: action.checkOut }
      if (state.submission.type === 'error') return { ...state, draft, submission: { type: 'idle' } }
      return { ...state, draft }
    }

    case 'blurField':
      if (state.touched[action.field]) return state
      return { ...state, touched: { ...state.touched, [action.field]: true } }

    case 'next': {
      const fields = BOOKING_STEP_FIELDS[state.step]
      const touched = markStepFieldsTouched(state.touched, fields)
      const errors = validateStep(state.step, state.draft, action.constraints)
      if (Object.keys(errors).length > 0) {
        return touched === state.touched ? state : { ...state, touched }
      }
      const next = stepByOffset(state.step, 1)
      if (next === state.step) {
        return touched === state.touched ? state : { ...state, touched }
      }
      return { ...state, touched, step: next }
    }

    case 'back': {
      const prev = stepByOffset(state.step, -1)
      return prev === state.step ? state : { ...state, step: prev }
    }

    case 'submitStarted':
      return { ...state, submission: { type: 'submitting' } }

    case 'submitSucceeded':
      return { ...state, submission: { type: 'success', confirmation: action.confirmation } }

    case 'submitFailed':
      return { ...state, submission: { type: 'error', code: action.code } }
  }
}
