import { useId } from 'react'
import styles from './RadioGroup.module.css'

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  legend: string
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
}

// Native radios in a fieldset: arrow-key movement, the single tab stop and
// the group semantics all come from the browser.
export function RadioGroup({ legend, name, options, value, onChange }: RadioGroupProps) {
  const uid = useId()

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.list}>
        {options.map((option) => {
          const inputId = `${uid}-${option.value}`
          return (
            <label key={option.value} htmlFor={inputId} className={styles.option}>
              <input
                id={inputId}
                type="radio"
                name={`${uid}-${name}`}
                value={option.value}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
                className={styles.nativeInput}
              />
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
