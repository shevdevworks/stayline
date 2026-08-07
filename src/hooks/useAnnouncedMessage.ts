import { useEffect, useRef, useState } from 'react'

// A message that must re-announce even when repeated verbatim (a screen
// reader otherwise ignores a live region whose text content didn't change).
// Clearing to '' is instant since there's nothing to guard against there;
// only setting a new message needs the clear-then-set tick.
export function useAnnouncedMessage(): [string, (next: string) => void] {
  const [text, setText] = useState('')
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  function announce(next: string) {
    window.clearTimeout(timeoutRef.current)
    setText('')
    if (next === '') return
    timeoutRef.current = window.setTimeout(() => setText(next), 0)
  }

  return [text, announce]
}
