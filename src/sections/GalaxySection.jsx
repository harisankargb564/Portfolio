import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
 * Two-colour spiral galaxy (Three.js particle galaxy generator).
 * Thousands of points arranged into spiral branches, coloured from a warm
 * inner hue to a cool outer hue. No rotation — it holds a fixed tilt and the
 * camera zooms in/out as the section scrolls through the viewport, so the
 * effect never hijacks normal page scrolling.
 */
export default function GalaxySection() {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    let W = el.clientWidth
    let H = el.clientHeight

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100)
    camera.position.set(3, 3, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    /* ── Galaxy generator ── */
    const params = {
      count: 100000,
      size: 0.011,
      radius: 5.5,
      branches: 4,
      spin: 1.15,
      randomness: 0.22,
      randomnessPower: 3.2,
      insideColor: '#ff7a3c',
      outsideColor: '#3b6fff',
    }

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(params.count * 3)
    const colors    = new Float32Array(params.count * 3)
    const radiusRatio = new Float32Array(params.count)   // stored for re-colouring

    for (let i = 0; i < params.count; i++) {
      const i3 = i * 3
      const radius = Math.random() * params.radius
      const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2
      const spinAngle = radius * params.spin

      const rand = () =>
        Math.pow(Math.random(), params.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        params.randomness *
        radius

      positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + rand()
      positions[i3 + 1] = rand() * 0.5
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rand()
      radiusRatio[i] = radius / params.radius
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3))

    /* palette per theme — additive bright on dark, opaque saturated on light */
    const PALETTE = {
      dark:  { inside: '#ff7a3c', outside: '#3b6fff' },
      light: { inside: '#f0622a', outside: '#3354d8' },
    }
    const applyPalette = (mode) => {
      const ci = new THREE.Color(PALETTE[mode].inside)
      const co = new THREE.Color(PALETTE[mode].outside)
      const tmp = new THREE.Color()
      for (let i = 0; i < params.count; i++) {
        tmp.copy(ci).lerp(co, radiusRatio[i])
        colors[i * 3]     = tmp.r
        colors[i * 3 + 1] = tmp.g
        colors[i * 3 + 2] = tmp.b
      }
      geometry.attributes.aColor.needsUpdate = true
    }

    /* Shader: each particle swirls around the centre, inner ones faster than
       outer ones (differential rotation) — the figure flows without rigidly
       spinning. Points render as soft round glows. */
    const vertexShader = /* glsl */`
      uniform float uTime;
      uniform float uSize;
      uniform float uSpeed;
      attribute vec3 aColor;
      varying vec3 vColor;
      void main() {
        float dist  = length(position.xz);
        float angle = atan(position.x, position.z);
        // gentle oscillating sway (NOT continuous rotation) so arms never wind
        // up into concentric rings — keeps the exact spiral shape, just alive
        angle += sin(uTime * uSpeed + dist * 1.4) * 0.05;
        vec3 pos = position;
        pos.x = cos(angle) * dist;
        pos.z = sin(angle) * dist;

        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        vec4 viewPosition  = viewMatrix * modelPosition;
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = uSize * (1.0 / -viewPosition.z);
        vColor = aColor;
      }
    `
    const fragmentShader = /* glsl */`
      uniform float uOpacity;
      uniform float uSharp;
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        float strength = pow(max(0.0, 1.0 - d * 2.0), uSharp);   // round point
        if (strength < 0.01) discard;
        gl_FragColor = vec4(vColor, strength * uOpacity);
      }
    `

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime:    { value: 0 },
        uSpeed:   { value: 0.5 },
        uSize:    { value: 14 * Math.min(window.devicePixelRatio, 2) },
        uOpacity: { value: 0.95 },
        uSharp:   { value: 1.6 },
      },
    })

    const galaxy = new THREE.Points(geometry, material)
    scene.add(galaxy)

    /* soft round glowing core (radial-gradient texture, not a square sprite) */
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = glowCanvas.height = 128
    const gctx = glowCanvas.getContext('2d')
    const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0.0, 'rgba(255,225,180,0.95)')
    grad.addColorStop(0.18, 'rgba(255,200,140,0.55)')
    grad.addColorStop(0.45, 'rgba(255,150,90,0.18)')
    grad.addColorStop(1.0, 'rgba(255,140,80,0)')
    gctx.fillStyle = grad
    gctx.fillRect(0, 0, 128, 128)
    const glowTex = new THREE.CanvasTexture(glowCanvas)

    const coreMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const core = new THREE.Sprite(coreMat)
    core.scale.set(2.4, 2.4, 1)
    scene.add(core)

    /* ── Fixed tilt (no rotation) ── */
    galaxy.rotation.x = 0.62
    galaxy.rotation.y = 0.55

    /* ── Theme handling (light vs dark) ── */
    const dpr = Math.min(window.devicePixelRatio, 2)
    const applyTheme = (isLight) => {
      applyPalette(isLight ? 'light' : 'dark')
      // additive glow washes out on a light bg; use normal blending. Keep the
      // points small, crisp and lightly transparent so they read as a clean
      // starfield spiral instead of muddy ink blobs.
      material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending
      material.uniforms.uOpacity.value = isLight ? 0.55 : 0.95
      material.uniforms.uSharp.value   = isLight ? 4.5 : 1.6
      material.uniforms.uSize.value    = (isLight ? 9 : 14) * dpr
      material.needsUpdate = true
      core.visible = !isLight   // the warm additive core only reads on dark
    }
    applyTheme(document.documentElement.dataset.theme === 'light')

    const themeObserver = new MutationObserver(() => {
      applyTheme(document.documentElement.dataset.theme === 'light')
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    /* ── Scroll-driven zoom (dolly camera; never blocks page scrolling) ── */
    const camDir = camera.position.clone().normalize()   // fixed view direction
    const FAR_DIST = 9.5    // zoomed out (section entering / leaving)
    const NEAR_DIST = 3.6   // zoomed in (section centered)
    let camDist = FAR_DIST
    let targetDist = FAR_DIST

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        // progress 0 (entering) → 0.5 (centered) → 1 (leaving)
        // zoom in toward the middle, back out at the edges
        const centered = 1 - Math.abs(self.progress - 0.5) * 2   // 0..1..0
        targetDist = FAR_DIST + (NEAR_DIST - FAR_DIST) * centered
      },
    })

    /* ── Resize ── */
    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', onResize)

    /* ── Loop ── */
    const clock = new THREE.Clock()
    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)

      // slow per-particle swirl
      material.uniforms.uTime.value = clock.getElapsedTime()

      // smooth dolly zoom along the fixed view direction
      camDist += (targetDist - camDist) * 0.08
      camera.position.copy(camDir).multiplyScalar(camDist)
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      themeObserver.disconnect()
      st.kill()
      geometry.dispose()
      material.dispose()
      coreMat.dispose()
      glowTex.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <section id="galaxy" className="galaxy-section">
      <div ref={mountRef} className="galaxy-canvas" />
      <div className="galaxy-overlay">
        <span className="eyebrow">Beyond the Code</span>
        <h2 className="section-title">Exploring new <em>frontiers</em></h2>
        <p className="body-copy">Always reaching further — one experiment, one orbit at a time.</p>
      </div>
    </section>
  )
}
