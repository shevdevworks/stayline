import { Link, useLocation } from 'react-router-dom'
import { StarIcon, UsersIcon } from '@/components/icons/Icons'
import { venueImageSrcSet } from '@/lib/image'
import { formatPrice } from '@/lib/price'
import { VENUE_IMAGE_HEIGHT, VENUE_IMAGE_WIDTH, VENUE_TYPE_LABELS } from '@/types'
import type { VenueSummary } from '@/types'
import styles from './VenueCard.module.css'

export interface VenueCardProps {
  venue: VenueSummary
  // Cards in the first row are likely on screen at load: load them eagerly,
  // and give the very first one fetch priority as the probable LCP image.
  priority?: 'high' | 'eager' | 'lazy'
}

// Two columns from 40rem up, inside a container of at most 1280px with a
// 240px sidebar, so a card never renders wider than ~500 CSS px.
const IMAGE_SIZES = '(min-width: 64rem) 31rem, (min-width: 40rem) 46vw, calc(100vw - 2rem)'

export function VenueCard({ venue, priority = 'lazy' }: VenueCardProps) {
  const location = useLocation()

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img
          src={venue.coverImage.src}
          srcSet={venueImageSrcSet(venue.coverImage)}
          sizes={IMAGE_SIZES}
          alt={venue.coverImage.alt}
          width={VENUE_IMAGE_WIDTH}
          height={VENUE_IMAGE_HEIGHT}
          loading={priority === 'lazy' ? 'lazy' : 'eager'}
          fetchPriority={priority === 'high' ? 'high' : undefined}
          decoding="async"
          className={styles.image}
        />
        <span className={styles.typeBadge}>{VENUE_TYPE_LABELS[venue.type]}</span>
      </div>

      <div className={styles.body}>
        <p className={styles.city}>{venue.city}</p>
        <h3 className={styles.name}>
          <Link
            to={`/venue/${venue.slug}`}
            state={{ from: `${location.pathname}${location.search}` }}
            className={styles.nameLink}
          >
            {venue.name}
          </Link>
        </h3>
        <ul className={styles.facts}>
          <li className={styles.fact}>
            <UsersIcon className={styles.factIcon} />
            Up to {venue.capacity} guests
          </li>
          <li className={styles.fact}>
            <StarIcon className={`${styles.factIcon} ${styles.star}`} />
            <span className="sr-only">Rated </span>
            {venue.rating.toFixed(1)}
            <span className="sr-only"> out of 5</span>
          </li>
        </ul>

        <div className={styles.footer}>
          <p className={styles.price}>
            <span className={styles.priceValue}>{formatPrice(venue.pricePerDay)}</span>
            <span className={styles.priceUnit}> / day</span>
          </p>
          {/* The whole card is the link (see .nameLink::after); this is its
              visible call to action, not a second focus stop. */}
          <span className={styles.cta} aria-hidden="true">
            View space
          </span>
        </div>
      </div>
    </article>
  )
}
