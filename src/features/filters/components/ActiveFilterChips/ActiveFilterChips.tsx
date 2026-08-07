import { AMENITY_LABELS, VENUE_TYPE_LABELS } from '@/types'
import type { FilterFacets } from '@/types'
import type { VenueFilters } from '@/features/filters/types'
import styles from './ActiveFilterChips.module.css'

function RemoveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.removeIcon}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  )
}

function formatPriceChip(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) return `${min}-${max} EUR`
  if (min !== null) return `${min}+ EUR`
  if (max !== null) return `up to ${max} EUR`
  return null
}

export interface ActiveFilterChipsProps {
  filters: VenueFilters
  facets: FilterFacets | null
  onPatch: (patch: Partial<VenueFilters>) => void
  onReset: () => void
  activeCount: number
}

interface Chip {
  key: string
  text: string
  onRemove: () => void
}

export function ActiveFilterChips({ filters, onPatch, onReset, activeCount }: ActiveFilterChipsProps) {
  if (activeCount === 0) return null

  const chips: Chip[] = []

  if (filters.query !== '') {
    chips.push({ key: 'query', text: `"${filters.query}"`, onRemove: () => onPatch({ query: '' }) })
  }

  if (filters.city !== null) {
    chips.push({ key: 'city', text: filters.city, onRemove: () => onPatch({ city: null }) })
  }

  for (const type of filters.types) {
    chips.push({
      key: `type-${type}`,
      text: VENUE_TYPE_LABELS[type],
      onRemove: () => onPatch({ types: filters.types.filter((value) => value !== type) }),
    })
  }

  for (const amenity of filters.amenities) {
    chips.push({
      key: `amenity-${amenity}`,
      text: AMENITY_LABELS[amenity],
      onRemove: () => onPatch({ amenities: filters.amenities.filter((value) => value !== amenity) }),
    })
  }

  const priceText = formatPriceChip(filters.priceMin, filters.priceMax)
  if (priceText !== null) {
    chips.push({ key: 'price', text: priceText, onRemove: () => onPatch({ priceMin: null, priceMax: null }) })
  }

  if (filters.capacity !== null) {
    chips.push({
      key: 'capacity',
      text: `From ${filters.capacity} people`,
      onRemove: () => onPatch({ capacity: null }),
    })
  }

  return (
    <div className={styles.chips}>
      {chips.map((chip) => (
        <span key={chip.key} className={styles.chip}>
          {chip.text}
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remove filter: ${chip.text}`}
            onClick={chip.onRemove}
          >
            <RemoveIcon />
          </button>
        </span>
      ))}

      {activeCount > 1 && (
        <button type="button" className={styles.clearAll} onClick={onReset}>
          Clear all
        </button>
      )}
    </div>
  )
}
