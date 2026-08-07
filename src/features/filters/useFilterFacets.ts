import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchFilterFacets, isAbortError } from '@/api'
import type { FilterFacets } from '@/types'

export type FilterFacetsStatus = 'loading' | 'success' | 'error'

export interface UseFilterFacetsResult {
  facets: FilterFacets | null
  status: FilterFacetsStatus
  refetch: () => void
}

interface FacetsState {
  facets: FilterFacets | null
  error: boolean
  settledTick: number | null
}

const INITIAL_STATE: FacetsState = { facets: null, error: false, settledTick: null }

export function useFilterFacets(): UseFilterFacetsResult {
  const [state, setState] = useState<FacetsState>(INITIAL_STATE)
  const [refetchTick, setRefetchTick] = useState(0)

  const requestIdRef = useRef(0)

  const refetch = useCallback(() => setRefetchTick((tick) => tick + 1), [])

  const isFetching = state.settledTick !== refetchTick

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    fetchFilterFacets(controller.signal)
      .then((result) => {
        if (requestId !== requestIdRef.current) return
        setState({ facets: result, error: false, settledTick: refetchTick })
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setState((prev) => ({ ...prev, error: true, settledTick: refetchTick }))
      })

    return () => controller.abort()
  }, [refetchTick])

  const status: FilterFacetsStatus = isFetching ? 'loading' : state.error ? 'error' : 'success'

  return { facets: state.facets, status, refetch }
}
