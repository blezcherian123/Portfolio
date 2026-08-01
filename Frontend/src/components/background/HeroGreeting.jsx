import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import greetingModelUrl from '../../assets/ImageToStl.com_Standing+Greeting.glb?url'

export default function HeroGreeting() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.2, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x0b1320, 2.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
    keyLight.position.set(4, 6, 6)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x5de6ff, 2.4)
    rimLight.position.set(-5, 3, -2)
    scene.add(rimLight)

    const clock = new THREE.Clock()
    let mixer
    let model
    let animationFrame
    let disposed = false
    let pointerX = 0

    const loader = new GLTFLoader()
    loader.load(greetingModelUrl, (gltf) => {
      if (disposed) return

      model = gltf.scene
      const initialBounds = new THREE.Box3().setFromObject(model)
      const initialSize = initialBounds.getSize(new THREE.Vector3())
      const scale = 6.6 / Math.max(initialSize.x, initialSize.y, initialSize.z)
      model.scale.setScalar(scale)

      const scaledBounds = new THREE.Box3().setFromObject(model)
      const center = scaledBounds.getCenter(new THREE.Vector3())
      model.position.x = -center.x
      model.position.y = -scaledBounds.min.y - 3.25
      scene.add(model)

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model)
        const greetingClip = gltf.animations[0]
        mixer.clipAction(greetingClip).play()
        const message = container.parentElement?.querySelector('.hero-greeting-message')
        message?.style.setProperty('--greeting-duration', `${greetingClip.duration}s`)
        message?.classList.add('is-synced')
      }
    })

    const resize = () => {
      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const handleMouseMove = (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.04)
      mixer?.update(delta)
      if (model) model.rotation.y += (pointerX * 0.18 - model.rotation.y) * 0.025
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      mixer?.stopAllAction()
      model?.traverse((object) => {
        if (!object.isMesh) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      })
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="hero-greeting">
      <div ref={containerRef} className="hero-greeting-canvas" aria-hidden="true" />
      <p className="hero-greeting-message">Hiiii, Nice to meet you! <span aria-hidden="true">👋</span></p>
    </div>
  )
}
