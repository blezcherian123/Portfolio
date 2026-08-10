import { useEffect, useState } from 'react'

/**
 * ThemeToggler — animated dark / light mode button.
 * Writes `data-theme` on <html> and persists to localStorage.
 * On first load it respects prefers-color-scheme.
 */
export default function ThemeToggler() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem('portfolio-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  const isDark = theme === 'dark'

  return (
    <button
      className={`theme-toggler ${isDark ? 'theme-toggler--dark' : 'theme-toggler--light'}`}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      <span className="material-symbols-outlined theme-icon theme-icon--sun" aria-hidden="true">light_mode</span>
      <span className="material-symbols-outlined theme-icon theme-icon--moon" aria-hidden="true">dark_mode</span>
    </button>
  )
}
