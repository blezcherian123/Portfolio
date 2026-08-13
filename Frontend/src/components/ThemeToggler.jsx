import { useEffect, useState } from 'react'

/**
 * ThemeToggler � animated dark / light mode button.
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

  const applyTheme = (next) => {
    document.documentElement.classList.add('is-theme-transitioning')
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('portfolio-theme', next)
  }

  const finishTheme = (next) => {
    document.documentElement.classList.remove('is-theme-transitioning')
    setTheme(next)
  }

  const isDark = theme === 'dark'

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || prefersReducedMotion) {
      applyTheme(next)
      finishTheme(next)
      return
    }
    const transition = document.startViewTransition(() => applyTheme(next))
    transition.finished.then(() => finishTheme(next))
  }

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
