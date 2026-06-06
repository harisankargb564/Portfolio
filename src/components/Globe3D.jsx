import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default function Globe3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = el.clientWidth
    const H = el.clientHeight

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 1000)
    camera.position.z = 4.2

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    el.appendChild(renderer.domElement)

    const tl = new THREE.TextureLoader()

    /* ── All rotating objects in one pivot ── */
    const pivot = new THREE.Group()
    scene.add(pivot)

    /* ── Earth ── */
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map:         tl.load('/earth_day.jpg'),
        normalMap:   tl.load('/earth_normal.jpg'),
        normalScale: new THREE.Vector2(4, 4),
        specularMap: tl.load('/earth_specular.jpg'),
        specular:    new THREE.Color(0x55aacc),
        shininess:   30,
      })
    )
    pivot.add(earth)

    /* ── Atmosphere glow layers ── */
    ;[
      { r: 1.05, color: 0x3399ff, opacity: 0.15 },
      { r: 1.14, color: 0x2266ee, opacity: 0.08 },
      { r: 1.28, color: 0x1144cc, opacity: 0.04 },
      { r: 1.50, color: 0x0033aa, opacity: 0.015 },
    ].forEach(({ r, color, opacity }) => {
      pivot.add(new THREE.Mesh(
        new THREE.SphereGeometry(r, 64, 64),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.BackSide, depthWrite: false })
      ))
    })

    /* ── Lights (on scene, not pivot, so they don't rotate) ── */
    const sun = new THREE.DirectionalLight(0xfff5e0, 2.6)
    sun.position.set(6, 3, 5)
    scene.add(sun)
    scene.add(new THREE.AmbientLight(0x334466, 0.9))
    const fill = new THREE.DirectionalLight(0x2244aa, 0.4)
    fill.position.set(-5, -2, -4)
    scene.add(fill)

    /* ── OrbitControls — rotation only, no zoom/pan ── */
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom   = false
    controls.enablePan    = false
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.rotateSpeed  = 0.55
    controls.autoRotate   = true
    controls.autoRotateSpeed = 0.5

    /* ── Scale zoom via scroll (no camera movement) ── */
    const MIN_S = 0.8, MAX_S = 1.32
    let scale = 1.0, targetScale = 1.0

    const onWheel = (e) => {
      e.preventDefault()
      e.stopPropagation()
      targetScale = Math.max(MIN_S, Math.min(MAX_S, targetScale + (e.deltaY < 0 ? 0.05 : -0.05)))
      window.lenis?.stop()
      clearTimeout(onWheel._t)
      onWheel._t = setTimeout(() => window.lenis?.start(), 400)
    }
    el.addEventListener('wheel', onWheel, { passive: false })

    /* ── Resize ── */
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    /* ── Loop ── */
    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      controls.update()
      scale += (targetScale - scale) * 0.07
      pivot.scale.setScalar(scale)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('wheel', onWheel)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="globe-3d" />
}
