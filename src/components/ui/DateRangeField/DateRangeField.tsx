import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { CalendarIcon, CloseIcon } from '@/components/icons/Icons'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import { Calendar } from '@/components/ui/Calendar/Calendar'
import type { DateRangeDraft, UseDateRangePickerParams } from '@/hooks/useDateRangePicker'
import { formatShortDateLabel } from '@/lib/date/format'
import { getFocusableElements } from '@/lib/dom/focusable'
import styles from './DateRangeField.module.css'

// Below this width the picker is a full-screen modal dialog; above it, a
// non-modal popover anchored to the field.
const DESKTOP_QUERY = '(min-width: 48rem)'

// The desktop popover is position: fixed and placed from measured boxes,
// so it stays inside the visible area wherever the field sits: a narrow
// sidebar near the right edge at 960–1024px, a short 768px window, or
// under the sticky header.
const VIEWPORT_MARGIN = 12
const POPOVER_GAP = 8
const POPOVER_MIN_HEIGHT = 240

function matchesDesktop(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
}

export interface DateRangeFieldProps extends Omit<UseDateRangePickerParams, 'value' | 'onChange'> {
  id: string
  label?: string
  value: DateRangeDraft
  onChange: (range: DateRangeDraft) => void
  describedBy?: string
  invalid?: boolean
  onOpenChange?: (isOpen: boolean) => void
  ref?: Ref<HTMLButtonElement>
}

interface PopoverLayout {
  top: number
  left: number
  // null when the whole calendar fits, so no needless scrollbar appears.
  maxHeight: number | null
}

function layoutsEqual(a: PopoverLayout | null, b: PopoverLayout): boolean {
  return a !== null && a.top === b.top && a.left === b.left && a.maxHeight === b.maxHeight
}

export function DateRangeField({
  id,
  label = 'Dates',
  value,
  onChange,
  describedBy,
  invalid = false,
  onOpenChange,
  ref,
  ...calendarProps
}: DateRangeFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(matchesDesktop)
  const [layout, setLayout] = useState<PopoverLayout | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const contentId = `${id}-content`
  const labelId = `${id}-label`
  const dialogTitleId = `${id}-dialog-title`

  // Keeps the internal triggerRef and any forwarded ref on the same node.
  function setTriggerRef(node: HTMLButtonElement | null) {
    triggerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  // Desktop popover placement, in viewport coordinates: below the field if
  // the whole calendar fits, otherwise above it (clear of the sticky
  // header), otherwise pinned inside the visible area with its own scroll.
  // Horizontally it starts at the field's left edge and slides left only as
  // far as needed to stay on screen. Re-measured on resize and scroll.
  useLayoutEffect(() => {
    if (!isOpen || !isDesktop) return

    function updateLayout() {
      const trigger = triggerRef.current
      const wrapper = wrapperRef.current
      const popover = contentRef.current
      if (!trigger || !wrapper || !popover) return

      const triggerRect = trigger.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()
      const viewportWidth = document.documentElement.clientWidth
      const viewportHeight = window.innerHeight
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      const safeTop = Math.max(headerBottom, 0) + VIEWPORT_MARGIN
      const safeBottom = viewportHeight - VIEWPORT_MARGIN
      const needed = popover.scrollHeight

      let top: number
      if (triggerRect.bottom + POPOVER_GAP + needed <= safeBottom) {
        top = triggerRect.bottom + POPOVER_GAP
      } else if (wrapperRect.top - POPOVER_GAP - needed >= safeTop) {
        top = wrapperRect.top - POPOVER_GAP - needed
      } else {
        top = Math.max(safeTop, Math.min(triggerRect.bottom + POPOVER_GAP, safeBottom - needed))
      }
      const available = Math.floor(safeBottom - top)
      const maxHeight = needed <= available ? null : Math.max(available, POPOVER_MIN_HEIGHT)

      const width = popover.offsetWidth
      const left = Math.max(
        VIEWPORT_MARGIN,
        Math.min(wrapperRect.left, viewportWidth - VIEWPORT_MARGIN - width),
      )

      const next = { top: Math.round(top), left: Math.round(left), maxHeight }
      setLayout((current) => (layoutsEqual(current, next) ? current : next))
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    window.addEventListener('scroll', updateLayout, true)
    return () => {
      window.removeEventListener('resize', updateLayout)
      window.removeEventListener('scroll', updateLayout, true)
    }
  }, [isOpen, isDesktop])

  const closeField = useCallback(
    (returnFocus: boolean) => {
      setIsOpen(false)
      setLayout(null)
      onOpenChange?.(false)
      if (returnFocus) triggerRef.current?.focus()
    },
    [onOpenChange],
  )

  // Crossing the breakpoint while open swaps popover and dialog markup, so
  // close and hand focus back to the trigger rather than lose it.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)

    function handleChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches)
      if (isOpen) closeField(true)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isOpen, closeField])

  function handleTriggerClick() {
    if (isOpen) closeField(true)
    else {
      setIsOpen(true)
      onOpenChange?.(true)
    }
  }

  function handleClear() {
    onChange({ start: null, end: null })
  }

  // The inline clear button unmounts the instant it's clicked (it only
  // renders while a date is set), so refocus the trigger explicitly.
  function handleClearFromTrigger() {
    onChange({ start: null, end: null })
    triggerRef.current?.focus()
  }

  function handleCalendarChange(range: DateRangeDraft) {
    onChange(range)
    closeField(true)
  }

  // Desktop popover is non-modal: an outside pointerdown closes it.
  useEffect(() => {
    if (!isOpen || !isDesktop) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && wrapperRef.current?.contains(target)) return
      closeField(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, isDesktop, closeField])

  // Desktop only: tabbing out of the popover closes it. The mobile dialog
  // is portaled, but React's synthetic blur still bubbles here, hence the
  // guard.
  function handleWrapperBlur(event: FocusEvent<HTMLDivElement>) {
    if (!isDesktop || !isOpen) return
    const next = event.relatedTarget
    if (next instanceof Node && wrapperRef.current?.contains(next)) return
    closeField(false)
  }

  // One Escape handler for both popover and dialog: synthetic events bubble
  // through the portal into this wrapper.
  function handleWrapperKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isOpen || event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    closeField(true)
  }

  // Mobile dialog is modal: Tab and Shift+Tab wrap inside it.
  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return

    const dialog = contentRef.current
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

  // Mobile-only scroll lock while the full-screen dialog is open.
  useEffect(() => {
    if (!isOpen || isDesktop) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, isDesktop])

  // Until measured (the first layout pass) it is transparent, so it never
  // flashes at the wrong spot. Opacity, not visibility: hidden — the
  // calendar moves focus into it on open, and hidden elements can't take
  // focus.
  const popoverStyle: CSSProperties = layout
    ? { top: layout.top, left: layout.left, maxHeight: layout.maxHeight ?? undefined }
    : { opacity: 0 }

  const startLabel = value.start ? formatShortDateLabel(value.start, calendarProps.locale) : 'Add date'
  const endLabel = value.end ? formatShortDateLabel(value.end, calendarProps.locale) : 'Add date'

  return (
    <div className={styles.wrapper} ref={wrapperRef} onBlur={handleWrapperBlur} onKeyDown={handleWrapperKeyDown}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.control}>
        <button
          ref={setTriggerRef}
          id={id}
          type="button"
          className={[styles.trigger, invalid && styles.invalid, value.start !== null && styles.hasClear]
            .filter(Boolean)
            .join(' ')}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? contentId : undefined}
          aria-invalid={invalid || undefined}
          aria-labelledby={`${labelId} ${id}`}
          aria-describedby={describedBy}
          onClick={handleTriggerClick}
        >
          <CalendarIcon className={styles.calendarIcon} />
          <span className={styles.segment}>
            <span className={styles.segmentLabel}>Check-in</span>
            <span className={value.start ? styles.segmentValue : styles.segmentPlaceholder}>{startLabel}</span>
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.segment}>
            <span className={styles.segmentLabel}>Check-out</span>
            <span className={value.end ? styles.segmentValue : styles.segmentPlaceholder}>{endLabel}</span>
          </span>
        </button>

        {value.start !== null && (
          <button type="button" className={styles.clearButton} aria-label="Clear dates" onClick={handleClearFromTrigger}>
            <CloseIcon />
          </button>
        )}
      </div>

      {isOpen && isDesktop && (
        <div
          ref={contentRef}
          id={contentId}
          role="dialog"
          aria-label="Choose dates"
          className={styles.popover}
          style={popoverStyle}
        >
          <Calendar autoFocus value={value} onChange={handleCalendarChange} {...calendarProps} />
        </div>
      )}

      {isOpen &&
        !isDesktop &&
        createPortal(
          <div className={styles.backdrop}>
            <div
              ref={contentRef}
              id={contentId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className={styles.dialog}
              onKeyDown={handleDialogKeyDown}
            >
              <div className={styles.dialogHeader}>
                <h2 id={dialogTitleId} className={styles.dialogTitle}>
                  Choose dates
                </h2>
                <button
                  type="button"
                  className={styles.dialogClose}
                  aria-label="Close date picker"
                  onClick={() => closeField(true)}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className={styles.dialogBody}>
                <Calendar autoFocus value={value} onChange={handleCalendarChange} {...calendarProps} />
              </div>
              <div className={styles.dialogActions}>
                <button type="button" className={buttonClass({ variant: 'secondary' })} onClick={handleClear}>
                  Clear dates
                </button>
                <button type="button" className={buttonClass()} onClick={() => closeField(true)}>
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
