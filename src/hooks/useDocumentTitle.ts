import { useEffect } from 'react'

// Sets document.title while the page is showing `title`, and puts back
// whatever was there before once the title goes away or the page unmounts.
// null means "nothing to show yet" (loading, not found) — the title is left
// alone rather than flashing a placeholder.
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title === null) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
