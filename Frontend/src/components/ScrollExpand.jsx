import { useEffect, useRef } from 'react'
import './ScrollExpand.css'

function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi) }

export default function ScrollExpand({
  src,
  alt = '',
  title = '',
  children,
  mediaZoom = 1.3,
  smoothing = 0.1,
  enabled = true,
}) {
  const outerRef = useRef(null)
  const trackRef = useRef(null)
  const frameRef = useRef(null)
  const mediaRef = useRef(null)
  const scrimRef = useRef(null)
  const contentRef = useRef(null)
  const rafRef = useRef(null)
  const cur = useRef(0)
  const tgt = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const video = mediaRef.current
    const outer = outerRef.current

    const play = () => {
      if (!video) return
      if (!video.getAttribute('src')) video.src = src
      video.play().catch(() => {})
    }
    const pause = () => { if (video) video.pause() }

    const io = new IntersectionObserver(
      ([e]) => { e.isIntersecting ? play() : pause() },
      { threshold: 0.05 },
    )
    if (outer) io.observe(outer)

    const animate = () => {
      cur.current = lerp(cur.current, tgt.current, smoothing)
      if (Math.abs(cur.current - tgt.current) < 0.0001) cur.current = tgt.current

      const p = cur.current

      const top = lerp(21, 0, p)
      const side = lerp(29, 0, p)
      const radius = lerp(24, 0, p)

      if (frameRef.current) {
        frameRef.current.style.clipPath =
          `inset(${top}% ${side}% ${top}% ${side}% round ${radius}px)`
      }
      if (mediaRef.current) {
        mediaRef.current.style.transform = `scale(${lerp(1, mediaZoom, p)})`
      }
      if (scrimRef.current) {
        scrimRef.current.style.opacity = p
      }
      if (contentRef.current) {
        const cp = clamp((p - 0.6) / 0.4, 0, 1)
        const ce = 1 - Math.pow(1 - cp, 3)
        contentRef.current.style.opacity = ce
        contentRef.current.style.transform = `translateY(${lerp(24, 0, ce)}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    const calc = () => {
      const t = trackRef.current
      if (!t) return 0
      const r = t.getBoundingClientRect()
      const s = -r.top
      const total = t.offsetHeight - window.innerHeight
      return total <= 0 ? 0 : clamp(s / total, 0, 1)
    }

    const onScroll = () => { tgt.current = calc() }

    rafRef.current = requestAnimationFrame(animate)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, src, mediaZoom, smoothing])

  return (
    <div className="se" ref={outerRef}>
      <div className="se__track" ref={trackRef}>
        <div className="se__stage">
          <div className="se__frame" ref={frameRef}>
            <video
              ref={mediaRef}
              className="se__video"
              muted loop playsInline preload="none"
              aria-label={alt || title}
            />
          </div>
          <div className="se__scrim" ref={scrimRef} />
          <div className="se__content" ref={contentRef}>
            {title && <h2 className="se__title">{title}</h2>}
            {children && <div className="se__desc">{children}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
