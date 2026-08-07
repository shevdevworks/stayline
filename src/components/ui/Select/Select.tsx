import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import styles from './Select.module.css'

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.chevron}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9l6 6 6-6"
      />
    </svg>
  )
}

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

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  id: string
  label: string
  value: string | null
  options: SelectOption[]
  onChange: (value: string | null) => void
  placeholder?: string
  clearable?: boolean
}

const TYPEAHEAD_RESET_MS = 500

export function Select({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  clearable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeaheadBufferRef = useRef('')
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const labelId = `${id}-label`
  const listboxId = `${id}-listbox`
  const optionId = (index: number) => `${id}-option-${index}`

  const selectedIndex = value === null ? -1 : options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null

  // Closes on any pointerdown outside the wrapper. Runs only while open, and
  // is removed as soon as it closes so it never fights the trigger's own
  // onClick toggle.
  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && wrapperRef.current?.contains(target)) return
      setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const activeElement = listRef.current?.querySelector<HTMLLIElement>(
      `[data-index="${activeIndex}"]`,
    )
    activeElement?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex])

  useEffect(() => () => clearTimeout(typeaheadTimerRef.current), [])

  function openList() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }

  function closeAndFocus() {
    setIsOpen(false)
    // Explicit, ref-based: never rely on DOM order or default browser focus
    // handling to land back on the trigger.
    triggerRef.current?.focus()
  }

  function commit(nextValue: string | null) {
    onChange(nextValue)
    closeAndFocus()
  }

  function handleClear() {
    onChange(null)
    triggerRef.current?.focus()
  }

  function typeaheadSearch(char: string) {
    clearTimeout(typeaheadTimerRef.current)
    typeaheadBufferRef.current += char.toLowerCase()
    const buffer = typeaheadBufferRef.current
    const match = options.findIndex((option) => option.label.toLowerCase().startsWith(buffer))
    if (match >= 0) setActiveIndex(match)
    typeaheadTimerRef.current = setTimeout(() => {
      typeaheadBufferRef.current = ''
    }, TYPEAHEAD_RESET_MS)
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        event.preventDefault()
        openList()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => Math.min(index + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
        event.preventDefault()
        if (options[activeIndex]) commit(options[activeIndex].value)
        break
      case 'Escape':
        // Stops here so a parent layer (e.g. a mobile drawer in 5.3) does
        // not also close on the same keypress.
        event.preventDefault()
        event.stopPropagation()
        closeAndFocus()
        break
      case 'Tab':
        setIsOpen(false)
        // Focus is already on the trigger (it never left); this is a
        // defensive, explicit assertion of that fact, not a preventDefault —
        // the browser's default Tab action still moves focus onward from here.
        triggerRef.current?.focus()
        break
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          typeaheadSearch(event.key)
        }
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.control}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className={styles.trigger}
          data-clearable={clearable && value !== null ? 'true' : undefined}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${labelId} ${id}`}
          onClick={() => (isOpen ? closeAndFocus() : openList())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={styles.value}>{selectedOption ? selectedOption.label : placeholder ?? ''}</span>
          <ChevronIcon />
        </button>
        {clearable && value !== null && (
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

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          tabIndex={-1}
          ref={listRef}
          className={styles.listbox}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              data-index={index}
              role="option"
              aria-selected={option.value === value}
              className={index === activeIndex ? `${styles.option} ${styles.optionActive}` : styles.option}
              onPointerDown={(event) => {
                // Select on pointerdown (before click) and preventDefault so
                // the button never loses focus to the (non-focusable) li.
                event.preventDefault()
                commit(option.value)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
