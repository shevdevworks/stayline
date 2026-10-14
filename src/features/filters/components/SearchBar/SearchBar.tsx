import { useId, useRef, type FormEvent } from 'react'
import { CloseIcon, SearchIcon } from '@/components/icons/Icons'
import { buttonClass } from '@/components/ui/Button/buttonClass'
import { useDebouncedInput } from '@/hooks/useDebouncedInput'
import styles from './SearchBar.module.css'

export interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
}

// Results update while typing (debounced); Enter or the Search button
// applies the query immediately. It searches venue names and cities — the
// only text the catalog data has — so it promises nothing more.
export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const uid = useId()
  const inputId = `${uid}-query`
  const inputRef = useRef<HTMLInputElement>(null)
  const debounced = useDebouncedInput(query, onQueryChange, 350)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    debounced.flush()
  }

  function handleClear() {
    inputRef.current?.focus()
    debounced.setValue('')
    onQueryChange('')
  }

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="sr-only">
        Search by city or space name
      </label>
      <div className={styles.field}>
        <SearchIcon className={styles.icon} />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          className={styles.input}
          placeholder="Search by city or space"
          value={debounced.value}
          onChange={(event) => debounced.setValue(event.target.value)}
          onBlur={debounced.flush}
        />
        {debounced.value !== '' && (
          <button type="button" className={styles.clear} aria-label="Clear search" onClick={handleClear}>
            <CloseIcon />
          </button>
        )}
      </div>
      <button type="submit" className={buttonClass({ size: 'large', className: styles.submit })}>
        <SearchIcon className={styles.submitIcon} />
        <span className={styles.submitLabel}>Search</span>
      </button>
    </form>
  )
}
