import { Link, useLocation, useParams } from 'react-router-dom'
import { VenueLoadError } from '@/components/VenueLoadError/VenueLoadError'
import { VenueNotFound } from '@/components/VenueNotFound/VenueNotFound'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useVenue } from '@/hooks/useVenue'
import { AMENITY_LABELS, VENUE_TYPE_LABELS } from '@/types'
import { Gallery } from './Gallery'
import { MobileBookBar } from './MobileBookBar'
import { PricePanel } from './PricePanel'
import { VenuePageSkeleton } from './VenuePageSkeleton'
import styles from './VenuePage.module.css'

const BOOKING_PANEL_ID = 'booking-panel'

export function VenuePage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const venue = useVenue(slug ?? '')

  const backTo = (location.state as { from?: string } | null)?.from ?? '/'

  useDocumentTitle(venue.status === 'success' ? venue.data.name : null)

  if (venue.status === 'loading') {
    return <VenuePageSkeleton />
  }

  if (venue.status === 'not-found') {
    return <VenueNotFound />
  }

  if (venue.status === 'error') {
    return <VenueLoadError onRetry={venue.refetch} />
  }

  const { data } = venue

  return (
    <div className={styles.page}>
      <Link to={backTo} className={styles.backLink}>
        Back to catalog
      </Link>

      <div className={styles.layout}>
        <div className={styles.content}>
          <h1>{data.name}</h1>
          <p className={styles.meta}>
            {data.city} · {data.address} · {VENUE_TYPE_LABELS[data.type]} · {data.rating.toFixed(1)} rating ·{' '}
            {data.capacity} guests
          </p>

          <Gallery key={data.slug} images={data.images} />

          <section className={styles.section}>
            <h2>Description</h2>
            <p>{data.description}</p>
          </section>

          <section className={styles.section}>
            <h2>Amenities</h2>
            <ul className={styles.tagList}>
              {data.amenities.map((amenity) => (
                <li key={amenity} className={styles.tagItem}>
                  {AMENITY_LABELS[amenity]}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Rules</h2>
            <ul className={styles.ruleList}>
              {data.rules.map((rule) => (
                <li key={rule} className={styles.ruleItem}>
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside id={BOOKING_PANEL_ID} className={styles.sidebar} tabIndex={-1} aria-label="Booking">
          <PricePanel venue={data} />
        </aside>
      </div>

      <MobileBookBar pricePerDay={data.pricePerDay} targetId={BOOKING_PANEL_ID} />
    </div>
  )
}
