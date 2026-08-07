export type IsoDate = string

// 0 = Sunday … 6 = Saturday, matching Date.getDay() — kept as a union rather
// than a Monday/Sunday-only constant so any weekday can be "first".
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface MonthGridDay {
  iso: IsoDate
  isOutsideMonth: boolean
}

// Resolved, always-bounded interval — distinct from useDateRangePicker's
// DateRangeDraft, whose start/end are nullable draft-selection state.
export interface DateRange {
  start: IsoDate
  end: IsoDate
}

export interface GetMonthGridParams {
  year: number
  month: number
  weekStartsOn: WeekStartsOn
}
