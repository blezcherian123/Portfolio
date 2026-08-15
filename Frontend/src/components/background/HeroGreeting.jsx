import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import greetingModelUrl from '../../assets/ImageToStl.com_Standing+Greeting.glb?url'

export default function HeroGreeting() {
  const containerRef = useRef(null)
  const messageRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const message = messageRef.current
    if (!container) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCompactViewport = window.innerWidth < 900
    const shouldAnimate = !prefersReducedMotion && !isCompactViewport

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.2, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !prefersReducedMotion })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prefersReducedMotion || isCompactViewport ? 1 : 1.25))
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
    let pointerY = 0
    let headNode = null
    let showTimer
    let hideTimer
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    let bubbleCleanup

    const showMessageBubble = (clipDuration, mixer) => {
      if (!message) return
      const bubbleDurationMs = 600
      const scheduleBubble = () => {
        if (disposed) return
        message.classList.add('is-visible')
        hideTimer = window.setTimeout(() => {
          message.classList.remove('is-visible')
        }, bubbleDurationMs)
      }

      const onLoop = () => {
        resetMessageTimers()
        showTimer = window.setTimeout(scheduleBubble, 3000)
      }

      mixer.addEventListener('loop', onLoop)
      showTimer = window.setTimeout(scheduleBubble, 3000)
      return () => mixer.removeEventListener('loop', onLoop)
    }

    const resetMessageTimers = () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }

    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)

    // The GLB model was ~14MB, so its download is deferred until after the page
    // has finished loading to avoid competing with the critical render resources.
    // (It has since been meshopt-compressed to ~2.6MB.)
    let modelLoadTimer
    const startModelLoad = () => {
      if (disposed) return
      loader.load(greetingModelUrl, (gltf) => {
        if (disposed) return

        model = gltf.scene
        const initialBounds = new THREE.Box3().setFromObject(model)
        const initialSize = initialBounds.getSize(new THREE.Vector3())
        const scale = 6.2 / Math.max(initialSize.x, initialSize.y, initialSize.z)
        model.scale.setScalar(scale)

        const scaledBounds = new THREE.Box3().setFromObject(model)
        const center = scaledBounds.getCenter(new THREE.Vector3())
        const visibleHalfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
        const feetY = camera.position.y - visibleHalfHeight + 0.3
        model.position.x = -center.x
        model.position.y = -scaledBounds.min.y + feetY
        scene.add(model)

        model.traverse((object) => {
          if (headNode) return
          if (object.name.toLowerCase().includes('head')) headNode = object
        })

        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model)
          const greetingClip = gltf.animations[0]
          mixer.clipAction(greetingClip).play()
          message?.classList.add('is-synced')
          bubbleCleanup = showMessageBubble(greetingClip.duration, mixer)
        }
      })
    }

    const beginAfterLoad = () => {
      if (disposed) return
      window.clearTimeout(modelLoadTimer)
      modelLoadTimer = window.setTimeout(startModelLoad, 400)
    }
    if (document.readyState === 'complete') {
      beginAfterLoad()
    } else {
      window.addEventListener('load', beginAfterLoad, { once: true })
    }

    const resize = () => {
      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const setPointerFromEvent = (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2
      pointerY = -(event.clientY / window.innerHeight - 0.5) * 2
    }
    const updateHover = (event) => {
      if (!model || disposed) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(model, true)
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default'
    }
    const handleMouseMove = (event) => {
      setPointerFromEvent(event)
      updateHover(event)
    }
    const handleClick = (event) => {
      if (!model || disposed) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(model, true)
      if (hits.length === 0) return
      renderer.domElement.style.cursor = 'pointer'
      message?.classList.add('is-visible')
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => message.classList.remove('is-visible'), 2000)
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('click', handleClick)

    // Skip WebGL rendering while the hero is scrolled out of view.
    let isVisible = true
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting)
      },
      { threshold: 0 },
    )
    visibilityObserver.observe(container)

    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      if (!isVisible) return
      const delta = Math.min(clock.getDelta(), 0.04)
      if (shouldAnimate) {
        mixer?.update(delta)
        if (model) {
          model.rotation.y += (pointerX * 0.32 - model.rotation.y) * 0.05
          model.rotation.x += (pointerY * 0.08 - model.rotation.x) * 0.04
        }
        if (headNode) {
          headNode.rotation.y += (pointerX * 0.28 - headNode.rotation.y) * 0.06
          headNode.rotation.x += (pointerY * 0.12 - headNode.rotation.x) * 0.06
        }
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      window.clearTimeout(modelLoadTimer)
      visibilityObserver.disconnect()
      cancelAnimationFrame(animationFrame)
      bubbleCleanup?.()
      resetMessageTimers()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
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
      <p ref={messageRef} className="hero-greeting-message">Hii, Nice to meet you! <span aria-hidden="true">👋</span></p>
    </div>
  )
}
