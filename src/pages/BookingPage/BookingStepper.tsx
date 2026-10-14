import { CheckIcon } from '@/components/icons/Icons'
import { BOOKING_STEP_ORDER } from '@/features/booking/types'
import type { BookingStep } from '@/features/booking/types'
import styles from './BookingPage.module.css'

const BOOKING_STEP_LABELS: Record<BookingStep, string> = {
  1: 'Dates and guests',
  2: 'Your details',
  3: 'Review',
}

export function BookingStepper({ step }: { step: BookingStep }) {
  const currentIndex = BOOKING_STEP_ORDER.indexOf(step)

  return (
    <ol className={styles.stepper} aria-label="Booking progress">
      {BOOKING_STEP_ORDER.map((item, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li
            key={item}
            className={styles.stepperItem}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.stepperMarker} aria-hidden="true">
              {state === 'done' ? <CheckIcon /> : index + 1}
            </span>
            <span className={styles.stepperLabel}>
              <span className="sr-only">
                Step {index + 1} of {BOOKING_STEP_ORDER.length}:{' '}
              </span>
              {BOOKING_STEP_LABELS[item]}
              {state === 'done' && <span className="sr-only"> (completed)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
