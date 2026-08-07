import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseFilters, toSearchParams } from './filterParams'
import { DEFAULT_FILTERS } from './types'
import type { VenueFilters } from './types'

export interface UseVenueFiltersResult {
  filters: VenueFilters
  setFilters: (filters: VenueFilters) => void
  patchFilters: (patch: Partial<VenueFilters>) => void
  resetFilters: () => void
  activeCount: number
  isFiltered: boolean
}

export function useVenueFilters(): UseVenueFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams()

  // useSearchParams returns a new URLSearchParams instance every render even
  // when the URL is unchanged, so memoize on its serialized form instead of
  // its identity to keep `filters` referentially stable across renders.
  const paramsKey = searchParams.toString()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = useMemo(() => parseFilters(searchParams), [paramsKey])

  const setFilters = useCallback(
    (next: VenueFilters) => setSearchParams(toSearchParams(next), { replace: true }),
    [setSearchParams],
  )

  const patchFilters = useCallback(
    (patch: Partial<VenueFilters>) =>
      setSearchParams((prev) => toSearchParams({ ...parseFilters(prev), ...patch }), { replace: true }),
    [setSearchParams],
  )

  const resetFilters = useCallback(
    () =>
      setSearchParams(
        (prev) => toSearchParams({ ...DEFAULT_FILTERS, sort: parseFilters(prev).sort }),
        { replace: true },
      ),
    [setSearchParams],
  )

  const activeCount = useMemo(() => {
    let count = 0
    if (filters.query !== '') count++
    if (filters.city !== null) count++
    if (filters.types.length > 0) count++
    if (filters.amenities.length > 0) count++
    if (filters.priceMin !== null || filters.priceMax !== null) count++
    if (filters.capacity !== null) count++
    return count
  }, [filters])

  return { filters, setFilters, patchFilters, resetFilters, activeCount, isFiltered: activeCount > 0 }
}
