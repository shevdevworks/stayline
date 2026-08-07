import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
// it is dead-code-eliminated from the production bundle. `config` holds the
// same apiConfig reference simulateNetwork reads on every request, so writes
// through it still take effect — apiConfig itself is left unmodified.
if (import.meta.env.DEV) {
  const staylineApi = {
    config: apiConfig,
    getBookedRanges: (slug: string): DateRange[] => getBookedRanges(slug, todayIso()),
  }
  ;(window as unknown as { __staylineApi: typeof staylineApi }).__staylineApi = staylineApi
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
