import { useEffect, useRef } from 'react'

// A self-contained, WebGL fluid simulation (GPU Navier-Stokes via stable fluids
// + Jacobi pressure solve). Used in the light-mode hero: it runs an ambient
// autopilot flow across the whole hero so the white screen is never empty, and
// additionally splats bright ink wherever the cursor moves. Uses ping-pong
// render targets and a handful of fullscreen passes per step so it stays light
// enough to run at ~60fps. Adapted from Pavel Dobryakov's
// webgl-fluid-simulation (MIT).

const VERT = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAG_ADVECTION = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
vec4 bilerp(sampler2D sam, vec2 uv, vec2 scale) {
  vec2 uvScaled = uv * scale + 0.5;
  vec2 f = fract(uvScaled);
  vec2 uv00 = uvScaled - f;
  vec2 uv11 = uv00 + scale;
  return mix(mix(texture2D(sam, uv00), texture2D(sam, uv11), f.x),
             mix(texture2D(sam, uv00 + vec2(0.0, scale.y)), texture2D(sam, uv11 + vec2(0.0, scale.y)), f.x), f.y);
}
void main() {
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  gl_FragColor = dissipation * bilerp(uSource, coord, texelSize);
  gl_FragColor.a = 1.0;
}
`

const FRAG_DIVERGENCE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
void main() {
  float L = texture2D(uVelocity, vUv - vec2(1.0, 0.0) * texelSize).x;
  float R = texture2D(uVelocity, vUv + vec2(1.0, 0.0) * texelSize).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, 1.0) * texelSize).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, 1.0) * texelSize).y;
  gl_FragColor = vec4((R - L + T - B) * 0.5, 0.0, 0.0, 1.0);
}
`

const FRAG_CURL = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
void main() {
  float L = texture2D(uVelocity, vUv - vec2(1.0, 0.0) * texelSize).y;
  float R = texture2D(uVelocity, vUv + vec2(1.0, 0.0) * texelSize).y;
  float B = texture2D(uVelocity, vUv - vec2(0.0, 1.0) * texelSize).x;
  float T = texture2D(uVelocity, vUv + vec2(0.0, 1.0) * texelSize).x;
  gl_FragColor = vec4((R - L) - (T - B), 0.0, 0.0, 1.0);
}
`

const FRAG_PRESSURE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 texelSize;
void main() {
  float L = texture2D(uPressure, vUv - vec2(1.0, 0.0) * texelSize).x;
  float R = texture2D(uPressure, vUv + vec2(1.0, 0.0) * texelSize).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, 1.0) * texelSize).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, 1.0) * texelSize).x;
  gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
}
`

const FRAG_GRADIENT_SUBTRACT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
void main() {
  float L = texture2D(uPressure, vUv - vec2(1.0, 0.0) * texelSize).x;
  float R = texture2D(uPressure, vUv + vec2(1.0, 0.0) * texelSize).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, 1.0) * texelSize).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, 1.0) * texelSize).x;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel -= vec2(R - L, T - B) * 0.5;
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
`

const FRAG_SPLAT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`

const FRAG_DISPLAY = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uBoost;
void main() {
  vec3 c = texture2D(uTexture, vUv).rgb * uBoost;
  float a = max(max(c.r, c.g), c.b);
  gl_FragColor = vec4(c, a);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader))
  }
  return shader
}

function createProgram(gl, vertexSrc, fragmentSrc) {
  const program = gl.createProgram()
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSrc))
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(program))
  }
  return program
}

function createFBO(gl, w, h, internalFormat, format, type) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.viewport(0, 0, w, h)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  return { texture, fbo, width: w, height: h, complete, attach(id) {
    gl.activeTexture(gl.TEXTURE0 + id)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    return id
  } }
}

export default function WebGLFluid({ className = '' }) {
  const containerRef = useRef(null)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'
    container.appendChild(canvas)

    let gl = null
    const names = ['webgl2', 'webgl', 'experimental-webgl']
    for (const name of names) {
      try { gl = canvas.getContext(name, { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }) } catch { /* ignore */ }
      if (gl) break
    }
    if (!gl) { container.removeChild(canvas); return undefined }
    const isGL2 = gl instanceof WebGL2RenderingContext
    const floatType = isGL2 ? gl.HALF_FLOAT : (gl.getExtension('OES_texture_half_float') || {}).HALF_FLOAT_OES
    if (!floatType) { container.removeChild(canvas); return undefined }

    const SIM = 128
    const DYE = 256
    const VELOCITY_DISSIPATION = 0.99
    const DYE_DISSIPATION = 0.996
    const PRESSURE_ITERATIONS = 20
    // Splat radius in *normalised UV* of the target texture (0..1).
    const SPLAT_RADIUS = 0.04
    // Colours are pushed into the dye additively and the dye texture clamps at
    // 1.0. If we push too much the overlapping splats saturate to white, which
    // is invisible on the light hero. Keeping the strength low lets overlapping
    // ribbons stay in the coloured range so trails show vivid gradients.
    const DYE_SPLAT_STRENGTH = 0.45

    // WebGL2 requires *sized* internal formats for half-float render targets
    // (unsized RGBA + HALF_FLOAT is INVALID_OPERATION). WebGL1 uses the classic
    // unsized format with the half-float extension.
    const floatInternal = isGL2 ? gl.RGBA16F : gl.RGBA
    const byteInternal = isGL2 ? gl.RGBA8 : gl.RGBA

    const createDoubleFBO = (w, h, internalFormat, format, type) => {
      let a = createFBO(gl, w, h, internalFormat, format, type)
      let b = createFBO(gl, w, h, internalFormat, format, type)
      return { get read() { return a }, get write() { return b }, swap() { const t = a; a = b; b = t } }
    }

    let dye = createDoubleFBO(DYE, DYE, byteInternal, gl.RGBA, gl.UNSIGNED_BYTE)
    let velocity = createDoubleFBO(SIM, SIM, floatInternal, gl.RGBA, floatType)
    let divergence = createFBO(gl, SIM, SIM, floatInternal, gl.RGBA, floatType)
    let curl = createFBO(gl, SIM, SIM, floatInternal, gl.RGBA, floatType)
    let pressure = createDoubleFBO(SIM, SIM, floatInternal, gl.RGBA, floatType)

    if (!dye.read.complete && !dye.write.complete) {
      container.removeChild(canvas)
      return undefined
    }

    const programs = {
      advection: createProgram(gl, VERT, FRAG_ADVECTION),
      divergence: createProgram(gl, VERT, FRAG_DIVERGENCE),
      curl: createProgram(gl, VERT, FRAG_CURL),
      pressure: createProgram(gl, VERT, FRAG_PRESSURE),
      gradientSubtract: createProgram(gl, VERT, FRAG_GRADIENT_SUBTRACT),
      splat: createProgram(gl, VERT, FRAG_SPLAT),
      display: createProgram(gl, VERT, FRAG_DISPLAY),
    }

    const u = (prog) => {
      const l = {}
      const names = prog === programs.splat
        ? ['uTarget', 'aspectRatio', 'point', 'color', 'radius']
        : prog === programs.display
          ? ['uTexture', 'uBoost']
          : ['uVelocity', 'uSource', 'texelSize', 'dt', 'dissipation', 'uPressure', 'uDivergence']
      names.forEach(n => { l[n] = gl.getUniformLocation(prog, n) })
      return l
    }
    const uniforms = {
      advection: u(programs.advection),
      divergence: u(programs.divergence),
      curl: u(programs.curl),
      pressure: u(programs.pressure),
      gradientSubtract: u(programs.gradientSubtract),
      splat: u(programs.splat),
      display: u(programs.display),
    }

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    const bindQuad = (prog) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      const loc = gl.getAttribLocation(prog, 'aPosition')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    }

    const blit = () => gl.drawArrays(gl.TRIANGLES, 0, 6)
    const setTexel = (prog, uni, w, h) => gl.uniform2f(uni.texelSize, isGL2 ? 0.5 / w : 0, isGL2 ? 0.5 / h : 0)

    const advect = (prog, uni, input, output, dissipation) => {
      gl.useProgram(prog)
      gl.uniform1i(uni.uVelocity, velocity.read.attach(1))
      gl.uniform1i(uni.uSource, input.attach(0))
      gl.uniform2f(uni.dt, dt, 0)
      gl.uniform1f(uni.dissipation, dissipation)
      setTexel(prog, uni, input.width, input.height)
      bindQuad(prog)
      gl.bindFramebuffer(gl.FRAMEBUFFER, output.fbo)
      gl.viewport(0, 0, output.width, output.height)
      blit()
    }

    const splat = (x, y, dx, dy, color) => {
      gl.useProgram(programs.splat)
      gl.uniform1i(uniforms.splat.uTarget, velocity.read.attach(0))
      gl.uniform1f(uniforms.splat.aspectRatio, canvas.width / canvas.height)
      gl.uniform2f(uniforms.splat.point, x / canvas.width, 1 - y / canvas.height)
      gl.uniform3f(uniforms.splat.color, dx, dy, 0)
      gl.uniform1f(uniforms.splat.radius, SPLAT_RADIUS)
      bindQuad(programs.splat)
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo)
      gl.viewport(0, 0, SIM, SIM)
      blit()
      velocity.swap()

      gl.uniform1i(uniforms.splat.uTarget, dye.read.attach(0))
      gl.uniform3f(uniforms.splat.color, color.r * DYE_SPLAT_STRENGTH, color.g * DYE_SPLAT_STRENGTH, color.b * DYE_SPLAT_STRENGTH)
      gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo)
      gl.viewport(0, 0, DYE, DYE)
      blit()
      dye.swap()
    }

    const step = () => {
      gl.disable(gl.BLEND)
      gl.viewport(0, 0, SIM, SIM)

      gl.useProgram(programs.curl)
      gl.uniform1i(uniforms.curl.uVelocity, velocity.read.attach(0))
      setTexel(programs.curl, uniforms.curl, SIM, SIM)
      bindQuad(programs.curl)
      gl.bindFramebuffer(gl.FRAMEBUFFER, curl.fbo)
      blit()

      advect(programs.advection, uniforms.advection, velocity.read, velocity.write, VELOCITY_DISSIPATION)

      gl.useProgram(programs.divergence)
      gl.uniform1i(uniforms.divergence.uVelocity, velocity.read.attach(0))
      setTexel(programs.divergence, uniforms.divergence, SIM, SIM)
      bindQuad(programs.divergence)
      gl.bindFramebuffer(gl.FRAMEBUFFER, divergence.fbo)
      blit()

      gl.useProgram(programs.pressure)
      gl.uniform1i(uniforms.pressure.uDivergence, divergence.attach(0))
      setTexel(programs.pressure, uniforms.pressure, SIM, SIM)
      bindQuad(programs.pressure)
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(uniforms.pressure.uPressure, pressure.read.attach(0))
        gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo)
        blit()
        pressure.swap()
      }

      gl.useProgram(programs.gradientSubtract)
      gl.uniform1i(uniforms.gradientSubtract.uPressure, pressure.read.attach(0))
      gl.uniform1i(uniforms.gradientSubtract.uVelocity, velocity.read.attach(0))
      setTexel(programs.gradientSubtract, uniforms.gradientSubtract, SIM, SIM)
      bindQuad(programs.gradientSubtract)
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo)
      blit()
      velocity.swap()

      advect(programs.advection, uniforms.advection, dye.read, dye.write, DYE_DISSIPATION)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(programs.display)
      gl.uniform1i(uniforms.display.uTexture, dye.read.attach(0))
      gl.uniform1f(uniforms.display.uBoost, 1.25)
      bindQuad(programs.display)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.BLEND)
      blit()
    }

    let lastUpdateTime = performance.now()
    let dt = 1 / 60
    let rafId = 0
    let lastPointerX = 0
    let lastPointerY = 0
    let lastPointerMoveTime = 0
    let lastAmbientTime = 0
    let cursorHue = 0

    const palette = [
      { r: 0.20, g: 0.55, b: 0.98 }, // vivid blue
      { r: 0.10, g: 0.75, b: 0.90 }, // azure
      { r: 0.10, g: 0.78, b: 0.62 }, // teal-green
      { r: 0.35, g: 0.65, b: 0.30 }, // green
      { r: 0.95, g: 0.60, b: 0.20 }, // orange
      { r: 0.93, g: 0.30, b: 0.45 }, // pink/red
      { r: 0.60, g: 0.40, b: 0.98 }, // violet
      { r: 0.98, g: 0.80, b: 0.25 }, // gold
    ]

    const pickColor = () => palette[(Math.random() * palette.length) | 0]

    // HSL -> RGB, returning unit floats. Used to sweep the cursor ink smoothly
    // through the hue wheel so a single stroke paints a rainbow gradient.
    const hslToRgb = (h, s, l) => {
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l - c / 2
      let r = 0, g = 0, b = 0
      if (h < 60) { r = c; g = x }
      else if (h < 120) { r = x; g = c }
      else if (h < 180) { g = c; b = x }
      else if (h < 240) { g = x; b = c }
      else if (h < 300) { r = x; b = c }
      else { r = c; b = x }
      return { r: r + m, g: g + m, b: b + m }
    }

    // Advance the cursor hue by a random, bounded step so the trail continuously
    // changes colour (a gradient) without jumping erratically.
    const nextCursorColor = () => {
      cursorHue = (cursorHue + 14 + Math.random() * 42) % 360
      const s = 0.65 + Math.random() * 0.3
      const l = 0.5 + Math.random() * 0.14
      return hslToRgb(cursorHue, s, l)
    }

    const calculateDeltaX = (d) => (d > 0 ? Math.min(d, 0.25) : Math.max(d, -0.25))

    // Ambient autopilot: keeps drawing flowing ribbons across the whole hero so
    // the light-mode hero is never a static white screen, even before the mouse
    // has moved. Runs a couple of times per second on random paths.
    const ambientTick = (now) => {
      if (now - lastAmbientTime < 380) return
      lastAmbientTime = now
      const cx = (0.15 + Math.random() * 0.7) * canvas.width
      const cy = (0.2 + Math.random() * 0.6) * canvas.height
      const angle = Math.random() * Math.PI * 2
      const mag = 0.0006 + Math.random() * 0.0012
      const dx = Math.cos(angle) * mag
      const dy = Math.sin(angle) * mag
      const color = pickColor()
      for (let i = 0; i < 4; i++) {
        const ox = cx + (Math.random() - 0.5) * 160
        const oy = cy + (Math.random() - 0.5) * 160
        splat(ox, oy, dx * (Math.random() + 0.4), dy * (Math.random() + 0.4), color)
      }
    }

    const updatePointer = (prevX, prevY, x, y, dx, dy) => {
      // Inject an overlapping ribbon between the previous and current cursor
      // position so trails read as continuous, vivid gradients.
      const steps = 6
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const px = prevX + (x - prevX) * t
        const py = prevY + (y - prevY) * t
        if (px > 0 && py > 0 && px < canvas.width && py < canvas.height) {
          const color = nextCursorColor()
          splat(px, py, dx, dy, color)
        }
      }
    }

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const sx = canvas.width / canvas.clientWidth
      const sy = canvas.height / canvas.clientHeight
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy }
    }

    const onPointerMove = (e) => {
      const p = getPos(e)
      const now = performance.now()
      const movedEnough = Math.abs(p.x - lastPointerX) > 3 || Math.abs(p.y - lastPointerY) > 3
      if (now - lastPointerMoveTime > 10 || movedEnough) {
        const dx = calculateDeltaX(p.x - lastPointerX) * 3
        const dy = -calculateDeltaX(p.y - lastPointerY) * 3
        const prevX = lastPointerX
        const prevY = lastPointerY
        lastPointerX = p.x
        lastPointerY = p.y
        lastPointerMoveTime = now
        updatePointer(prevX, prevY, p.x, p.y, dx, dy)
      }
    }

    const onPointerDown = (e) => {
      const p = getPos(e)
      lastPointerX = p.x
      lastPointerY = p.y
      lastPointerMoveTime = performance.now()
      const dx = (Math.random() - 0.5) * 2
      const dy = (Math.random() - 0.5) * 2
      updatePointer(p.x, p.y, p.x, p.y, dx, dy)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.floor(container.clientWidth * dpr)
      const h = Math.floor(container.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const frame = (now) => {
      rafId = requestAnimationFrame(frame)
      dt = Math.min(1 / 60, (now - lastUpdateTime) / 1000)
      if (dt <= 0) dt = 0.016
      lastUpdateTime = now
      if (!window.__fluidAmbientOff) ambientTick(now)
      step()
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
      if (canvas.parentElement === container) container.removeChild(canvas)
    }
  }, [])

  return <div ref={containerRef} className={`fluid-sim${className ? ` ${className}` : ''}`} aria-hidden="true" />
}
