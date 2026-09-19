import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/price'
import styles from './MobileBookBar.module.css'

export interface MobileBookBarProps {
  pricePerDay: number
  // id of the price panel this bar stands in for while it's off-screen.
  targetId: string
}

// Below the desktop breakpoint the price panel sits after the whole
// description, so without this the only way to book is a long scroll.
// Hidden via CSS on desktop, where the panel is a sticky sidebar anyway.
export function MobileBookBar({ pricePerDay, targetId }: MobileBookBarProps) {
  const [isTargetVisible, setIsTargetVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => setIsTargetVisible(entry.isIntersecting))
    observer.observe(target)
    return () => observer.disconnect()
  }, [targetId])

  function handleClick() {
    const target = document.getElementById(targetId)
    if (!target) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    // Moves keyboard/screen-reader position along with the scroll.
    target.focus({ preventScroll: true })
  }

  if (isTargetVisible) return null

  return (
    <div className={styles.bar}>
      <p className={styles.price}>
        {formatPrice(pricePerDay)} <span className={styles.priceUnit}>/ day</span>
      </p>
      <button type="button" className={styles.button} onClick={handleClick}>
        Check dates
      </button>
    </div>
  )
}
