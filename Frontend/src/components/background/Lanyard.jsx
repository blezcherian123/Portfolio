import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import cardGLB from '../../assets/lanyard/card.glb'
import lanyard from '../../assets/lanyard/lanyard.png'
import * as THREE from 'three'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// Warm the suspend-react caches at import time so the Canvas children usually
// render without suspending at all (a suspension propagating above the Canvas
// would tear down and recreate the WebGL context).
useGLTF.preload(cardGLB)
useTexture.preload(lanyard)
useTexture.preload(BLANK_PIXEL)

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 }
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 }

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 2,
  onCardClick = null,
  className = '',
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  // The GLB is ~2.4MB, so the canvas only mounts after the page has finished
  // loading to avoid competing with the critical render resources.
  const [ready, setReady] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let timer
    const arm = () => {
      timer = window.setTimeout(() => setReady(true), 400)
    }
    if (document.readyState === 'complete') {
      arm()
    } else {
      window.addEventListener('load', arm, { once: true })
    }
    return () => {
      window.removeEventListener('load', arm)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (frontImage) useTexture.preload(frontImage)
    if (backImage) useTexture.preload(backImage)
    if (lanyardImage) useTexture.preload(lanyardImage)
  }, [frontImage, backImage, lanyardImage])

  const handleCardClick = () => {
    onCardClick?.()
  }

  return (
    <div className={`lanyard-root${className ? ` ${className}` : ''}`}>
      <div ref={wrapperRef} className="lanyard-wrapper">
        {ready && (
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: position, fov: fov }}
              dpr={[1, isMobile ? 1.5 : 2]}
              gl={{ alpha: transparent }}
              onCreated={(state) => {
                state.gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
              }}
            >
              <ambientLight intensity={Math.PI} />
              <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
                <PointerSway>
                  <Band
                    isMobile={isMobile}
                    frontImage={frontImage}
                    backImage={backImage}
                    imageFit={imageFit}
                    lanyardImage={lanyardImage}
                    lanyardWidth={lanyardWidth}
                    onActivate={handleCardClick}
                  />
                </PointerSway>
              </Physics>
              <Environment blur={0.75}>
                <Lightformer
                  intensity={2}
                  color="white"
                  position={[0, -1, 5]}
                  rotation={[0, 0, Math.PI / 3]}
                  scale={[100, 0.1, 1]}
                />
                <Lightformer
                  intensity={3}
                  color="white"
                  position={[-1, -1, 1]}
                  rotation={[0, 0, Math.PI / 3]}
                  scale={[100, 0.1, 1]}
                />
                <Lightformer
                  intensity={3}
                  color="white"
                  position={[1, 1, 1]}
                  rotation={[0, 0, Math.PI / 3]}
                  scale={[100, 0.1, 1]}
                />
                <Lightformer
                  intensity={10}
                  color="white"
                  position={[-10, 0, 14]}
                  rotation={[0, Math.PI / 2, Math.PI / 3]}
                  scale={[100, 10, 1]}
                />
              </Environment>
            </Canvas>
          </Suspense>
        )}
      </div>
    </div>
  )
}

// Gentle parallax: the whole rig leans toward the pointer while it is not being
// dragged, so the badge keeps reacting to the mouse even without a grab.
function PointerSway({ children }) {
  const groupRef = useRef(null)
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const handleMove = (event) => {
      target.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      target.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const ease = Math.min(1, delta * 3.5)
    group.rotation.y += (target.current.x * 0.14 - group.rotation.y) * ease
    group.rotation.x += (target.current.y * 0.07 - group.rotation.x) * ease
  })

  return <group ref={groupRef}>{children}</group>
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  onActivate = null,
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef()
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3()
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  // Clone the cached texture so the repeat wrapping can be applied without
  // mutating the texture drei keeps in its global cache.
  const rawLanyardTexture = useTexture(lanyardImage || lanyard);
  const texture = useMemo(() => {
    const t = rawLanyardTexture.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [rawLanyardTexture]);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img, rect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);
  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = 'chordal';
    return c;
  });
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  // Distinguishes a quick tap/click on the card from an actual drag so the card
  // can trigger actions without firing while the user is swinging it around.
  const pressInfo = useRef(null);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 2.74, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      const px = THREE.MathUtils.clamp(state.pointer.x, -0.88, 0.88);
      const py = THREE.MathUtils.clamp(state.pointer.y, -0.88, 0.88);
      vec.set(px, py, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    pressInfo.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, time: performance.now() };
    drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    drag(false);
    const press = pressInfo.current;
    pressInfo.current = null;
    if (!press || !onActivate) return;
    const moved = Math.hypot(e.nativeEvent.clientX - press.x, e.nativeEvent.clientY - press.y);
    const elapsed = performance.now() - press.time;
    if (moved < 6 && elapsed < 400) onActivate();
  };

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[1.1, 1.6, 0.03]} />
          <group
            scale={[3.06, 3.2, 2.25]}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={handlePointerUp}
            onPointerDown={handlePointerDown}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
