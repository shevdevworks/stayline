import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon'
import styles from './BookingPage.module.css'

export interface BookingFieldErrorProps {
  id: string
  message?: string
}

// Renders even with no message: describedBy on the field it belongs to
// points at this id unconditionally, so the paragraph must exist before
// there's anything to say.
export function BookingFieldError({ id, message }: BookingFieldErrorProps) {
  return (
    <p id={id} className={styles.fieldError} aria-live="polite">
      {message && (
        <>
          <span className={styles.warningIcon}>
            <AlertTriangleIcon />
          </span>{' '}
          {message}
        </>
      )}
    </p>
  )
}
