import { useEffect, useRef } from 'react'

// Thin gradient bar fixed to the top of the viewport that fills as the user
// scrolls. Uses transform scaleX (GPU-composited) and a single rAF-throttled
// scroll handler so it never janks the page.
export default function ScrollProgressBar() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return undefined

    let rafId = null
    const update = () => {
      rafId = null
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      bar.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return <div className="scroll-progress-bar" ref={barRef} aria-hidden="true" />
}
