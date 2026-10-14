import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './VenueCardSkeleton.module.css'

export function VenueCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <Skeleton variant="block" className={styles.media} />
      <div className={styles.body}>
        <Skeleton className={styles.eyebrow} />
        <Skeleton className={styles.title} />
        <Skeleton className={styles.facts} />
        <div className={styles.footer}>
          <Skeleton className={styles.price} />
          <Skeleton className={styles.button} />
        </div>
      </div>
    </div>
  )
}
