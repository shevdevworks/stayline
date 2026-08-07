import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchVenueBySlug, isAbortError, NotFoundError } from '@/api'
import type { VenueDetail } from '@/types'

export type UseVenueResult =
  | { status: 'loading'; refetch: () => void }
  | { status: 'success'; data: VenueDetail; refetch: () => void }
  | { status: 'not-found'; refetch: () => void }
  | { status: 'error'; error: Error; refetch: () => void }

type VenueSnapshot =
  | { slug: string; key: string; error: null; data: VenueDetail }
  | { slug: string; key: string; error: Error; data: VenueDetail | null }

export function useVenue(slug: string): UseVenueResult {
  const [snapshot, setSnapshot] = useState<VenueSnapshot | null>(null)
  const [retryTick, setRetryTick] = useState(0)

  const requestIdRef = useRef(0)

  const refetch = useCallback(() => setRetryTick((tick) => tick + 1), [])

  const requestKey = `${slug}#${retryTick}`

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    fetchVenueBySlug(slug, controller.signal)
      .then((result) => {
        if (requestId !== requestIdRef.current) return
        setSnapshot({ slug, key: requestKey, error: null, data: result })
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return
        if (isAbortError(err)) return
        setSnapshot((prev) => ({
          slug,
          key: requestKey,
          error: err instanceof Error ? err : new Error('Unknown error'),
          // Same-slug retry keeps whatever data was already there; a fetch
          // that started after the slug changed has nothing of its own yet.
          data: prev !== null && prev.slug === slug ? prev.data : null,
        }))
      })

    return () => controller.abort()
  }, [slug, retryTick, requestKey])

  // Ownership is decided at render time, not patched in afterward by an
  // effect: a snapshot committed for a different slug is never treated as
  // current, so a slug change reads as loading immediately, without a frame
  // of the previous venue showing through first.
  const own = snapshot !== null && snapshot.slug === slug ? snapshot : null

  if (own === null) {
    return { status: 'loading', refetch }
  }

  if (own.key !== requestKey) {
    return own.data === null
      ? { status: 'loading', refetch }
      : { status: 'success', data: own.data, refetch }
  }

  if (own.error !== null) {
    return own.error instanceof NotFoundError
      ? { status: 'not-found', refetch }
      : { status: 'error', error: own.error, refetch }
  }

  return { status: 'success', data: own.data, refetch }
}
