import type { ChangeEvent, KeyboardEvent, Ref } from 'react'
import styles from './TextArea.module.css'

export interface TextAreaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  hint?: string
  invalid?: boolean
  describedBy?: string
  visuallyHiddenLabel?: boolean
  onBlur?: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  ref?: Ref<HTMLTextAreaElement>
}

const DEFAULT_ROWS = 4

export function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = DEFAULT_ROWS,
  hint,
  invalid = false,
  describedBy,
  visuallyHiddenLabel = false,
  onBlur,
  onKeyDown,
  ref,
}: TextAreaProps) {
  const hintId = `${id}-hint`
  const describedByIds =
    [describedBy, hint ? hintId : undefined].filter(Boolean).join(' ') || undefined

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value)
  }

  const textareaClassName = [styles.textarea, invalid && styles.invalid].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={visuallyHiddenLabel ? styles.labelHidden : styles.label}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        aria-invalid={invalid || undefined}
        aria-describedby={describedByIds}
        className={textareaClassName}
      />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}
