import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import styles from './VenuePageSkeleton.module.css'

export function VenuePageSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading space…
      </p>

      <div className={styles.page} aria-hidden="true">
        <Skeleton className={styles.backLink} />
        <div className={styles.hero}>
          <Skeleton className={styles.eyebrow} />
          <Skeleton className={styles.title} />
          <Skeleton className={styles.meta} />
        </div>

        <div className={styles.layout}>
          <div className={styles.content}>
            <Skeleton variant="block" />
            <div className={styles.thumbs}>
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} variant="block" className={styles.thumb} />
              ))}
            </div>
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
