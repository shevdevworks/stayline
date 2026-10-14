import { MoonIcon, SunIcon } from '@/components/icons/Icons'
import { useHydrated } from '@/hooks/useHydrated'
import { useTheme } from '@/hooks/useTheme'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const hydrated = useHydrated()
  // Prerendered HTML can't know the visitor's stored theme, so the first
  // (hydration) render always matches the light default. Both icons are in
  // the markup and CSS picks one from html[data-theme], which the inline
  // script in index.html sets before paint — no flash of the wrong icon.
  const isDark = hydrated && theme === 'dark'

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggleTheme}
      aria-label="Dark theme"
      aria-pressed={isDark}
    >
      <SunIcon className={`${styles.icon} ${styles.sun}`} />
      <MoonIcon className={`${styles.icon} ${styles.moon}`} />
    </button>
  )
}
