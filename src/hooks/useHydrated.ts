import { useSyncExternalStore } from 'react'

function subscribe() {
  return () => {}
}

// false while rendering on the server and during the hydration render,
// true on every client render after that (and immediately in a plain
// createRoot render). Lets markup that depends on browser-only state — the
// stored theme, for instance — match the prerendered HTML first and update
// right after, instead of tripping a hydration mismatch.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
