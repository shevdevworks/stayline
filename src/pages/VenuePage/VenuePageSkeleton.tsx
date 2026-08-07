import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './VenuePageSkeleton.module.css'

export function VenuePageSkeleton() {
  return (
    <div aria-busy="true">
      <p className={styles.srOnly}>Loading venue…</p>

      <div className={styles.page} aria-hidden="true">
        <Skeleton className={styles.backLink} />

        <div className={styles.layout}>
          <div className={styles.content}>
            <Skeleton className={styles.title} />
            <Skeleton className={styles.meta} />

            <Skeleton variant="block" />

            <div className={styles.textBlock}>
              <Skeleton />
              <Skeleton />
              <Skeleton className={styles.textLineShort} />
            </div>
          </div>

          <Skeleton variant="block" className={styles.sidebar} />
        </div>
      </div>
    </div>
  )
}
