import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeftIcon, CheckIcon, MapPinIcon, StarIcon, UsersIcon } from '@/components/icons/Icons'
import { VenueLoadError } from '@/components/VenueLoadError/VenueLoadError'
import { VenueNotFound } from '@/components/VenueNotFound/VenueNotFound'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useVenue } from '@/hooks/useVenue'
import { daysLabel } from '@/lib/daysLabel'
import { AMENITY_LABELS, VENUE_TYPE_LABELS } from '@/types'
import { Gallery } from './Gallery'
import { MobileBookBar } from './MobileBookBar'
import { PricePanel } from './PricePanel'
import { VenuePageSkeleton } from './VenuePageSkeleton'
import styles from './VenuePage.module.css'

const BOOKING_PANEL_ID = 'booking-panel'

function stayLengthText(minDays: number, maxDays: number): string {
  if (minDays === maxDays) return `Exactly ${daysLabel(minDays)}`
  return `${minDays} to ${daysLabel(maxDays)}`
}

export function VenuePage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const venue = useVenue(slug ?? '')

  const backTo = (location.state as { from?: string } | null)?.from ?? '/'

  useDocumentTitle(venue.status === 'success' ? `${venue.data.name} · Stayline` : null)

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
        <ArrowLeftIcon />
        Back to all spaces
      </Link>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          <span className={styles.typeBadge}>{VENUE_TYPE_LABELS[data.type]}</span>
          <span className={styles.city}>{data.city}</span>
        </p>
        <h1 className={styles.title}>{data.name}</h1>
        <ul className={styles.meta}>
          <li>
            <MapPinIcon />
            {data.address}
          </li>
          <li>
            <UsersIcon />
            Up to {data.capacity} guests
          </li>
          <li>
            <StarIcon className={styles.star} />
            <span className="sr-only">Rated </span>
            {data.rating.toFixed(1)}
            <span className="sr-only"> out of 5</span>
          </li>
        </ul>
      </header>

      <div className={styles.layout}>
        <div className={styles.content}>
          <Gallery key={data.slug} images={data.images} />

          <section className={styles.section} aria-labelledby="venue-about">
            <h2 id="venue-about">About this space</h2>
            <p className={styles.description}>{data.description}</p>
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Booking length</dt>
                <dd>{stayLengthText(data.minDays, data.maxDays)}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Capacity</dt>
                <dd>Up to {data.capacity} guests</dd>
              </div>
              <div className={styles.fact}>
                <dt>Price</dt>
                <dd>Per calendar day, both ends included</dd>
              </div>
            </dl>
          </section>

          <section className={styles.section} aria-labelledby="venue-amenities">
            <h2 id="venue-amenities">Amenities</h2>
            <ul className={styles.amenities}>
              {data.amenities.map((amenity) => (
                <li key={amenity} className={styles.amenity}>
                  <span className={styles.amenityIcon}>
                    <CheckIcon />
                  </span>
                  {AMENITY_LABELS[amenity]}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="venue-rules">
            <h2 id="venue-rules">House rules</h2>
            <ul className={styles.rules}>
              {data.rules.map((rule) => (
                <li key={rule} className={styles.rule}>
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside id={BOOKING_PANEL_ID} className={styles.sidebar} tabIndex={-1} aria-label="Book this space">
          <PricePanel venue={data} />
        </aside>
      </div>

      <MobileBookBar pricePerDay={data.pricePerDay} targetId={BOOKING_PANEL_ID} />
    </div>
  )
}
