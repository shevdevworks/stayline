import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { CheckIcon, ChevronDownIcon, CloseIcon } from '@/components/icons/Icons'
import styles from './Select.module.css'

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
  // 'inline' puts the label beside the control, for compact toolbars.
  layout?: 'stacked' | 'inline'
  className?: string
  labelClassName?: string
}

const TYPEAHEAD_RESET_MS = 500

// WAI-ARIA APG "select-only combobox": DOM focus never leaves the
// combobox button. The listbox is never focused; the option the arrow keys
// point at is exposed through aria-activedescendant on the combobox itself,
// which is what screen readers follow. The listbox stays in the DOM (hidden
// while closed) so aria-controls always points at a real element.
export function Select({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  clearable = false,
  layout = 'stacked',
  className,
  labelClassName,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const comboboxRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeaheadBufferRef = useRef('')
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const labelId = `${id}-label`
  const listboxId = `${id}-listbox`
  const optionId = (index: number) => `${id}-option-${index}`

  const selectedIndex = value === null ? -1 : options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null

  // Closes on any pointerdown outside the wrapper, without committing.
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

  // Keeps the active option visible inside a scrolling listbox.
  useEffect(() => {
    if (!isOpen) return
    listRef.current
      ?.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex])

  useEffect(() => () => clearTimeout(typeaheadTimerRef.current), [])

  function open(index = selectedIndex >= 0 ? selectedIndex : 0) {
    setActiveIndex(index)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  function commit(index: number) {
    const option = options[index]
    if (option && option.value !== value) onChange(option.value)
    setIsOpen(false)
    comboboxRef.current?.focus()
  }

  function handleClear() {
    onChange(null)
    comboboxRef.current?.focus()
  }

  function findTypeaheadMatch(char: string): number {
    clearTimeout(typeaheadTimerRef.current)
    typeaheadBufferRef.current += char.toLowerCase()
    typeaheadTimerRef.current = setTimeout(() => {
      typeaheadBufferRef.current = ''
    }, TYPEAHEAD_RESET_MS)
    const buffer = typeaheadBufferRef.current
    return options.findIndex((option) => option.label.toLowerCase().startsWith(buffer))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const isPrintable = event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey
    const lastIndex = options.length - 1

    if (!isOpen) {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
        case ' ':
          event.preventDefault()
          open()
          return
        case 'Home':
          event.preventDefault()
          open(0)
          return
        case 'End':
          event.preventDefault()
          open(lastIndex)
          return
      }
      if (isPrintable) {
        const match = findTypeaheadMatch(event.key)
        open(match >= 0 ? match : undefined)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => Math.min(index + 1, lastIndex))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (event.altKey) commit(activeIndex)
        else setActiveIndex((index) => Math.max(index - 1, 0))
        break
      case 'Home':
      case 'PageUp':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
      case 'PageDown':
        event.preventDefault()
        setActiveIndex(lastIndex)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(activeIndex)
        break
      case 'Escape':
        // Stopped here so an enclosing dialog (the mobile filter drawer)
        // doesn't close on the same keypress.
        event.preventDefault()
        event.stopPropagation()
        close()
        break
      case 'Tab':
        // APG: Tab accepts the active option, then focus moves on as usual.
        commit(activeIndex)
        break
      default:
        if (isPrintable) {
          const match = findTypeaheadMatch(event.key)
          if (match >= 0) setActiveIndex(match)
        }
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, layout === 'inline' && styles.inline, className].filter(Boolean).join(' ')}
    >
      <span id={labelId} className={labelClassName ? `${styles.label} ${labelClassName}` : styles.label}>
        {label}
      </span>
      <div className={styles.control}>
        <button
          ref={comboboxRef}
          id={id}
          type="button"
          role="combobox"
          className={styles.combobox}
          data-clearable={clearable && value !== null ? 'true' : undefined}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            // Focus left for good (not just into the clear button).
            if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) close()
          }}
        >
          <span className={selectedOption ? styles.value : styles.placeholder}>
            {selectedOption ? selectedOption.label : (placeholder ?? '')}
          </span>
          <ChevronDownIcon className={styles.chevron} />
        </button>
        {clearable && value !== null && (
          <button type="button" className={styles.clearButton} aria-label={`Clear ${label}`} onClick={handleClear}>
            <CloseIcon className={styles.icon} />
          </button>
        )}

        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          className={styles.listbox}
          hidden={!isOpen}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              data-index={index}
              role="option"
              aria-selected={option.value === value}
              className={index === activeIndex ? `${styles.option} ${styles.optionActive}` : styles.option}
              onPointerMove={() => setActiveIndex(index)}
              onPointerDown={(event) => {
                // Selecting on pointerdown with preventDefault keeps focus on
                // the combobox instead of letting it fall to the <li>.
                event.preventDefault()
                commit(index)
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <CheckIcon className={styles.check} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
