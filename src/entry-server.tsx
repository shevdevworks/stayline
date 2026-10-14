// Build-time prerender entry. Built with `vite build --ssr` and called by
// scripts/prerender.mjs; never shipped to the browser.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { venues } from '@/data/venues'
import { ThemeProvider } from '@/hooks/ThemeProvider'
import { AppRoutes } from './App'

export interface PrerenderRoute {
  // Router path, relative to the base (e.g. "/venue/berlin-kreuzberg-loft").
  path: string
  // Output file, relative to dist/.
  file: string
  title: string
  description: string
  // Built asset URL (already including the base) for og:image.
  image?: string
}

const CATALOG_DESCRIPTION =
  'Studios, meeting rooms and coworking spaces across six European cities — filtered, priced and booked in one interface. A portfolio demo.'

// The catalog plus every venue page. Booking pages (/venue/:slug/book) are
// left to the SPA fallback on purpose — see the Deployment section of
// README.md for why.
export function getPrerenderRoutes(): PrerenderRoute[] {
  return [
    {
      path: '/',
      file: 'index.html',
      title: 'Stayline — studio and coworking booking',
      description: CATALOG_DESCRIPTION,
    },
    ...venues.map((venue) => ({
      path: `/venue/${venue.slug}`,
      file: `venue/${venue.slug}.html`,
      title: `${venue.name} · Stayline`,
      description: `${venue.description} From €${venue.pricePerDay} a day, up to ${venue.capacity} guests. Demo listing.`,
      image: venue.images[0].src,
    })),
  ]
}

export function render(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return renderToString(
    <StrictMode>
      <ThemeProvider>
        <StaticRouter basename={base} location={`${base}${path}`}>
          <AppRoutes />
        </StaticRouter>
      </ThemeProvider>
    </StrictMode>,
  )
}
