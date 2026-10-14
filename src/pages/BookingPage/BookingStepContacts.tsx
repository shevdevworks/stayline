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

// Contact details live only in React state for this tab: never in the URL
// (which carries just dates and guests) and never in storage.
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
        Your details
      </h2>
      <p className={styles.stepIntro}>
        Used only to fill in this demo summary. Nothing is sent anywhere or saved after you close the tab.
      </p>

      <div className={styles.fieldGroup}>
        <TextField
          id={nameId}
          ref={nameFieldRef}
          label="Full name"
          name="name"
          autoComplete="name"
          required
          value={draft.name ?? ''}
          onChange={(value) => setField({ field: 'name', value })}
          onBlur={() => blurField('name')}
          describedBy={nameErrorId}
          invalid={errors.name !== undefined}
        />
        <BookingFieldError
          id={nameErrorId}
          message={errors.name ? bookingErrorText({ field: 'name', code: errors.name }, constraints) : undefined}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <TextField
            id={emailId}
            ref={emailFieldRef}
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            value={draft.email ?? ''}
            onChange={(value) => setField({ field: 'email', value })}
            onBlur={() => blurField('email')}
            describedBy={emailErrorId}
            invalid={errors.email !== undefined}
          />
          <BookingFieldError
            id={emailErrorId}
            message={errors.email ? bookingErrorText({ field: 'email', code: errors.email }, constraints) : undefined}
          />
        </div>

        <div className={styles.fieldGroup}>
          <TextField
            id={phoneId}
            ref={phoneFieldRef}
            label="Phone"
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="+31 20 123 4567"
            value={draft.phone ?? ''}
            onChange={(value) => setField({ field: 'phone', value })}
            onBlur={() => blurField('phone')}
            describedBy={phoneErrorId}
            invalid={errors.phone !== undefined}
          />
          <BookingFieldError
            id={phoneErrorId}
            message={errors.phone ? bookingErrorText({ field: 'phone', code: errors.phone }, constraints) : undefined}
          />
        </div>
      </div>

      <TextArea
        id={commentId}
        label="Note for the host (optional)"
        value={draft.comment ?? ''}
        onChange={(value) => setField({ field: 'comment', value })}
        hint="Setup needs, arrival time, anything worth knowing."
        rows={3}
      />
    </div>
  )
}
