import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { Calendar } from '@/components/ui/Calendar/Calendar'
import type { DateRangeDraft, UseDateRangePickerParams } from '@/hooks/useDateRangePicker'
import { formatShortDateLabel } from '@/lib/date/format'
import { getFocusableElements } from '@/lib/dom/focusable'
import styles from './DateRangeField.module.css'

const DESKTOP_QUERY = '(min-width: 60rem)'

// Keeps the popover clear of the viewport's bottom edge (a fixed CSS
// max-height can't do this: it doesn't know the trigger's own position,
// so it can still leave the popover's bottom hanging off-screen when the
// trigger sits low in a short viewport).
const POPOVER_VIEWPORT_MARGIN = 16
const POPOVER_MIN_HEIGHT = 200

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} role="presentation" aria-hidden="true" focusable="false">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export interface DateRangeFieldProps extends Omit<UseDateRangePickerParams, 'value' | 'onChange'> {
  id: string
  value: DateRangeDraft
  onChange: (range: DateRangeDraft) => void
  describedBy?: string
  invalid?: boolean
  onOpenChange?: (isOpen: boolean) => void
  ref?: Ref<HTMLButtonElement>
}

export function DateRangeField({
  id,
  value,
  onChange,
  describedBy,
  invalid = false,
  onOpenChange,
  ref,
  ...calendarProps
}: DateRangeFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  const [popoverPlacement, setPopoverPlacement] = useState<'below' | 'above'>('below')
  const [popoverMaxHeight, setPopoverMaxHeight] = useState<number | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const contentId = `${id}-content`

  // Keeps the internally-used triggerRef (popover positioning, return-focus
  // on close, refocus after Clear) and any externally-forwarded ref pointed
  // at the same node, without an externally-supplied ref this still works
  // standalone.
  function setTriggerRef(node: HTMLButtonElement | null) {
    triggerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  // Desktop-only: sizes and, if needed, flips the popover based on how much
  // room is actually left around the trigger — a fixed CSS max-height can't
  // do this, since it has no idea where the trigger sits, and can still
  // leave the popover's bottom hanging off-screen when the trigger is low
  // in a short viewport. Recomputed on resize/scroll since that position
  // can change while the popover stays open.
  useLayoutEffect(() => {
    if (!isOpen || !isDesktop) return

    function updateLayout() {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom - POPOVER_VIEWPORT_MARGIN
      const spaceAbove = rect.top - POPOVER_VIEWPORT_MARGIN

      if (spaceBelow < POPOVER_MIN_HEIGHT && spaceAbove > spaceBelow) {
        setPopoverPlacement('above')
        setPopoverMaxHeight(Math.max(spaceAbove, POPOVER_MIN_HEIGHT))
      } else {
        setPopoverPlacement('below')
        setPopoverMaxHeight(Math.max(spaceBelow, POPOVER_MIN_HEIGHT))
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    window.addEventListener('scroll', updateLayout, true)
    return () => {
      window.removeEventListener('resize', updateLayout)
      window.removeEventListener('scroll', updateLayout, true)
    }
  }, [isOpen, isDesktop])

  const closeField = useCallback((returnFocus: boolean) => {
    setIsOpen(false)
    onOpenChange?.(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [onOpenChange])

  // Re-subscribes whenever isOpen changes — cheap, and avoids handleChange
  // closing over a stale isOpen. setIsDesktop here is fine under
  // react-hooks/set-state-in-effect: the call happens inside the 'change'
  // event listener, not in the effect body itself.
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

  // The trigger's own clear button unmounts the instant it's clicked (its
  // render condition is value.start !== null), which would otherwise drop
  // DOM focus onto <body> — refocus the trigger explicitly.
  function handleClearFromTrigger() {
    onChange({ start: null, end: null })
    triggerRef.current?.focus()
  }

  function handleCalendarChange(range: DateRangeDraft) {
    onChange(range)
    if (isDesktop) closeField(true)
  }

  // Desktop-only: closes on any pointerdown outside the wrapper, mirroring
  // Select's outside-click pattern (not FilterDrawer's backdrop click, which
  // is for a modal overlay and doesn't apply to a non-modal popover).
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

  // Desktop-only: closes when focus leaves the component entirely. Guarded
  // for desktop because the mobile dialog is portaled to document.body but
  // React's synthetic blur still bubbles through the virtual tree to this
  // handler — without the guard, a blur inside the portaled dialog would
  // incorrectly trigger this desktop-only close.
  function handleWrapperBlur(event: FocusEvent<HTMLDivElement>) {
    if (!isDesktop) return
    const next = event.relatedTarget
    if (next instanceof Node && wrapperRef.current?.contains(next)) return
    closeField(false)
  }

  // Single Escape handler for both the popover and the mobile dialog: React's
  // synthetic events bubble through the portal into this same wrapper, so a
  // second Escape branch on the dialog itself would double-fire.
  function handleWrapperKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isOpen) return
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    closeField(true)
  }

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

  // Mobile-only scroll lock, verbatim FilterDrawer pattern.
  useEffect(() => {
    if (!isOpen || isDesktop) return

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
  }, [isOpen, isDesktop])

  return (
    <div
      className={styles.wrapper}
      ref={wrapperRef}
      onBlur={handleWrapperBlur}
      onKeyDown={handleWrapperKeyDown}
    >
      <div className={styles.control}>
        <button
          ref={setTriggerRef}
          id={id}
          type="button"
          className={[styles.trigger, invalid && styles.invalid].filter(Boolean).join(' ')}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onClick={handleTriggerClick}
        >
          <span className={styles.segment}>
            <span className={styles.segmentLabel}>Check-in</span>
            <span className={styles.segmentValue}>
              {value.start ? formatShortDateLabel(value.start, calendarProps.locale) : 'Add date'}
            </span>
          </span>
          <span className={styles.segment}>
            <span className={styles.segmentLabel}>Check-out</span>
            <span className={styles.segmentValue}>
              {value.end ? formatShortDateLabel(value.end, calendarProps.locale) : 'Add date'}
            </span>
          </span>
        </button>

        {value.start !== null && (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Clear dates"
            onClick={handleClearFromTrigger}
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {isOpen && isDesktop && (
        <div
          ref={contentRef}
          id={contentId}
          role="dialog"
          aria-label="Select dates"
          className={styles.popover}
          data-placement={popoverPlacement}
          style={popoverMaxHeight !== null ? { maxHeight: popoverMaxHeight } : undefined}
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
              aria-label="Select dates"
              className={styles.dialog}
              onKeyDown={handleDialogKeyDown}
            >
              <Calendar autoFocus value={value} onChange={handleCalendarChange} {...calendarProps} />
              <div className={styles.dialogActions}>
                <button type="button" className={styles.dialogButton} onClick={handleClear}>
                  Clear
                </button>
                <button type="button" className={styles.dialogButton} onClick={() => closeField(true)}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
