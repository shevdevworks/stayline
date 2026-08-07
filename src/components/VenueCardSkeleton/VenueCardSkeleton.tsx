import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './VenueCardSkeleton.module.css'

export function VenueCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <Skeleton variant="block" />
      <div className={styles.body}>
        <Skeleton className={styles.barLg} />
        <Skeleton className={styles.barSm} />
        <div className={styles.statsRow}>
          <Skeleton className={styles.statBar} />
          <Skeleton className={styles.statBar} />
          <Skeleton className={styles.statBar} />
        </div>
      </div>
    </div>
  )
}
