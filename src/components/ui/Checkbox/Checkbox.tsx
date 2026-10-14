import type { ReactNode, Ref } from 'react'
import { CheckIcon } from '@/components/icons/Icons'
import styles from './Checkbox.module.css'

export interface CheckboxProps {
  id: string
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  invalid?: boolean
  describedBy?: string
  onBlur?: () => void
  ref?: Ref<HTMLInputElement>
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  description,
  invalid = false,
  describedBy,
  onBlur,
  ref,
}: CheckboxProps) {
  const descriptionId = `${id}-description`
  const describedByIds = [describedBy, description ? descriptionId : undefined].filter(Boolean).join(' ') || undefined

  const boxClassName = [styles.box, invalid && styles.invalid].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.option}>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={styles.nativeInput}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByIds}
        />
        <span className={boxClassName} aria-hidden="true">
          <CheckIcon className={styles.checkIcon} />
        </span>
        <span className={styles.optionLabel}>{label}</span>
      </label>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
    </div>
  )
}
