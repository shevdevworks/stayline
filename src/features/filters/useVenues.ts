import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchVenues, isAbortError, queryVenues } from '@/api'
import { isInitialRender } from '@/lib/initialRender'
import { parseFilters, toSearchParams } from './filterParams'
import type { VenueFilters } from './types'
import type { VenueSummary } from '@/types'

export type VenuesStatus = 'loading' | 'success' | 'error' | 'empty'

export interface UseVenuesResult {
  data: VenueSummary[]
  status: VenuesStatus
  isFetching: boolean
  error: Error | null
  refetch: () => void
}

interface VenuesState {
  data: VenueSummary[]
  error: Error | null
  settledKey: string | null
}

const INITIAL_STATE: VenuesState = { data: [], error: null, settledKey: null }

export function useVenues(filters: VenueFilters): UseVenuesResult {
  // The prerendered first render resolves synchronously, already settled
  // for its own request key (refetchTick 0), so it renders as success with
  // no "updating" flag and matches the static HTML it hydrates.
  const [state, setState] = useState<VenuesState>(() =>
    isInitialRender()
      ? { data: queryVenues(filters), error: null, settledKey: `${toSearchParams(filters).toString()}#0` }
      : INITIAL_STATE,
  )
  const [refetchTick, setRefetchTick] = useState(0)

  const requestIdRef = useRef(0)
  // The key resolved synchronously above, if any: its effect run skips the
  // network round trip. Cleared on the first different key so returning to
  // the same filters later fetches normally.
  const seededKeyRef = useRef(state.settledKey)

  const refetch = useCallback(() => setRefetchTick((tick) => tick + 1), [])

  // Depend on the serialized filters, not the object identity: useVenues
  // shouldn't rely on callers memoizing the `filters` object they pass in.
  const filtersKey = toSearchParams(filters).toString()
  // Folds in refetchTick so a Retry click on unchanged filters still counts
  // as a new, not-yet-settled request. isFetching is derived by comparing
  // this to the key the current state was last settled for, instead of
  // being flipped by a setState call at the top of the effect.
  const requestKey = `${filtersKey}#${refetchTick}`
  const isFetching = state.settledKey !== requestKey

  useEffect(() => {
    if (seededKeyRef.current === requestKey) return
    seededKeyRef.current = null

    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    const currentFilters = parseFilters(new URLSearchParams(filtersKey))

    fetchVenues(currentFilters, controller.signal)
      .then((result) => {
        if (requestId !== requestIdRef.current) return
        setState({ data: result, error: null, settledKey: requestKey })
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Unknown error'),
          settledKey: requestKey,
        }))
      })

    return () => controller.abort()
  }, [filtersKey, refetchTick, requestKey])

  const status: VenuesStatus = isFetching
    ? state.data.length === 0
      ? 'loading'
      : 'success'
    : state.error !== null
      ? 'error'
      : state.data.length === 0
        ? 'empty'
        : 'success'

  return { data: state.data, status, isFetching, error: state.error, refetch }
}
