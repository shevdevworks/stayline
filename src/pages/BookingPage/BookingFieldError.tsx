import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon'
import styles from './BookingPage.module.css'

export interface BookingFieldErrorProps {
  id: string
  message?: string
}

// Renders even with no message: the field's aria-describedby points at
// this id, and a live region must already exist to be announced when text
// appears. Hidden by CSS (:empty) while there is nothing to say.
export function BookingFieldError({ id, message }: BookingFieldErrorProps) {
  return (
    <p id={id} className={styles.fieldError} aria-live="polite">
      {message && (
        <>
          <span className={styles.warningIcon}>
            <AlertTriangleIcon />
          </span>
          <span>{message}</span>
        </>
      )}
    </p>
  )
}
