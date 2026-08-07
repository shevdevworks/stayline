import { useId, type RefObject } from 'react'
import { TextArea } from '@/components/ui/TextArea/TextArea'
import { TextField } from '@/components/ui/TextField/TextField'
import { bookingErrorText } from '@/features/booking/errorText'
import type { BookingSetFieldPayload } from '@/features/booking/formState'
import type { BookingDraft, BookingFieldName, BookingValidationConstraints } from '@/features/booking/types'
import type { BookingFieldErrors } from '@/features/booking/validation'
import { BookingFieldError } from './BookingFieldError'
import styles from './BookingPage.module.css'

export interface BookingStepContactsProps {
  draft: BookingDraft
  errors: BookingFieldErrors
  constraints: BookingValidationConstraints
  setField: (payload: BookingSetFieldPayload) => void
  blurField: (field: BookingFieldName) => void
  headingRef: RefObject<HTMLHeadingElement | null>
  nameFieldRef: RefObject<HTMLInputElement | null>
  emailFieldRef: RefObject<HTMLInputElement | null>
  phoneFieldRef: RefObject<HTMLInputElement | null>
}

export function BookingStepContacts({
  draft,
  errors,
  constraints,
  setField,
  blurField,
  headingRef,
  nameFieldRef,
  emailFieldRef,
  phoneFieldRef,
}: BookingStepContactsProps) {
  const uid = useId()
  const nameId = `${uid}-name`
  const nameErrorId = `${nameId}-error`
  const emailId = `${uid}-email`
  const emailErrorId = `${emailId}-error`
  const phoneId = `${uid}-phone`
  const phoneErrorId = `${phoneId}-error`
  const commentId = `${uid}-comment`

  return (
    <div className={styles.step}>
      <h2 ref={headingRef} tabIndex={-1} className={styles.stepHeading}>
        Contact details
      </h2>

      <TextField
        id={nameId}
        ref={nameFieldRef}
        label="Name"
        value={draft.name ?? ''}
        onChange={(value) => setField({ field: 'name', value })}
        onBlur={() => blurField('name')}
        describedBy={errors.name ? nameErrorId : undefined}
        invalid={errors.name !== undefined}
      />
      <BookingFieldError
        id={nameErrorId}
        message={errors.name ? bookingErrorText({ field: 'name', code: errors.name }, constraints) : undefined}
      />

      <TextField
        id={emailId}
        ref={emailFieldRef}
        label="Email"
        type="text"
        inputMode="email"
        value={draft.email ?? ''}
        onChange={(value) => setField({ field: 'email', value })}
        onBlur={() => blurField('email')}
        describedBy={errors.email ? emailErrorId : undefined}
        invalid={errors.email !== undefined}
      />
      <BookingFieldError
        id={emailErrorId}
        message={errors.email ? bookingErrorText({ field: 'email', code: errors.email }, constraints) : undefined}
      />

      <TextField
        id={phoneId}
        ref={phoneFieldRef}
        label="Phone"
        type="text"
        inputMode="tel"
        value={draft.phone ?? ''}
        onChange={(value) => setField({ field: 'phone', value })}
        onBlur={() => blurField('phone')}
        describedBy={errors.phone ? phoneErrorId : undefined}
        invalid={errors.phone !== undefined}
      />
      <BookingFieldError
        id={phoneErrorId}
        message={errors.phone ? bookingErrorText({ field: 'phone', code: errors.phone }, constraints) : undefined}
      />

      <TextArea
        id={commentId}
        label="Comment"
        value={draft.comment ?? ''}
        onChange={(value) => setField({ field: 'comment', value })}
        hint="Optional — anything the venue should know ahead of your booking."
      />
    </div>
  )
}
