import { useEffect, useRef, useState } from 'react'

export function useDebouncedInput(
  external: string,
  commit: (value: string) => void,
  delay = 350,
): { value: string; setValue: (next: string) => void; flush: () => void } {
  const [value, setValueState] = useState(external)
  // Last value we ourselves sent to commit — used to tell "our own echo"
  // apart from a genuinely external change (reset, back/forward).
  const lastSentRef = useRef(external)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (external === lastSentRef.current) return
    lastSentRef.current = external
    setValueState(external)
    clearTimeout(timerRef.current)
  }, [external])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function setValue(next: string) {
    setValueState(next)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      lastSentRef.current = next
      commit(next)
    }, delay)
  }

  function flush() {
    clearTimeout(timerRef.current)
    lastSentRef.current = value
    commit(value)
  }

  return { value, setValue, flush }
}
