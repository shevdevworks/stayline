import { useId } from 'react'
import { useDebouncedInput } from '@/hooks/useDebouncedInput'
import { TextField } from '../TextField/TextField'
import { toDigits, toNumberOrNull } from './digits'
import styles from './NumberRangeField.module.css'

export interface NumberRangeFieldProps {
  legend: string
  min: number | null
  max: number | null
  onChange: (next: { min: number | null; max: number | null }) => void
  bounds?: { min: number; max: number }
  unit?: string
}

const DEBOUNCE_DELAY = 350

export function NumberRangeField({ legend, min, max, onChange, bounds, unit }: NumberRangeFieldProps) {
  const uid = useId()
  const minId = `${uid}-min`
  const maxId = `${uid}-max`
  const minLabel = unit ? `Minimum (${unit})` : 'Minimum'
  const maxLabel = unit ? `Maximum (${unit})` : 'Maximum'

  const minField = useDebouncedInput(
    min === null ? '' : String(min),
    (value) => onChange({ min: toNumberOrNull(value), max }),
    DEBOUNCE_DELAY,
  )

  const maxField = useDebouncedInput(
    max === null ? '' : String(max),
    (value) => onChange({ min, max: toNumberOrNull(value) }),
    DEBOUNCE_DELAY,
  )

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.fields}>
        <div className={styles.fieldWithUnit}>
          <TextField
            id={minId}
            label={minLabel}
            visuallyHiddenLabel
            value={minField.value}
            onChange={(raw) => minField.setValue(toDigits(raw))}
            onBlur={minField.flush}
            onKeyDown={(event) => {
              if (event.key === 'Enter') minField.flush()
            }}
            type="text"
            inputMode="numeric"
            placeholder={bounds ? String(bounds.min) : undefined}
          />
          {unit && (
            <span className={styles.unit} aria-hidden="true">
              {unit}
            </span>
          )}
        </div>
        <span className={styles.separator} aria-hidden="true">
          –
        </span>
        <div className={styles.fieldWithUnit}>
          <TextField
            id={maxId}
            label={maxLabel}
            visuallyHiddenLabel
            value={maxField.value}
            onChange={(raw) => maxField.setValue(toDigits(raw))}
            onBlur={maxField.flush}
            onKeyDown={(event) => {
              if (event.key === 'Enter') maxField.flush()
            }}
            type="text"
            inputMode="numeric"
            placeholder={bounds ? String(bounds.max) : undefined}
          />
          {unit && (
            <span className={styles.unit} aria-hidden="true">
              {unit}
            </span>
          )}
        </div>
      </div>
    </fieldset>
  )
}
