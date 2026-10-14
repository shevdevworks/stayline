import { useEffect, useId, useMemo, useRef, type KeyboardEvent } from 'react'
import {
  useDateRangePicker,
  type UseDateRangePickerParams,
} from '@/hooks/useDateRangePicker'
import { formatDateLabel } from '@/lib/date/format'
import type { IsoDate, WeekStartsOn } from '@/lib/date/types'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons/Icons'
import styles from './Calendar.module.css'

export interface CalendarProps extends UseDateRangePickerParams {
  autoFocus?: boolean
}

// Same anchor idiom as lib/date/format.ts's getWeekdayLabels, but for the
// long weekday names the <abbr title> needs — kept local since lib/date is
// frozen for this component and nothing else needs the long form.
const WEEKDAY_REFERENCE_SUNDAY = new Date(2026, 0, 4)

function getWeekdayLongLabels(weekStartsOn: WeekStartsOn, locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })
  const labels: string[] = []

  for (let i = 0; i < 7; i++) {
    const dayOffset = (weekStartsOn + i) % 7
    const date = new Date(
      WEEKDAY_REFERENCE_SUNDAY.getFullYear(),
      WEEKDAY_REFERENCE_SUNDAY.getMonth(),
      WEEKDAY_REFERENCE_SUNDAY.getDate() + dayOffset,
    )
    labels.push(formatter.format(date))
  }

  return labels
}

export function Calendar(props: CalendarProps) {
  const { locale = 'en-GB', weekStartsOn = 1, autoFocus = false } = props

  const {
    focusedDate,
    visibleMonths,
    weekdayLabels,
    setHoveredDate,
    selectDate,
    getDayState,
    focusDate,
    moveFocusByDays,
    moveFocusByMonths,
    focusStartOfWeek,
    focusEndOfWeek,
    selectFocused,
    goToPreviousMonth,
    goToNextMonth,
    canGoPrevious,
    canGoNext,
  } = useDateRangePicker(props)

  const uid = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const weekdayLongLabels = useMemo(
    () => getWeekdayLongLabels(weekStartsOn, locale),
    [weekStartsOn, locale],
  )

  // focusedDate can fall outside visibleMonths right after a mouse click on
  // the prev/next nav buttons: those only move firstVisibleMonth, they never
  // touch focusedDate (only the hook's own keyboard movers resync it). The
  // roving tabindex needs a fallback for that case or the grid becomes
  // untabbable.
  const isFocusedDateVisible = visibleMonths.some(
    (month) => focusedDate.slice(0, 7) === `${month.year}-${String(month.month).padStart(2, '0')}`,
  )
  const fallbackIso = visibleMonths[0]?.weeks
    .flat()
    .find((day) => !day.isOutsideMonth)?.iso
  const tabbableIso = isFocusedDateVisible ? focusedDate : fallbackIso

  // When a keyboard move crosses a month boundary, the currently-focused day
  // button gets unmounted (its month table is swapped out), which makes the
  // browser force focus onto <body> synchronously, before this effect ever
  // runs. containerRef.contains(document.activeElement) would then read
  // false and the effect would wrongly skip refocusing, kicking the user
  // out of the grid. Keyboard handlers know for certain focus was inside the
  // calendar the instant they fired (that's how DOM event dispatch works),
  // so they record that fact here rather than relying on a post-render check
  // that a same-tick DOM removal can already have invalidated.
  //
  // Seeding this with autoFocus reuses that same mechanism for the initial
  // mount: the effect below already runs once after mount, so a true
  // initial value makes that first run focus focusedDate's button without
  // a second, separate DOM query. It's consumed and reset to false inside
  // that same run, so it never affects the keyboard-move path afterward.
  const keyboardMoveRef = useRef(autoFocus)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const shouldSync = keyboardMoveRef.current || container.contains(document.activeElement)
    keyboardMoveRef.current = false
    if (!shouldSync) return

    const target = container.querySelector<HTMLButtonElement>(`[data-iso="${focusedDate}"]`)
    target?.focus()
  }, [focusedDate])

  function handleDayClick(iso: IsoDate) {
    if (iso !== focusedDate) focusDate(iso)
    selectDate(iso)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        keyboardMoveRef.current = true
        moveFocusByDays(-1)
        break
      case 'ArrowRight':
        event.preventDefault()
        keyboardMoveRef.current = true
        moveFocusByDays(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        keyboardMoveRef.current = true
        moveFocusByDays(-7)
        break
      case 'ArrowDown':
        event.preventDefault()
        keyboardMoveRef.current = true
        moveFocusByDays(7)
        break
      case 'PageUp':
        event.preventDefault()
        keyboardMoveRef.current = true
        moveFocusByMonths(event.shiftKey ? -12 : -1)
        break
      case 'PageDown':
        event.preventDefault()
        keyboardMoveRef.current = true
        moveFocusByMonths(event.shiftKey ? 12 : 1)
        break
      case 'Home':
        event.preventDefault()
        keyboardMoveRef.current = true
        focusStartOfWeek()
        break
      case 'End':
        event.preventDefault()
        keyboardMoveRef.current = true
        focusEndOfWeek()
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectFocused()
        break
      default:
        // Any other key means this keydown isn't a focus-moving action —
        // e.g. an arrow key clamped by minDate/maxDate leaves focusedDate
        // unchanged (clampIso returns the same value), so the effect never
        // reruns and a flag set above would stay stuck true until the next
        // real move, wrongly forcing a focus() call at that later point.
        keyboardMoveRef.current = false
        break
    }
  }

  const liveMonthText = visibleMonths.map((month) => month.label).join(' – ')

  return (
    <div ref={containerRef} className={styles.calendar}>
      <div className={styles.srOnly} aria-live="polite">
        {liveMonthText}
      </div>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous month"
          disabled={!canGoPrevious}
          onClick={goToPreviousMonth}
        >
          <ChevronLeftIcon className={styles.navIcon} />
        </button>
        <div className={styles.monthLabels}>
          {visibleMonths.map((month, index) => (
            <h3 key={`${month.year}-${month.month}`} id={`${uid}-month-${index}`} className={styles.monthLabel}>
              {month.label}
            </h3>
          ))}
        </div>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Next month"
          disabled={!canGoNext}
          onClick={goToNextMonth}
        >
          <ChevronRightIcon className={styles.navIcon} />
        </button>
      </div>
      <div className={styles.months} onKeyDown={handleKeyDown} onMouseLeave={() => setHoveredDate(null)}>
        {visibleMonths.map((month, index) => (
          <table
            key={`${month.year}-${month.month}`}
            role="grid"
            aria-labelledby={`${uid}-month-${index}`}
            className={styles.table}
          >
            <thead>
              <tr role="row">
                {weekdayLabels.map((label, weekdayIndex) => (
                  <th key={label + weekdayIndex} scope="col">
                    <abbr title={weekdayLongLabels[weekdayIndex]}>{label}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {month.weeks.map((week, weekIndex) => (
                <tr role="row" key={weekIndex}>
                  {week.map((day) => {
                    if (day.isOutsideMonth) {
                      return <td key={day.iso} role="gridcell" className={styles.cell} />
                    }

                    const state = getDayState(day.iso)

                    return (
                      <td key={day.iso} role="gridcell" aria-selected={state.isSelected} className={styles.cell}>
                        <button
                          type="button"
                          className={styles.day}
                          data-iso={day.iso}
                          data-selected={state.isSelected || undefined}
                          data-in-range={state.isInRange || undefined}
                          data-preview={state.isPreview || undefined}
                          data-today={state.isToday || undefined}
                          tabIndex={tabbableIso === day.iso ? 0 : -1}
                          aria-label={formatDateLabel(day.iso, locale)}
                          aria-disabled={state.isDisabled || undefined}
                          onClick={() => handleDayClick(day.iso)}
                          onFocus={() => {
                            setHoveredDate(day.iso)
                            focusDate(day.iso)
                          }}
                          onMouseEnter={() => setHoveredDate(day.iso)}
                        >
                          {Number(day.iso.slice(-2))}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <p className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={styles.legendStruck}>12</span> Unavailable
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} /> Today
        </span>
      </p>
    </div>
  )
}
