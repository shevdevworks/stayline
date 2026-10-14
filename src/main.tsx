import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { apiConfig } from '@/api'
import { getBookedRanges } from '@/data/bookedRanges'
import { todayIso } from '@/lib/date/isoDate'
import type { DateRange } from '@/lib/date/types'
import './styles/global.css'
import { ThemeProvider } from './hooks/ThemeProvider'
import { App } from './App.tsx'

// Dev tool: exposes error states and data lookups on window for manual
// triggering without editing source (e.g. set
// window.__staylineApi.config.failureRate = 1 in devtools), plus a helper to
// inspect a venue's resolved booked ranges. Guarded by import.meta.env.DEV so
// it is dead-code-eliminated from the production bundle.
if (import.meta.env.DEV) {
  const staylineApi = {
    config: apiConfig,
    getBookedRanges: (slug: string): DateRange[] => getBookedRanges(slug, todayIso()),
  }
  ;(window as unknown as { __staylineApi: typeof staylineApi }).__staylineApi = staylineApi
}

const container = document.getElementById('root')!

const app = (
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

// Built pages carry prerendered markup for exactly one URL (no query
// string), named in data-prerendered. Hydrate only when this visit is that
// URL; anything else — filters in the query, a booking deep link served by
// 404.html — renders fresh, replacing whatever static markup is there.
function currentRoutePath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : '/'
  return path === '' ? '/' : path.replace(/(.)\/$/, '$1')
}

const prerenderedPath = container.dataset.prerendered
if (prerenderedPath !== undefined && prerenderedPath === currentRoutePath() && window.location.search === '') {
  hydrateRoot(container, app)
} else {
  container.textContent = ''
  createRoot(container).render(app)
}
