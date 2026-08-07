import styles from './Skeleton.module.css'

export type SkeletonVariant = 'text' | 'block'

export interface SkeletonProps {
  variant?: SkeletonVariant
  className?: string
}

export function Skeleton({ variant = 'text', className }: SkeletonProps) {
  const variantClass = variant === 'block' ? styles.block : styles.text
  return <div className={className ? `${variantClass} ${className}` : variantClass} />
}
