import { EmptyState } from '@/components/EmptyState/EmptyState'
import { Select } from '@/components/ui/Select/Select'
import { VenueCard } from '@/components/VenueCard/VenueCard'
import { VenueCardSkeleton } from '@/components/VenueCardSkeleton/VenueCardSkeleton'
import { ActiveFilterChips } from '@/features/filters/components/ActiveFilterChips/ActiveFilterChips'
import { FilterDrawer } from '@/features/filters/components/FilterDrawer/FilterDrawer'
import { FilterPanel } from '@/features/filters/components/FilterPanel/FilterPanel'
import { isSortKey } from '@/features/filters/filterParams'
import { SORT_KEYS } from '@/features/filters/types'
import type { SortKey } from '@/features/filters/types'
import { useFilterFacets } from '@/features/filters/useFilterFacets'
import { useVenueFilters } from '@/features/filters/useVenueFilters'
import { useVenues } from '@/features/filters/useVenues'
import styles from './CatalogPage.module.css'

const SORT_LABELS: Record<SortKey, string> = {
  recommended: 'Recommended',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  'capacity-desc': 'Capacity: high to low',
}

const SORT_OPTIONS = SORT_KEYS.map((key) => ({ value: key, label: SORT_LABELS[key] }))

function SearchOffIcon() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
      <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="7" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="7" x2="7" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
      <path
        d="M12 3.5 21.5 20h-19L12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="12" y1="9.5" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CatalogPage() {
  const { filters, patchFilters, resetFilters, activeCount } = useVenueFilters()
  const { data, status, isFetching, refetch } = useVenues(filters)
  const { facets, status: facetsStatus, refetch: refetchFacets } = useFilterFacets()

  return (
    <>
      <div className={styles.header}>
        <h1>Find your space</h1>
        <p className={styles.subtitle}>Studios, coworking desks and meeting rooms, ready to book.</p>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FilterPanel
            filters={filters}
            facets={facets}
            facetsStatus={facetsStatus}
            onFacetsRetry={refetchFacets}
            onPatch={patchFilters}
            onReset={resetFilters}
            activeCount={activeCount}
          />
        </aside>

        <div className={styles.content}>
          <FilterDrawer
            filters={filters}
            facets={facets}
            facetsStatus={facetsStatus}
            onFacetsRetry={refetchFacets}
            onPatch={patchFilters}
            onReset={resetFilters}
            activeCount={activeCount}
          />

          <ActiveFilterChips
            filters={filters}
            facets={facets}
            onPatch={patchFilters}
            onReset={resetFilters}
            activeCount={activeCount}
          />

          <div className={styles.sortRow}>
            {(status === 'success' || status === 'empty') && (
              <p className={styles.count} aria-live="polite">
                {data.length} {data.length === 1 ? 'venue' : 'venues'} found
                {isFetching ? ' — updating…' : ''}
              </p>
            )}
            <Select
              id="sort"
              label="Sort by"
              value={filters.sort}
              options={SORT_OPTIONS}
              onChange={(value) => {
                if (value !== null && isSortKey(value)) patchFilters({ sort: value })
              }}
            />
          </div>

          {status === 'loading' && (
            <div className={styles.grid} aria-busy="true" aria-live="polite">
              {Array.from({ length: 6 }, (_, index) => (
                <VenueCardSkeleton key={index} />
              ))}
            </div>
          )}

          {status === 'error' && (
            <EmptyState
              icon={<AlertTriangleIcon />}
              title="Something went wrong"
              description="We couldn't load venues right now. Please try again."
              action={{ label: 'Retry', onClick: () => !isFetching && refetch() }}
            />
          )}

          {status === 'empty' &&
            (activeCount > 0 ? (
              <EmptyState
                icon={<SearchOffIcon />}
                title="No venues match your filters"
                description="Try removing some filters or reset them all."
                action={{ label: 'Reset filters', onClick: resetFilters }}
              />
            ) : (
              <EmptyState
                icon={<SearchOffIcon />}
                title="No venues found"
                description="There are no venues to show right now."
              />
            ))}

          {status === 'success' && (
            <div className={styles.grid}>
              {data.map((venue) => (
                <VenueCard key={venue.slug} venue={venue} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
