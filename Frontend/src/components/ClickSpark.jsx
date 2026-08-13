import { useEffect } from 'react'

const globalOpts = {
  sparkColor: '#5de6ff',
  sparkSize: 14,
  sparkRadius: 26,
  sparkCount: 16,
  duration: 450,
}

let canvas = null
let ctx = null
let sparks = []
let rafId = null
let startTime = null
let listenerBound = false

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '2147483647',
    display: 'block',
  })
  document.body.appendChild(canvas)
}

function resizeCanvas() {
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.floor(window.innerWidth)
  const h = Math.floor(window.innerHeight)
  const pw = Math.floor(w * dpr)
  const ph = Math.floor(h * dpr)
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw
    canvas.height = ph
  }
  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function draw(timestamp) {
  if (!startTime) startTime = timestamp
  if (!canvas) return
  if (!ctx) resizeCanvas()
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  sparks = sparks.filter((s) => timestamp - s.startTime < s.duration)

  if (!sparks.length) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    rafId = null
    startTime = null
    return
  }

  ctx.strokeStyle = globalOpts.sparkColor
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'

  for (const s of sparks) {
    const progress = (timestamp - s.startTime) / s.duration
    const eased = progress * (2 - progress)
    const distance = eased * s.sparkRadius
    const lineLength = s.sparkSize * (1 - eased)
    const cos = Math.cos(s.angle)
    const sin = Math.sin(s.angle)
    ctx.beginPath()
    ctx.moveTo(s.x + distance * cos, s.y + distance * sin)
    ctx.lineTo(s.x + (distance + lineLength) * cos, s.y + (distance + lineLength) * sin)
    ctx.stroke()
  }

  rafId = requestAnimationFrame(draw)
}

function handleClick(event) {
  ensureCanvas()
  resizeCanvas()
  const now = performance.now()
  for (let i = 0; i < globalOpts.sparkCount; i++) {
    sparks.push({
      x: event.clientX,
      y: event.clientY,
      angle: (2 * Math.PI * i) / globalOpts.sparkCount,
      duration: globalOpts.duration,
      sparkRadius: globalOpts.sparkRadius,
      sparkSize: globalOpts.sparkSize,
      startTime: now,
    })
  }
  if (!rafId) rafId = requestAnimationFrame(draw)
}

const ClickSpark = ({
  sparkColor = '#5de6ff',
  sparkSize = 14,
  sparkRadius = 26,
  sparkCount = 16,
  duration = 450,
  children,
}) => {
  useEffect(() => {
    Object.assign(globalOpts, { sparkColor, sparkSize, sparkRadius, sparkCount, duration })
    if (listenerBound) return
    document.addEventListener('click', handleClick, true)
    listenerBound = true
    window.addEventListener('resize', resizeCanvas)
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration])

  return children
}

export default ClickSpark
