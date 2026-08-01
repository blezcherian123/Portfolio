import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const DARK_SKY_BLUE = 0x2E86C1

// React version of the supplied Three.js B animation. The geometry, colours,
// lighting, camera, and interaction values intentionally match the reference.
export default function HeroMonogram() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const material = new THREE.MeshPhongMaterial({
      color: 0x2F8FD8,
      emissive: 0x15599B,
      emissiveIntensity: 1.45,
      shininess: 100,
      transparent: true,
      opacity: 0.96,
    })

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 32)
    const body = new THREE.Mesh(bodyGeometry, material)
    body.position.x = -1.5
    group.add(body)

    const topCurveGeometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100, Math.PI)
    const topCurve = new THREE.Mesh(topCurveGeometry, material)
    topCurve.position.set(0, 1.5, 0)
    topCurve.rotation.z = -Math.PI / 2
    group.add(topCurve)

    const bottomCurveGeometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100, Math.PI)
    const bottomCurve = new THREE.Mesh(bottomCurveGeometry, material)
    bottomCurve.position.set(0, -1.5, 0)
    bottomCurve.rotation.z = -Math.PI / 2
    group.add(bottomCurve)

    const particlesCount = 200
    const positions = new Float32Array(particlesCount * 3)
    for (let index = 0; index < particlesCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 15
      positions[index * 3 + 1] = (Math.random() - 0.5) * 15
      positions[index * 3 + 2] = (Math.random() - 0.5) * 15
    }
    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      color: DARK_SKY_BLUE,
      size: 0.09,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(points)

    const light = new THREE.PointLight(0xffffff, 1)
    light.position.set(5, 5, 5)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0x404040))
    camera.position.z = 10

    const resize = () => {
      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    resize()

    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', resize)

    let animationFrame
    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      group.rotation.y += 0.01
      group.rotation.x += 0.005
      group.rotation.y += (mouseX * 0.5 - group.rotation.y) * 0.05
      group.rotation.x += (-mouseY * 0.5 - group.rotation.x) * 0.05
      points.rotation.y += 0.001
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resize)
      bodyGeometry.dispose()
      topCurveGeometry.dispose()
      bottomCurveGeometry.dispose()
      particlesGeometry.dispose()
      material.dispose()
      particlesMaterial.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="hero-three-canvas" ref={containerRef} aria-hidden="true" />
}
