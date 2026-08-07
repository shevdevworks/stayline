import {
  useRef,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
} from 'react'
import styles from './TextField.module.css'

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.icon}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  )
}

export interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number'
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  min?: number
  max?: number
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
  min,
  max,
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
  const describedByIds =
    [describedBy, hint ? hintId : undefined].filter(Boolean).join(' ') || undefined

  // Keeps the internally-used inputRef (Clear button refocus) and any
  // externally-forwarded ref pointed at the same node, without an
  // externally-supplied ref this still works standalone.
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
      <label htmlFor={id} className={visuallyHiddenLabel ? styles.labelHidden : styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          ref={setInputRef}
          id={id}
          type={type}
          inputMode={inputMode}
          min={min}
          max={max}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByIds}
          className={inputClassName}
        />
        {clearable && value !== '' && (
          <button
            type="button"
            className={styles.clearButton}
            aria-label={`Clear ${label}`}
            onClick={handleClear}
          >
            <ClearIcon />
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
