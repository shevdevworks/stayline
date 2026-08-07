import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/Container/Container'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import styles from './Header.module.css'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={isScrolled ? `${styles.header} ${styles.scrolled}` : styles.header}>
      <Container className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Stayline
        </Link>
        <ThemeToggle />
      </Container>
    </header>
  )
}
