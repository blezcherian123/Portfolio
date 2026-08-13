import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const DARK_SKY_BLUE = 0x2E86C1
const LIGHT_NETWORK_COLOR = 0x1A56DB

// Linked particles for the section, plus the same free-floating cyan cloud
// used by the hero so both areas feel like one continuous environment.
export default function ParticleNetworkBackground({
  pointsCount = 80,
  color = DARK_SKY_BLUE,
  linkDistance = 3.25,
  coverage = 0.58,
  showAmbientCloud = true,
  className = '',
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCompactViewport = window.innerWidth < 900
    const nodeCount = Math.max(24, Math.min(pointsCount, prefersReducedMotion ? 56 : isCompactViewport ? 70 : pointsCount))
    const refreshEveryFrames = prefersReducedMotion ? 3 : 2

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !prefersReducedMotion })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prefersReducedMotion ? 1.2 : 1.5))
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    const getBounds = () => {
      const verticalView = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
      return {
        x: Math.max(3.8, verticalView * camera.aspect * coverage),
        y: verticalView * coverage,
        z: 3.2,
      }
    }
    const resize = () => {
      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    resize()

    const networkGroup = new THREE.Group()
    scene.add(networkGroup)
    const bounds = getBounds()
    const nodePositions = new Float32Array(nodeCount * 3)
    const velocities = new Float32Array(nodeCount * 3)
    for (let index = 0; index < nodeCount; index += 1) {
      nodePositions[index * 3] = (Math.random() * 2 - 1) * bounds.x
      nodePositions[index * 3 + 1] = (Math.random() * 2 - 1) * bounds.y
      nodePositions[index * 3 + 2] = (Math.random() * 2 - 1) * bounds.z
      velocities[index * 3] = (Math.random() * 2 - 1) * 0.24
      velocities[index * 3 + 1] = (Math.random() * 2 - 1) * 0.24
      velocities[index * 3 + 2] = (Math.random() * 2 - 1) * 0.12
    }

    const nodeGeometry = new THREE.BufferGeometry()
    const nodePositionAttribute = new THREE.BufferAttribute(nodePositions, 3)
    nodePositionAttribute.setUsage(THREE.DynamicDrawUsage)
    nodeGeometry.setAttribute('position', nodePositionAttribute)
    const nodeMaterial = new THREE.PointsMaterial({
      color,
      size: 0.1,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
    })
    networkGroup.add(new THREE.Points(nodeGeometry, nodeMaterial))

    const linePositions = new Float32Array(nodeCount * (nodeCount - 1) * 3)
    const lineGeometry = new THREE.BufferGeometry()
    const linePositionAttribute = new THREE.BufferAttribute(linePositions, 3)
    linePositionAttribute.setUsage(THREE.DynamicDrawUsage)
    lineGeometry.setAttribute('position', linePositionAttribute)
    lineGeometry.setDrawRange(0, 0)
    const lineMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.1 })
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    networkGroup.add(lines)

    let ambientGeometry
    let ambientMaterial
    let ambientPoints
    if (showAmbientCloud) {
      // This is deliberately the same free particle cloud as the hero's background.
      const ambientCount = 200
      const ambientPositions = new Float32Array(ambientCount * 3)
      for (let index = 0; index < ambientCount; index += 1) {
        ambientPositions[index * 3] = (Math.random() - 0.5) * 15
        ambientPositions[index * 3 + 1] = (Math.random() - 0.5) * 15
        ambientPositions[index * 3 + 2] = (Math.random() - 0.5) * 15
      }
      ambientGeometry = new THREE.BufferGeometry()
      ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3))
      ambientMaterial = new THREE.PointsMaterial({ color: DARK_SKY_BLUE, size: 0.065, transparent: true, opacity: 0.7 })
      ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial)
      scene.add(ambientPoints)
    }

    const applyThemeColors = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light'
      const targetColor = isLight ? LIGHT_NETWORK_COLOR : DARK_SKY_BLUE
      nodeMaterial.color.setHex(targetColor)
      lineMaterial.color.setHex(targetColor)
      if (ambientMaterial) ambientMaterial.color.setHex(targetColor)
      nodeMaterial.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending
      nodeMaterial.opacity = isLight ? 0.7 : 0.62
      lineMaterial.opacity = isLight ? 0.3 : 0.1
      nodeMaterial.needsUpdate = true
      lineMaterial.needsUpdate = true
    }
    applyThemeColors()
    const themeObserver = new MutationObserver(() => applyThemeColors())
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const refreshConnections = () => {
      let vertexCount = 0
      const maxDistanceSquared = linkDistance * linkDistance
      for (let first = 0; first < nodeCount; first += 1) {
        for (let second = first + 1; second < nodeCount; second += 1) {
          const firstOffset = first * 3
          const secondOffset = second * 3
          const deltaX = nodePositions[firstOffset] - nodePositions[secondOffset]
          const deltaY = nodePositions[firstOffset + 1] - nodePositions[secondOffset + 1]
          const deltaZ = nodePositions[firstOffset + 2] - nodePositions[secondOffset + 2]
          if (deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ > maxDistanceSquared) continue

          const lineOffset = vertexCount * 3
          linePositions[lineOffset] = nodePositions[firstOffset]
          linePositions[lineOffset + 1] = nodePositions[firstOffset + 1]
          linePositions[lineOffset + 2] = nodePositions[firstOffset + 2]
          linePositions[lineOffset + 3] = nodePositions[secondOffset]
          linePositions[lineOffset + 4] = nodePositions[secondOffset + 1]
          linePositions[lineOffset + 5] = nodePositions[secondOffset + 2]
          vertexCount += 2
        }
      }
      lineGeometry.setDrawRange(0, vertexCount)
      linePositionAttribute.needsUpdate = true
    }

    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', resize)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const clock = new THREE.Clock()
    let animationFrame
    let frameCount = 0
    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.04)
      const liveBounds = getBounds()
      for (let index = 0; index < nodeCount; index += 1) {
        const offset = index * 3
        nodePositions[offset] += velocities[offset] * delta
        nodePositions[offset + 1] += velocities[offset + 1] * delta
        nodePositions[offset + 2] += velocities[offset + 2] * delta
        if (nodePositions[offset] > liveBounds.x) nodePositions[offset] = -liveBounds.x
        if (nodePositions[offset] < -liveBounds.x) nodePositions[offset] = liveBounds.x
        if (nodePositions[offset + 1] > liveBounds.y) nodePositions[offset + 1] = -liveBounds.y
        if (nodePositions[offset + 1] < -liveBounds.y) nodePositions[offset + 1] = liveBounds.y
        if (nodePositions[offset + 2] > liveBounds.z) nodePositions[offset + 2] = -liveBounds.z
        if (nodePositions[offset + 2] < -liveBounds.z) nodePositions[offset + 2] = liveBounds.z
      }
      nodePositionAttribute.needsUpdate = true
      if (frameCount % refreshEveryFrames === 0) {
        refreshConnections()
      }
      frameCount += 1
      if (!prefersReducedMotion) {
        networkGroup.rotation.y += (mouseX * 0.14 - networkGroup.rotation.y) * 0.02
        networkGroup.rotation.x += (-mouseY * 0.08 - networkGroup.rotation.x) * 0.02
      }
      if (ambientPoints && !prefersReducedMotion) ambientPoints.rotation.y += 0.001
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      themeObserver.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resize)
      nodeGeometry.dispose()
      nodeMaterial.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      ambientGeometry?.dispose()
      ambientMaterial?.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [pointsCount, color, linkDistance, coverage, showAmbientCloud])

  return <div ref={containerRef} className={`particle-network ${className}`.trim()} aria-hidden="true" />
}
