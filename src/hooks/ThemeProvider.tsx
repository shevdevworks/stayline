import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'stayline:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readInitialTheme(): Theme {
  // The inline script in index.html already wrote the correct value to the
  // DOM before React mounted; reading it back (instead of re-deriving from
  // localStorage/matchMedia) keeps the first render consistent with what's
  // already on screen and avoids a second flash. At prerender time there is
  // no document: the static HTML always renders the light default.
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function hasStoredTheme(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable (e.g. private mode) — theme still applies
    // for this session, it just won't persist across reloads.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Until the person picks a theme themselves, keep following the OS —
  // persisting on every mount would freeze whatever the system happened to
  // be on the first visit.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_QUERY)

    function handleChange(event: MediaQueryListEvent) {
      if (hasStoredTheme()) return
      setThemeState(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next)
    setThemeState(next)
  }, [])
  const toggleTheme = useCallback(() => setTheme(theme === 'light' ? 'dark' : 'light'), [theme, setTheme])
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
