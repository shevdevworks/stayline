import { useId } from 'react'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup/CheckboxGroup'
import { toDigits, toNumberOrNull } from '@/components/ui/NumberRangeField/digits'
import { NumberRangeField } from '@/components/ui/NumberRangeField/NumberRangeField'
import { Select } from '@/components/ui/Select/Select'
import { TextField } from '@/components/ui/TextField/TextField'
import { isOneOf } from '@/features/filters/filterParams'
import type { FilterFacetsStatus } from '@/features/filters/useFilterFacets'
import type { VenueFilters } from '@/features/filters/types'
import { useDebouncedInput } from '@/hooks/useDebouncedInput'
import { AMENITY_IDS, AMENITY_LABELS, VENUE_TYPES, VENUE_TYPE_LABELS } from '@/types'
import type { AmenityId, FilterFacets, VenueType } from '@/types'
import styles from './FilterPanel.module.css'

export interface FilterPanelProps {
  filters: VenueFilters
  facets: FilterFacets | null
  facetsStatus: FilterFacetsStatus
  onFacetsRetry: () => void
  onPatch: (patch: Partial<VenueFilters>) => void
  onReset: () => void
  activeCount: number
}

function toVenueTypes(values: string[]): VenueType[] {
  return values.filter((value): value is VenueType => isOneOf(value, VENUE_TYPES))
}

function toAmenityIds(values: string[]): AmenityId[] {
  return values.filter((value): value is AmenityId => isOneOf(value, AMENITY_IDS))
}

function FilterPanelSkeleton() {
  return (
    <div className={styles.panel} aria-hidden="true">
      <div className={styles.skeletonGroup}>
        <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
        <div className={styles.skeletonBar} />
      </div>
      <div className={styles.skeletonGroup}>
        <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
        <div className={styles.skeletonBar} />
      </div>
      <div className={styles.skeletonGroup}>
        <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
        <div className={styles.skeletonBar} />
        <div className={styles.skeletonBar} />
        <div className={styles.skeletonBar} />
      </div>
      <div className={styles.skeletonGroup}>
        <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
        <div className={styles.skeletonBar} />
        <div className={styles.skeletonBar} />
      </div>
      <div className={styles.skeletonGroup}>
        <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
        <div className={styles.skeletonRow}>
          <div className={styles.skeletonBar} />
          <div className={styles.skeletonBar} />
        </div>
      </div>
      <div className={styles.skeletonGroup}>
        <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
        <div className={styles.skeletonBar} />
      </div>
      <div className={`${styles.skeletonBar} ${styles.skeletonButton}`} />
    </div>
  )
}

export function FilterPanel({
  filters,
  facets,
  facetsStatus,
  onFacetsRetry,
  onPatch,
  onReset,
  activeCount,
}: FilterPanelProps) {
  const uid = useId()
  const queryId = `${uid}-query`
  const cityId = `${uid}-city`
  const capacityId = `${uid}-capacity`

  const debouncedQuery = useDebouncedInput(filters.query, (value) => onPatch({ query: value }), 350)

  const debouncedCapacity = useDebouncedInput(
    filters.capacity === null ? '' : String(filters.capacity),
    (value) => onPatch({ capacity: toNumberOrNull(value) }),
    350,
  )

  if (facetsStatus === 'error') {
    return (
      <div className={styles.panel}>
        <p className={styles.errorMessage}>Couldn&apos;t load filters.</p>
        <button type="button" className={styles.retryButton} onClick={onFacetsRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (facets === null) {
    return <FilterPanelSkeleton />
  }

  return (
    <div className={styles.panel}>
      <TextField
        id={queryId}
        label="Search"
        value={debouncedQuery.value}
        onChange={debouncedQuery.setValue}
        onBlur={debouncedQuery.flush}
        onKeyDown={(event) => {
          if (event.key === 'Enter') debouncedQuery.flush()
        }}
        placeholder="Search by name or city"
        clearable
      />

      <Select
        id={cityId}
        label="City"
        value={filters.city}
        options={facets.cities.map((city) => ({ value: city, label: city }))}
        onChange={(value) => onPatch({ city: value })}
        placeholder="All cities"
        clearable
      />

      <CheckboxGroup
        legend="Venue type"
        options={facets.types.map((type) => ({ value: type, label: VENUE_TYPE_LABELS[type] }))}
        value={filters.types}
        onChange={(next) => onPatch({ types: toVenueTypes(next) })}
      />

      <CheckboxGroup
        legend="Amenities"
        options={facets.amenities.map((id) => ({ value: id, label: AMENITY_LABELS[id] }))}
        value={filters.amenities}
        onChange={(next) => onPatch({ amenities: toAmenityIds(next) })}
        collapsible
        visibleCount={6}
      />

      <NumberRangeField
        legend="Price per day"
        min={filters.priceMin}
        max={filters.priceMax}
        onChange={({ min, max }) => onPatch({ priceMin: min, priceMax: max })}
        bounds={{ min: facets.priceMin, max: facets.priceMax }}
        unit="EUR"
      />

      <TextField
        id={capacityId}
        label="Capacity"
        type="text"
        inputMode="numeric"
        value={debouncedCapacity.value}
        onChange={(raw) => debouncedCapacity.setValue(toDigits(raw))}
        onBlur={debouncedCapacity.flush}
        onKeyDown={(event) => {
          if (event.key === 'Enter') debouncedCapacity.flush()
        }}
        placeholder="Minimum guests"
      />

      <button type="button" className={styles.resetButton} onClick={onReset} disabled={activeCount === 0}>
        Reset filters
      </button>
    </div>
  )
}
