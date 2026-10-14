import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  // h1 when the state replaces a whole page (venue not found), h2 when it
  // sits inside one (catalog results).
  headingLevel?: 1 | 2
  action?: {
    label: string
    onClick: () => void
  }
  link?: {
    label: string
    to: string
  }
}

export function EmptyState({ icon, title, description, headingLevel = 2, action, link }: EmptyStateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'

  return (
    <div className={styles.wrapper} role="status">
      <div className={styles.icon}>{icon}</div>
      <Heading className={styles.title}>{title}</Heading>
      <p className={styles.description}>{description}</p>
      {(action || link) && (
        <div className={styles.actions}>
          {action && (
            <button type="button" className={buttonClass()} onClick={action.onClick}>
              {action.label}
            </button>
          )}
          {link && (
            <Link to={link.to} className={buttonClass({ variant: action ? 'secondary' : 'primary' })}>
              {link.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
