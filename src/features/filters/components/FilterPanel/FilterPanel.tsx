import { useId } from 'react'
import { ResetIcon } from '@/components/icons/Icons'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup/CheckboxGroup'
import { toDigits, toNumberOrNull } from '@/components/ui/NumberRangeField/digits'
import { NumberRangeField } from '@/components/ui/NumberRangeField/NumberRangeField'
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup'
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

const ALL_CITIES = ''

function toVenueTypes(values: string[]): VenueType[] {
  return values.filter((value): value is VenueType => isOneOf(value, VENUE_TYPES))
}

function toAmenityIds(values: string[]): AmenityId[] {
  return values.filter((value): value is AmenityId => isOneOf(value, AMENITY_IDS))
}

function FilterPanelSkeleton() {
  return (
    <div className={styles.panel} aria-hidden="true">
      {[4, 3, 2, 1].map((rows, group) => (
        <div key={group} className={styles.skeletonGroup}>
          <div className={`${styles.skeletonBar} ${styles.skeletonBarSm}`} />
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className={styles.skeletonBar} />
          ))}
        </div>
      ))}
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
  const capacityId = `${uid}-capacity`

  const debouncedCapacity = useDebouncedInput(
    filters.capacity === null ? '' : String(filters.capacity),
    (value) => onPatch({ capacity: toNumberOrNull(value) }),
    350,
  )

  if (facetsStatus === 'error') {
    return (
      <div className={styles.panel}>
        <p className={styles.errorMessage}>Filters couldn&apos;t be loaded.</p>
        <button type="button" className={buttonClass({ variant: 'secondary', size: 'small' })} onClick={onFacetsRetry}>
          Try again
        </button>
      </div>
    )
  }

  if (facets === null) {
    return <FilterPanelSkeleton />
  }

  return (
    <div className={styles.panel}>
      <div className={styles.group}>
        <RadioGroup
          legend="City"
          name="city"
          value={filters.city ?? ALL_CITIES}
          options={[
            { value: ALL_CITIES, label: 'All cities' },
            ...facets.cities.map((city) => ({ value: city, label: city })),
          ]}
          onChange={(value) => onPatch({ city: value === ALL_CITIES ? null : value })}
        />
      </div>

      <div className={styles.group}>
        <CheckboxGroup
          legend="Space type"
          options={facets.types.map((type) => ({ value: type, label: VENUE_TYPE_LABELS[type] }))}
          value={filters.types}
          onChange={(next) => onPatch({ types: toVenueTypes(next) })}
        />
      </div>

      <div className={styles.group}>
        <NumberRangeField
          legend="Price per day"
          min={filters.priceMin}
          max={filters.priceMax}
          onChange={({ min, max }) => onPatch({ priceMin: min, priceMax: max })}
          bounds={{ min: facets.priceMin, max: facets.priceMax }}
          unit="€"
        />
      </div>

      <div className={styles.group}>
        <TextField
          id={capacityId}
          label="Guests"
          inputMode="numeric"
          value={debouncedCapacity.value}
          onChange={(raw) => debouncedCapacity.setValue(toDigits(raw))}
          onBlur={debouncedCapacity.flush}
          onKeyDown={(event) => {
            if (event.key === 'Enter') debouncedCapacity.flush()
          }}
          placeholder="Any number"
          hint="Spaces that fit at least this many people"
        />
      </div>

      <div className={styles.group}>
        <CheckboxGroup
          legend="Amenities"
          options={facets.amenities.map((id) => ({ value: id, label: AMENITY_LABELS[id] }))}
          value={filters.amenities}
          onChange={(next) => onPatch({ amenities: toAmenityIds(next) })}
          collapsible
          visibleCount={5}
        />
      </div>

      <button
        type="button"
        className={buttonClass({ variant: 'ghost', size: 'small', className: styles.resetButton })}
        onClick={onReset}
        disabled={activeCount === 0}
      >
        <ResetIcon />
        Reset filters
      </button>
    </div>
  )
}
