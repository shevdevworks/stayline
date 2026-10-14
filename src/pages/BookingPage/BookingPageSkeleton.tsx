import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './BookingPageSkeleton.module.css'

export function BookingPageSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading booking form…
      </p>

      <div className={styles.page} aria-hidden="true">
        <Skeleton className={styles.backLink} />
        <Skeleton className={styles.title} />
        <Skeleton className={styles.stepper} />
        <div className={styles.layout}>
          <Skeleton variant="block" className={styles.form} />
          <Skeleton variant="block" className={styles.summary} />
        </div>
      </div>
    </div>
  )
}
