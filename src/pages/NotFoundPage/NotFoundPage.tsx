import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/icons/Icons'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  useDocumentTitle('Page not found · Stayline')

  return (
    <div className={styles.page}>
      <div className={styles.mark} aria-hidden="true">
        <LogoMark />
      </div>
      <p className={styles.code}>Error 404</p>
      <h1 className={styles.title}>This page doesn’t exist.</h1>
      <p className={styles.text}>
        The link may be out of date or mistyped. Every space in the demo catalog is one click away from the start page.
      </p>
      <Link to="/" className={buttonClass({ size: 'large' })}>
        Browse all spaces
      </Link>
    </div>
  )
}
