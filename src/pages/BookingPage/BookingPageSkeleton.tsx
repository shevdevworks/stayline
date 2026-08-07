import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './BookingPageSkeleton.module.css'

export function BookingPageSkeleton() {
  return (
    <div aria-busy="true">
      <p className={styles.srOnly}>Loading booking form…</p>

      <div className={styles.page} aria-hidden="true">
        <Skeleton className={styles.title} />
        <Skeleton variant="block" className={styles.form} />
      </div>
    </div>
  )
}
