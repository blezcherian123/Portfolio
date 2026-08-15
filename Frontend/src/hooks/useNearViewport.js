import { useEffect, useRef, useState } from 'react'

// Returns a ref to attach to an element plus a boolean that flips to true the
// first time the element approaches the viewport. Used to split the page's
// work by only mounting heavy components (WebGL canvases, etc.) once the user
// is close to scrolling them into view.
export default function useNearViewport(rootMargin = '400px 0px') {
  const ref = useRef(null)
  const [isNear, setIsNear] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return [ref, isNear]
}
