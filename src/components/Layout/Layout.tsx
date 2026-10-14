import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header/Header'
import { Footer } from '@/components/Footer/Footer'
import { Container } from '@/components/Container/Container'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { markInitialRenderDone } from '@/lib/initialRender'
import styles from './Layout.module.css'

export function Layout() {
  useScrollToTop()

  // Layout stays mounted across route changes, so this marks the end of
  // the first (prerendered/hydrated) render exactly once.
  useEffect(() => {
    markInitialRenderDone()
  }, [])

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <Header />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
