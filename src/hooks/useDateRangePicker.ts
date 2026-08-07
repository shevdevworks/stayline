import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDays,
  addMonths,
  checkRangeLength,
  clampIso,
  compareIso,
  diffInDays,
  endOfMonth,
  fromIso,
  toIso,
  todayIso,
} from '@/lib/date/isoDate'
import { formatMonthLabel, getWeekdayLabels } from '@/lib/date/format'
import { getMonthGrid } from '@/lib/date/monthGrid'
import type { IsoDate, MonthGridDay, WeekStartsOn } from '@/lib/date/types'

export interface DateRangeDraft {
  start: IsoDate | null
  end: IsoDate | null
}

export type DateRangeRejectionReason = 'too-short' | 'too-long'

export interface DayState {
  isDisabled: boolean
  isToday: boolean
  isSelected: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  isPreview: boolean
  isFocused: boolean
}

export interface VisibleMonth {
  year: number
  month: number
  label: string
  weeks: MonthGridDay[][]
}

export interface UseDateRangePickerParams {
  value: DateRangeDraft
  onChange: (range: DateRangeDraft) => void
  minDate?: IsoDate | null
  maxDate?: IsoDate | null
  minDays?: number
  maxDays?: number | null
  isDateDisabled?: (iso: IsoDate) => boolean
  onRejectedSelection?: (reason: DateRangeRejectionReason) => void
  onSelectionStart?: () => void
  numberOfMonths?: number
  weekStartsOn?: WeekStartsOn
  locale?: string
}

export interface UseDateRangePickerResult {
  draftRange: DateRangeDraft
  hoveredDate: IsoDate | null
  focusedDate: IsoDate
  visibleMonths: VisibleMonth[]
  weekdayLabels: string[]
  setHoveredDate: (iso: IsoDate | null) => void
  selectDate: (iso: IsoDate) => void
  getDayState: (iso: IsoDate) => DayState
  focusDate: (iso: IsoDate) => void
  moveFocusByDays: (amount: number) => void
  moveFocusByMonths: (amount: number) => void
  focusStartOfWeek: () => void
  focusEndOfWeek: () => void
  selectFocused: () => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  canGoPrevious: boolean
  canGoNext: boolean
}

interface YearMonth {
  year: number
  month: number
}

function toYearMonth(iso: IsoDate): YearMonth {
  const [year, month] = iso.split('-').map(Number)
  return { year, month }
}

function yearMonthToIso(yearMonth: YearMonth): IsoDate {
  return toIso(new Date(yearMonth.year, yearMonth.month - 1, 1))
}

function rangesEqual(a: DateRangeDraft, b: DateRangeDraft): boolean {
  return a.start === b.start && a.end === b.end
}

export function useDateRangePicker({
  value,
  onChange,
  minDate = null,
  maxDate = null,
  minDays = 1,
  maxDays = null,
  isDateDisabled,
  onRejectedSelection,
  onSelectionStart,
  numberOfMonths = 1,
  weekStartsOn = 1,
  locale = 'en-GB',
}: UseDateRangePickerParams): UseDateRangePickerResult {
  // Shared so focusedDate and firstVisibleMonth can't start out of sync: if
  // minDate is in the future, both must open on it, not on today's month.
  const initialFocusedDate = clampIso(value.start ?? todayIso(), minDate, maxDate)

  const [draftRange, setDraftRange] = useState<DateRangeDraft>(value)
  const [hoveredDate, setHoveredDate] = useState<IsoDate | null>(null)
  const [focusedDate, setFocusedDate] = useState<IsoDate>(initialFocusedDate)
  const [firstVisibleMonth, setFirstVisibleMonth] = useState<YearMonth>(
    toYearMonth(initialFocusedDate),
  )

  // Tracks the last range this hook itself emitted via onChange, so the
  // effect below can tell "our own echo" apart from a genuine external
  // change (reset, navigation) — same idiom as useDebouncedInput's lastSentRef.
  const lastEmittedRef = useRef<DateRangeDraft>(value)

  useEffect(() => {
    if (rangesEqual(value, lastEmittedRef.current)) return
    lastEmittedRef.current = value
    setDraftRange(value)
  }, [value])

  const today = useMemo(() => todayIso(), [])

  function isDisabledCombined(iso: IsoDate): boolean {
    if (minDate !== null && compareIso(iso, minDate) < 0) return true
    if (maxDate !== null && compareIso(iso, maxDate) > 0) return true
    if (isDateDisabled && isDateDisabled(iso)) return true
    return false
  }

  function hasDisabledBetween(start: IsoDate, candidate: IsoDate): boolean {
    const span = diffInDays(start, candidate)
    for (let i = 1; i < span; i++) {
      if (isDisabledCombined(addDays(start, i))) return true
    }
    return false
  }

  // Range length is inclusive: start === candidate is a 1-day booking, so
  // minDays: 1 (the default) allows selecting the same day twice.
  function validateDays(start: IsoDate, candidate: IsoDate): 'valid' | DateRangeRejectionReason {
    return checkRangeLength(start, candidate, { minDays, maxDays })
  }

  // hasDisabledBetween and validateDays are the same checks selectDate
  // performs; this function itself only exists for getDayState's preview
  // highlight, so the preview matches exactly what selectDate would accept.
  function isAcceptableCandidate(start: IsoDate, candidate: IsoDate): boolean {
    return (
      compareIso(candidate, start) >= 0 &&
      !isDisabledCombined(candidate) &&
      !hasDisabledBetween(start, candidate) &&
      validateDays(start, candidate) === 'valid'
    )
  }

  function selectDate(iso: IsoDate) {
    if (isDisabledCombined(iso)) return

    const { start, end } = draftRange

    if (start === null || end !== null) {
      onSelectionStart?.()
      setDraftRange({ start: iso, end: null })
      return
    }

    // start is set, end is null from here on.
    if (compareIso(iso, start) < 0) {
      // Strictly earlier than start — restart from the clicked day.
      onSelectionStart?.()
      setDraftRange({ start: iso, end: null })
      return
    }

    // iso === start falls through here as a candidate 1-day range, subject
    // to the same disabled-between and minDays/maxDays checks as any other
    // candidate (hasDisabledBetween is trivially false for a same-day span).
    if (hasDisabledBetween(start, iso)) {
      onSelectionStart?.()
      setDraftRange({ start: iso, end: null })
      return
    }

    const validation = validateDays(start, iso)
    if (validation !== 'valid') {
      onRejectedSelection?.(validation)
      return
    }

    const nextRange: DateRangeDraft = { start, end: iso }
    lastEmittedRef.current = nextRange
    setDraftRange(nextRange)
    onChange(nextRange)
  }

  function getDayState(iso: IsoDate): DayState {
    const { start, end } = draftRange
    const isRangeStart = start !== null && iso === start
    const isRangeEnd = end !== null && iso === end
    const isInRange =
      start !== null && end !== null && compareIso(iso, start) > 0 && compareIso(iso, end) < 0
    const isPreview =
      start !== null &&
      end === null &&
      hoveredDate !== null &&
      isAcceptableCandidate(start, hoveredDate) &&
      compareIso(iso, start) > 0 &&
      compareIso(iso, hoveredDate) <= 0

    return {
      isDisabled: isDisabledCombined(iso),
      isToday: iso === today,
      isSelected: isRangeStart || isRangeEnd,
      isRangeStart,
      isRangeEnd,
      isInRange,
      isPreview,
      isFocused: iso === focusedDate,
    }
  }

  // Moves focus and, only if the new date fell outside the visible months,
  // brings it back into view. Called directly from the navigation methods
  // below (not from an effect) so both state updates happen in the same
  // action instead of goToPreviousMonth/goToNextMonth's own firstVisibleMonth
  // change (which doesn't move focusedDate) getting undone on the next render.
  function setFocus(next: IsoDate) {
    setFocusedDate(next)
    setFirstVisibleMonth((current) => {
      const focused = toYearMonth(next)
      const index = (focused.year - current.year) * 12 + (focused.month - current.month)
      if (index >= 0 && index < numberOfMonths) return current
      return focused
    })
  }

  function focusDate(iso: IsoDate) {
    setFocus(clampIso(iso, minDate, maxDate))
  }

  function moveFocusByDays(amount: number) {
    setFocus(clampIso(addDays(focusedDate, amount), minDate, maxDate))
  }

  function moveFocusByMonths(amount: number) {
    setFocus(clampIso(addMonths(focusedDate, amount), minDate, maxDate))
  }

  function focusStartOfWeek() {
    const weekday = fromIso(focusedDate).getDay()
    const diff = (weekday - weekStartsOn + 7) % 7
    setFocus(clampIso(addDays(focusedDate, -diff), minDate, maxDate))
  }

  function focusEndOfWeek() {
    const weekday = fromIso(focusedDate).getDay()
    const diff = (weekStartsOn + 6 - weekday + 7) % 7
    setFocus(clampIso(addDays(focusedDate, diff), minDate, maxDate))
  }

  function selectFocused() {
    selectDate(focusedDate)
  }

  const firstVisibleIso = yearMonthToIso(firstVisibleMonth)

  const canGoPrevious =
    minDate === null || compareIso(endOfMonth(addMonths(firstVisibleIso, -1)), minDate) >= 0

  const canGoNext =
    maxDate === null || compareIso(addMonths(firstVisibleIso, numberOfMonths), maxDate) <= 0

  function goToPreviousMonth() {
    if (!canGoPrevious) return
    setFirstVisibleMonth(toYearMonth(addMonths(firstVisibleIso, -1)))
  }

  function goToNextMonth() {
    if (!canGoNext) return
    setFirstVisibleMonth(toYearMonth(addMonths(firstVisibleIso, 1)))
  }

  const visibleMonths = useMemo<VisibleMonth[]>(() => {
    const months: VisibleMonth[] = []
    for (let i = 0; i < numberOfMonths; i++) {
      const monthIso = addMonths(firstVisibleIso, i)
      const { year, month } = toYearMonth(monthIso)
      months.push({
        year,
        month,
        label: formatMonthLabel(year, month, locale),
        weeks: getMonthGrid({ year, month, weekStartsOn }),
      })
    }
    return months
  }, [firstVisibleIso, numberOfMonths, weekStartsOn, locale])

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(weekStartsOn, locale),
    [weekStartsOn, locale],
  )

  return {
    draftRange,
    hoveredDate,
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
  }
}
