import { useId, useRef, useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import styles from './CheckboxGroup.module.css'

export interface CheckboxOption {
  value: string
  label: string
}

export interface CheckboxGroupProps {
  legend: string
  options: CheckboxOption[]
  value: string[]
  onChange: (value: string[]) => void
  collapsible?: boolean
  visibleCount?: number
}

const DEFAULT_VISIBLE_COUNT = 6

export function CheckboxGroup({
  legend,
  options,
  value,
  onChange,
  collapsible = false,
  visibleCount = DEFAULT_VISIBLE_COUNT,
}: CheckboxGroupProps) {
  const uid = useId()
  const [expanded, setExpanded] = useState(false)
  const hiddenRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const shouldCollapse = collapsible && options.length > visibleCount
  const visibleOptions = shouldCollapse ? options.slice(0, visibleCount) : options
  const hiddenOptions = shouldCollapse ? options.slice(visibleCount) : []
  const hiddenId = `${uid}-hidden`

  function toggleValue(optionValue: string) {
    onChange(
      value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue],
    )
  }

  function handleToggleExpand() {
    // Collapsing can remove the very element that has focus. Move focus to
    // the toggle button first, before it disappears into <body>.
    if (expanded && hiddenRef.current?.contains(document.activeElement)) {
      toggleRef.current?.focus()
    }
    setExpanded((current) => !current)
  }

  function renderOption(option: CheckboxOption) {
    const inputId = `${uid}-${option.value}`
    return (
      <Checkbox
        key={option.value}
        id={inputId}
        label={option.label}
        checked={value.includes(option.value)}
        onChange={() => toggleValue(option.value)}
      />
    )
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.list}>{visibleOptions.map(renderOption)}</div>

      {shouldCollapse && (
        <>
          {expanded && (
            <div ref={hiddenRef} id={hiddenId} className={`${styles.list} ${styles.revealed}`}>
              {hiddenOptions.map(renderOption)}
            </div>
          )}
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            aria-controls={hiddenId}
            onClick={handleToggleExpand}
          >
            {expanded ? 'Show less' : `Show all (${options.length})`}
          </button>
        </>
      )}
    </fieldset>
  )
}
