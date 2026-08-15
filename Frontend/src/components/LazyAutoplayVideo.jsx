import { useEffect, useRef } from 'react'
import lozad from 'lozad'

// Defer video loading until the element approaches the viewport, start playback
// only while it is visible, and pause as soon as it scrolls out of view. This
// keeps ~29MB of showcase videos from being downloaded on the initial page load.
export default function LazyAutoplayVideo({ src, className = '', delay = 0, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const start = () => {
      if (!el.getAttribute('src')) el.src = src
      el.play().catch(() => {})
    }
    const stop = () => el.pause()

    const loader = lozad(el, {
      rootMargin: '300px 0px',
      threshold: 0,
      load: () => {
        // Stagger nearby videos so they don't all begin downloading at once.
        window.setTimeout(start, delay)
      },
    })
    loader.observe()

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.1 },
    )
    visibilityObserver.observe(el)

    return () => {
      loader?.observer?.disconnect?.()
      visibilityObserver.disconnect()
    }
  }, [src, delay])

  return (
    <video
      ref={ref}
      data-src={src}
      muted
      loop
      playsInline
      preload="none"
      className={className}
      {...rest}
    />
  )
}
