import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header/Header'
import { Footer } from '@/components/Footer/Footer'
import { Container } from '@/components/Container/Container'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import styles from './Layout.module.css'

export function Layout() {
  useScrollToTop()

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <Header />
      <main id="main-content" className={styles.main}>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
