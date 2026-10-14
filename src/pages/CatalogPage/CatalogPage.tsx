import { useId } from 'react'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon'
import { SearchIcon } from '@/components/icons/Icons'
import { Select } from '@/components/ui/Select/Select'
import { VenueCard } from '@/components/VenueCard/VenueCard'
import { VenueCardSkeleton } from '@/components/VenueCardSkeleton/VenueCardSkeleton'
import { ActiveFilterChips } from '@/features/filters/components/ActiveFilterChips/ActiveFilterChips'
import { FilterDrawer } from '@/features/filters/components/FilterDrawer/FilterDrawer'
import { FilterPanel } from '@/features/filters/components/FilterPanel/FilterPanel'
import { SearchBar } from '@/features/filters/components/SearchBar/SearchBar'
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
  'capacity-desc': 'Most guests',
}

const SORT_OPTIONS = SORT_KEYS.map((key) => ({ value: key, label: SORT_LABELS[key] }))

function spacesLabel(count: number): string {
  return `${count} ${count === 1 ? 'space' : 'spaces'}`
}

export function CatalogPage() {
  const uid = useId()
  const resultsHeadingId = `${uid}-results`
  const { filters, patchFilters, resetFilters, activeCount } = useVenueFilters()
  const { data, status, isFetching, refetch } = useVenues(filters)
  const { facets, status: facetsStatus, refetch: refetchFacets } = useFilterFacets()

  const hasCount = status === 'success' || status === 'empty'

  const panelProps = {
    filters,
    facets,
    facetsStatus,
    onFacetsRetry: refetchFacets,
    onPatch: patchFilters,
    onReset: resetFilters,
    activeCount,
  }

  return (
    <>
      <section className={styles.intro} aria-labelledby={`${uid}-title`}>
        <h1 id={`${uid}-title`} className={styles.title}>
          Find your space.
        </h1>
        <p className={styles.subtitle}>Studios, meeting rooms and coworking across Europe.</p>
        <div className={styles.search}>
          <SearchBar query={filters.query} onQueryChange={(query) => patchFilters({ query })} />
        </div>
      </section>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Filters">
          <div className={styles.sidebarInner}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            <FilterPanel {...panelProps} />
          </div>
        </aside>

        <section className={styles.content} aria-labelledby={resultsHeadingId}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarText}>
              <h2 id={resultsHeadingId} className={styles.resultsTitle}>
                Spaces to make things happen
              </h2>
              <p className={styles.count} aria-live="polite">
                {hasCount ? spacesLabel(data.length) : 'Loading spaces…'}
                {hasCount && isFetching && <span className={styles.updating}> · updating</span>}
              </p>
            </div>
            <div className={styles.toolbarControls}>
              <FilterDrawer {...panelProps} resultCount={hasCount ? data.length : null} />
              <Select
                id={`${uid}-sort`}
                label="Sort by"
                layout="inline"
                className={styles.sort}
                labelClassName={styles.sortLabel}
                value={filters.sort}
                options={SORT_OPTIONS}
                onChange={(value) => {
                  if (value !== null && isSortKey(value)) patchFilters({ sort: value })
                }}
              />
            </div>
          </div>

          <ActiveFilterChips
            filters={filters}
            facets={facets}
            onPatch={patchFilters}
            onReset={resetFilters}
            activeCount={activeCount}
          />

          {status === 'loading' && (
            <div className={styles.grid} aria-busy="true">
              {Array.from({ length: 4 }, (_, index) => (
                <VenueCardSkeleton key={index} />
              ))}
            </div>
          )}

          {status === 'error' && (
            <EmptyState
              icon={<AlertTriangleIcon />}
              title="Spaces couldn't be loaded"
              description="Something went wrong while loading the catalog. Your filters are kept — try again."
              action={{ label: 'Try again', onClick: () => !isFetching && refetch() }}
            />
          )}

          {status === 'empty' &&
            (activeCount > 0 ? (
              <EmptyState
                icon={<SearchIcon />}
                title="No spaces match these filters"
                description="Try another city, a wider price range or fewer amenities — or start over."
                action={{ label: 'Reset filters', onClick: resetFilters }}
              />
            ) : (
              <EmptyState
                icon={<SearchIcon />}
                title="No spaces yet"
                description="There are no spaces to show right now."
              />
            ))}

          {status === 'success' && (
            <ul className={styles.grid} data-fetching={isFetching || undefined}>
              {data.map((venue, index) => (
                <li key={venue.slug} className={styles.gridItem}>
                  <VenueCard venue={venue} priority={index === 0 ? 'high' : index < 2 ? 'eager' : 'lazy'} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
