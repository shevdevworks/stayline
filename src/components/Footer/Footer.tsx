import { Container } from '@/components/Container/Container'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p className={styles.text}>
          Stayline — portfolio project by ShevDevWorks.{' '}
          <a
            href="https://github.com/shevdevworks"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            github.com/shevdevworks
          </a>
        </p>
      </Container>
    </footer>
  )
}
