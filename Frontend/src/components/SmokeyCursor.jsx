import { useEffect, useState } from 'react'

// Light-mode cursor fluid. Renders the react-smokey-fluid-cursor library
// (fullscreen fixed canvas) with light-theme friendly settings.
//
// The library is imported dynamically so its ~22 kB stays out of the initial
// bundle and only loads when the user is in light mode.
//
// The library itself spins up its simulation in useEffect with no cleanup, so
// when React removes the canvas its internal requestAnimationFrame loop + window
// listeners survive. Losing the WebGL context on teardown turns every GL call
// inside that orphaned loop into a silent no-op, which effectively stops it.

const CANVAS_ID = 'smokey-fluid-canvas'

const config = {
  simResolution: 128,
  dyeResolution: 512,
  densityDissipation: 3.2,
  velocityDissipation: 1.8,
  pressureIteration: 12,
  curl: 8,
  splatRadius: 0.35,
  splatForce: 6000,
  shading: false,
  colorUpdateSpeed: 8,
  transparent: true,
  id: CANVAS_ID,
}

export default function SmokeyCursor() {
  const [Smokey, setSmokey] = useState(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let active = true
    import('react-smokey-fluid-cursor').then((m) => {
      if (active) setSmokey(() => m.SmokeyFluidCursor)
    })
    return () => {
      active = false
      const canvas = document.getElementById(CANVAS_ID)
      if (!canvas) return
      const ctx =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      const lose = ctx && ctx.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
    }
  }, [])

  if (!Smokey) return null
  return <Smokey config={config} />
}