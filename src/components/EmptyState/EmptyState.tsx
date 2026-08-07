import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  link?: {
    label: string
    to: string
  }
}

export function EmptyState({ icon, title, description, action, link }: EmptyStateProps) {
  return (
    <div className={styles.wrapper} role="status">
      <div className={styles.icon}>{icon}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {link && (
        <Link to={link.to} className={styles.action}>
          {link.label}
        </Link>
      )}
    </div>
  )
}
