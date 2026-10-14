import { Container } from '@/components/Container/Container'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p className={styles.text}>
          Stayline is a portfolio demo. Venues, prices and bookings are fictional, nothing is reserved or
          charged, and venue photos are illustrative stock images.
        </p>
        <p className={styles.links}>
          <span>Design and build by ShevDevWorks</span>
          <a href="https://shevdevworks.com/" target="_blank" rel="noopener noreferrer" className={styles.link}>
            shevdevworks.com
          </a>
          <a
            href="https://github.com/shevdevworks/stayline"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Source on GitHub
          </a>
          <a
            href="https://github.com/shevdevworks/stayline/blob/main/PHOTO-CREDITS.md"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Photo credits
          </a>
        </p>
      </Container>
    </footer>
  )
}
