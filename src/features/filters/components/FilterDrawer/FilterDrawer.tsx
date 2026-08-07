import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import type { VenueFilters } from '@/features/filters/types'
import type { FilterFacetsStatus } from '@/features/filters/useFilterFacets'
import { getFocusableElements } from '@/lib/dom/focusable'
import type { FilterFacets } from '@/types'
import { FilterPanel } from '../FilterPanel/FilterPanel'
import styles from './FilterDrawer.module.css'

const DESKTOP_QUERY = '(min-width: 60rem)'

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.closeIcon}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  )
}

export interface FilterDrawerProps {
  filters: VenueFilters
  facets: FilterFacets | null
  facetsStatus: FilterFacetsStatus
  onFacetsRetry: () => void
  onPatch: (patch: Partial<VenueFilters>) => void
  onReset: () => void
  activeCount: number
}

export function FilterDrawer({
  filters,
  facets,
  facetsStatus,
  onFacetsRetry,
  onPatch,
  onReset,
  activeCount,
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const uid = useId()
  const titleId = `${uid}-title`

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!isOpen) return
    closeButtonRef.current?.focus()
  }, [isOpen])

  // Crossing into the desktop layout hides the trigger via CSS but React
  // state doesn't know that — without this, the dialog would keep rendering
  // on top of the now-visible sidebar. Closing here skips the focus restore
  // deliberately: the trigger is display:none at this width, so focusing it
  // is a no-op and would just drop focus to <body>.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)

    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setIsOpen((current) => (current ? false : current))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const currentPaddingRight = Number.parseFloat(previousPaddingRight) || 0
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [isOpen])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key !== 'Tab') return

    const dialog = dialogRef.current
    if (!dialog) return

    const focusable = getFocusableElements(dialog)
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    close()
  }

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.trigger} onClick={open}>
        Filters
        {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
      </button>

      {isOpen &&
        createPortal(
          <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={styles.dialog}
              onKeyDown={handleKeyDown}
            >
              <div className={styles.dialogHeader}>
                <h2 id={titleId} className={styles.title}>
                  Filters
                </h2>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close filters"
                  onClick={close}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className={styles.dialogBody}>
                <FilterPanel
                  filters={filters}
                  facets={facets}
                  facetsStatus={facetsStatus}
                  onFacetsRetry={onFacetsRetry}
                  onPatch={onPatch}
                  onReset={onReset}
                  activeCount={activeCount}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
