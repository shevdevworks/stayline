import { Link, useLocation } from 'react-router-dom'
import { formatPrice } from '@/lib/price'
import { VENUE_TYPE_LABELS } from '@/types'
import type { VenueSummary } from '@/types'
import styles from './VenueCard.module.css'

export interface VenueCardProps {
  venue: VenueSummary
}

export function VenueCard({ venue }: VenueCardProps) {
  const location = useLocation()

  return (
    <article className={styles.card}>
      <img
        src={venue.coverImage.src}
        alt={venue.coverImage.alt}
        width={1200}
        height={900}
        loading="lazy"
        className={styles.image}
      />
      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link
            to={`/venue/${venue.slug}`}
            state={{ from: `${location.pathname}${location.search}` }}
            className={styles.nameLink}
          >
            {venue.name}
          </Link>
        </h3>
        <p className={styles.meta}>
          {VENUE_TYPE_LABELS[venue.type]} · {venue.city}
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{venue.capacity}</span>
            <span className={styles.statLabel}>guests</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{venue.rating.toFixed(1)}</span>
            <span className={styles.statLabel}>rating</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatPrice(venue.pricePerDay)}</span>
            <span className={styles.statLabel}>per day</span>
          </div>
        </div>
      </div>
    </article>
  )
}
