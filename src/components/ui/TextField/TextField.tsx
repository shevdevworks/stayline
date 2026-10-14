import { useRef, type ChangeEvent, type HTMLAttributes, type KeyboardEvent, type Ref } from 'react'
import { CloseIcon } from '@/components/icons/Icons'
import styles from './TextField.module.css'

export interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel'
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  name?: string
  required?: boolean
  clearable?: boolean
  hint?: string
  invalid?: boolean
  describedBy?: string
  visuallyHiddenLabel?: boolean
  onBlur?: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  ref?: Ref<HTMLInputElement>
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  name,
  required = false,
  clearable = false,
  hint,
  invalid = false,
  describedBy,
  visuallyHiddenLabel = false,
  onBlur,
  onKeyDown,
  ref,
}: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = `${id}-hint`
  // Error first, then the hint: the error is the more urgent description.
  const describedByIds = [describedBy, hint ? hintId : undefined].filter(Boolean).join(' ') || undefined

  // Keeps the internally-used inputRef (Clear button refocus) and any
  // externally-forwarded ref pointed at the same node.
  function setInputRef(node: HTMLInputElement | null) {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  function handleClear() {
    // Move focus to the input before the value change unmounts this
    // button, otherwise focus falls back to <body>.
    inputRef.current?.focus()
    onChange('')
  }

  const inputClassName = [styles.input, invalid && styles.invalid, clearable && styles.hasClear]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={visuallyHiddenLabel ? 'sr-only' : styles.label}>
        {label}
        {required && !visuallyHiddenLabel && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className={styles.inputWrapper}>
        <input
          ref={setInputRef}
          id={id}
          name={name}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          spellCheck={type === 'email' ? false : undefined}
          autoCapitalize={type === 'email' ? 'off' : undefined}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByIds}
          className={inputClassName}
        />
        {clearable && value !== '' && (
          <button type="button" className={styles.clearButton} aria-label={`Clear ${label}`} onClick={handleClear}>
            <CloseIcon className={styles.icon} />
          </button>
        )}
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}
