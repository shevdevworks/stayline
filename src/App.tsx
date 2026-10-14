import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout/Layout'
import { CatalogPage } from '@/pages/CatalogPage/CatalogPage'
import { VenuePage } from '@/pages/VenuePage/VenuePage'
import { BookingPage } from '@/pages/BookingPage/BookingPage'
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage'

// Shared by the browser entry (BrowserRouter) and the build-time
// prerenderer (StaticRouter, see entry-server.tsx).
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/venue/:slug" element={<VenuePage />} />
        <Route path="/venue/:slug/book" element={<BookingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  )
}
