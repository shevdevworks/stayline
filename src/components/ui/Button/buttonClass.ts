import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonClassOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  className?: string
}

// A class builder rather than a <Button> component: the same look applies
// to <button>, react-router <Link> and <a>, and each keeps its own native
// element and props instead of going through a polymorphic wrapper.
export function buttonClass({
  variant = 'primary',
  size = 'medium',
  block = false,
  className,
}: ButtonClassOptions = {}): string {
  return [
    styles.button,
    styles[variant],
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    block && styles.block,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
