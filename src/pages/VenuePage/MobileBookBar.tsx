import { useEffect, useState } from 'react'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import { formatPrice } from '@/lib/price'
import styles from './MobileBookBar.module.css'

export interface MobileBookBarProps {
  pricePerDay: number
  // id of the price panel this bar stands in for while it's off-screen.
  targetId: string
}

// Below the desktop breakpoint the price panel sits after the whole
// description, so without this the only way to book is a long scroll.
// Hidden via CSS on desktop, where the panel is a sidebar anyway, and
// hidden here once the panel is on screen or already scrolled past (so it
// never sits on top of the footer).
export function MobileBookBar({ pricePerDay, targetId }: MobileBookBarProps) {
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return

    const observer = new IntersectionObserver(([entry]) =>
      setIsHidden(entry.isIntersecting || entry.boundingClientRect.bottom < 0),
    )
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

  return (
    <div className={styles.bar} data-hidden={isHidden || undefined} inert={isHidden}>
      <p className={styles.price}>
        <span className={styles.priceValue}>{formatPrice(pricePerDay)}</span>
        <span className={styles.priceUnit}> / day</span>
      </p>
      <button type="button" className={buttonClass()} onClick={handleClick}>
        Check availability
      </button>
    </div>
  )
}
