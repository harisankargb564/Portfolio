/*
 * Cinematic "travel into space" intro.
 * Black-out → hyperspace starfield streaking past (with rocket vibration) →
 * white flash on arrival → reveal the page. Returns a Promise that resolves
 * once the page is revealed, so callers can start a tour right after.
 */
export function playWarpIntro() {
  return new Promise((resolve) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const overlay = document.createElement('div')
    overlay.className = 'warp-overlay'
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '100000',
      background: '#000',
      opacity: '0',
      transition: 'opacity 0.4s ease',
      pointerEvents: 'all',
      overflow: 'hidden',
    })

    const canvas = document.createElement('canvas')
    Object.assign(canvas.style, { position: 'absolute', inset: '0', willChange: 'transform' })
    overlay.appendChild(canvas)
    document.body.appendChild(overlay)

    const ctx = canvas.getContext('2d')
    let W, H, cx, cy
    const resize = () => {
      W = canvas.width = Math.floor(window.innerWidth * dpr)
      H = canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      cx = W / 2
      cy = H / 2
    }
    resize()
    window.addEventListener('resize', resize)

    const maxZ = Math.max(W, H)
    const COUNT = 700
    const stars = []
    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * W,
        y: (Math.random() - 0.5) * H,
        z: Math.random() * maxZ,
        pz: 0,
      })
    }

    // fade the black curtain in
    requestAnimationFrame(() => { overlay.style.opacity = '1' })

    const focal = W * 0.55
    const DURATION = 3600   // ms of warp travel
    let t0 = null

    const frame = (ts) => {
      if (t0 == null) t0 = ts
      const elapsed = ts - t0
      const p = Math.min(elapsed / DURATION, 1)

      // ramp up to full warp speed in the first ~30%, then sustain the cruise
      const ramp = Math.min(1, p / 0.3)
      const speed = 4 + Math.pow(ramp, 1.7) * 70

      // motion-blur trails
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fillRect(0, 0, W, H)

      for (const s of stars) {
        s.pz = s.z
        s.z -= speed
        if (s.z < 1) {
          s.x = (Math.random() - 0.5) * W
          s.y = (Math.random() - 0.5) * H
          s.z = maxZ
          s.pz = s.z
          continue
        }
        const sx = (s.x / s.z) * focal + cx
        const sy = (s.y / s.z) * focal + cy
        const px = (s.x / s.pz) * focal + cx
        const py = (s.y / s.pz) * focal + cy

        const depth = 1 - s.z / maxZ
        const alpha = Math.min(1, depth + 0.15)
        const g = 200 + ((Math.random() * 55) | 0)
        ctx.strokeStyle = `rgba(${g},255,255,${alpha})`
        ctx.lineWidth = Math.max(1, depth * 2.6 * dpr)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      }

      // rocket vibration — follows the speed ramp, sustained through the cruise
      const shake = ramp * 8
      canvas.style.transform =
        `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)`

      if (p < 1) {
        requestAnimationFrame(frame)
      } else {
        // arrival white flash
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.fillRect(0, 0, W, H)
        canvas.style.transform = 'none'
        // reveal the page
        overlay.style.transition = 'opacity 0.6s ease'
        overlay.style.opacity = '0'
        setTimeout(() => {
          window.removeEventListener('resize', resize)
          overlay.remove()
          resolve()
        }, 620)
      }
    }

    // hold pure black ~750ms, jump to the top of the page while hidden,
    // then launch into warp
    setTimeout(() => {
      // force:true so it still jumps even when the caller has paused Lenis,
      // and so Lenis' internal target resets to the top (otherwise it springs
      // back to the previous scroll position on resume)
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true, force: true })
      else window.scrollTo(0, 0)
    }, 420)

    setTimeout(() => requestAnimationFrame(frame), 750)
  })
}

/*
 * Cinematic "fly up through the clouds" intro (light mode).
 * Uses a real cloud photograph: the camera zooms up into the sky while a
 * nearer cloud layer rushes past (parallax depth), brightening into a soft
 * whiteout, then reveals the page. Gentle balloon sway throughout.
 */
const cloudImg = new Image()
cloudImg.src = '/clouds.jpg'

export function playCloudIntro() {
  return new Promise((resolve) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const overlay = document.createElement('div')
    overlay.className = 'cloud-overlay'
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '100000',
      // matches the light theme page background (--bg #f5f4ef / --bg2 #eceae3)
      background: 'linear-gradient(to bottom, #fbfaf6 0%, #f3f1ea 50%, #eae7df 100%)',
      opacity: '0',
      transition: 'opacity 0.4s ease',
      pointerEvents: 'all',
      overflow: 'hidden',
    })

    const canvas = document.createElement('canvas')
    Object.assign(canvas.style, { position: 'absolute', inset: '0', willChange: 'transform' })
    overlay.appendChild(canvas)
    document.body.appendChild(overlay)

    const ctx = canvas.getContext('2d')
    let W, H, cx, cy
    const resize = () => {
      W = canvas.width = Math.floor(window.innerWidth * dpr)
      H = canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      cx = W / 2
      cy = H / 2
    }
    resize()
    window.addEventListener('resize', resize)

    // draw the real cloud photo, cover-fit, scaled/panned/blurred per layer
    const drawCloudLayer = (scale, alpha, blur, panX, panY) => {
      if (!cloudImg.complete || !cloudImg.naturalWidth) return
      const iw = cloudImg.naturalWidth
      const ih = cloudImg.naturalHeight
      const s = Math.max(W / iw, H / ih) * scale
      const dw = iw * s
      const dh = ih * s
      const dx = (W - dw) / 2 + panX
      const dy = (H - dh) / 2 + panY
      ctx.save()
      ctx.globalAlpha = alpha
      if (blur > 0) ctx.filter = `blur(${blur}px)`
      ctx.drawImage(cloudImg, dx, dy, dw, dh)
      ctx.restore()
    }

    // staggered cloud masses that fly toward & past the camera, looping — this
    // is what creates the continuous "travelling through clouds" sensation.
    // Each has a phase offset, a crop offset (so it shows a different cloud),
    // and a drift direction.
    const passes = [
      { phase: 0.00, cropX: -0.18, cropY: -0.10, dirX: -1.0, dirY: 0.5 },
      { phase: 0.25, cropX:  0.22, cropY:  0.12, dirX:  0.9, dirY: 0.7 },
      { phase: 0.50, cropX: -0.10, cropY:  0.20, dirX: -0.7, dirY: 0.9 },
      { phase: 0.72, cropX:  0.15, cropY: -0.18, dirX:  0.8, dirY: 0.6 },
      { phase: 0.88, cropX: -0.24, cropY:  0.05, dirX: -0.5, dirY: 1.0 },
    ]
    const CYCLES = 2.6   // how many times clouds rush past over the run

    const DURATION = 3600
    let t0 = null

    const frame = (ts) => {
      if (t0 == null) t0 = ts
      const elapsed = ts - t0
      const p = Math.min(elapsed / DURATION, 1)
      const tSec = elapsed / 1000
      const ease = p * p * (3 - 2 * p)   // smoothstep
      const accel = Math.min(1, p / 0.25)   // ramp into the travel speed

      // cream base (covers any gap)
      ctx.fillStyle = '#eef0ee'
      ctx.fillRect(0, 0, W, H)

      // BACK layer — the sky we're rising into, steadily zooming
      const backScale = 1.05 + ease * 0.7
      const backPanY  = ease * H * 0.16
      drawCloudLayer(backScale, 1, ease * 1.2, Math.sin(tSec * 0.4) * W * 0.01, backPanY)

      // NEAR passes — clouds streaming toward & past the camera, far→near order
      const layers = []
      for (const pass of passes) {
        const lp = ((p * CYCLES + pass.phase) % 1)           // local 0..1 cycle
        const scale = 1.4 + lp * lp * 4.2                    // accelerate as it nears
        const alpha = Math.sin(lp * Math.PI) * 0.8 * accel   // fade in & blow past
        const blur = 5 + lp * 30
        const reach = W * 0.42
        const panX = pass.cropX * W + pass.dirX * lp * reach
        const panY = pass.cropY * H + pass.dirY * lp * reach + backPanY
        layers.push({ lp, scale, alpha, blur, panX, panY })
      }
      layers.sort((a, b) => a.lp - b.lp)   // nearer (bigger lp) painted last
      for (const L of layers) drawCloudLayer(L.scale, L.alpha, L.blur, L.panX, L.panY)

      // atmospheric brighten — ascending toward the light → soft whiteout
      const bright = Math.pow(p, 2.2) * 0.7
      ctx.fillStyle = `rgba(255,253,247,${bright})`
      ctx.fillRect(0, 0, W, H)

      // soft vignette for cinematic framing
      const vg = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.32, cx, cy, Math.max(W, H) * 0.72)
      vg.addColorStop(0, 'rgba(90,95,110,0)')
      vg.addColorStop(1, `rgba(80,86,102,${0.2 * (1 - bright)})`)
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)

      // gentle hot-air-balloon sway
      const swayX = Math.sin(tSec * 1.2) * 8 * Math.min(1, p / 0.3)
      const swayY = Math.cos(tSec * 0.9) * 5 * Math.min(1, p / 0.3)
      canvas.style.transform = `translate(${swayX}px, ${swayY}px)`

      if (p < 1) {
        requestAnimationFrame(frame)
      } else {
        // soft cream arrival flash (matches the light page background)
        ctx.fillStyle = 'rgba(250,249,245,0.96)'
        ctx.fillRect(0, 0, W, H)
        canvas.style.transform = 'none'
        overlay.style.transition = 'opacity 0.6s ease'
        overlay.style.opacity = '0'
        setTimeout(() => {
          window.removeEventListener('resize', resize)
          overlay.remove()
          resolve()
        }, 620)
      }
    }

    // fade in, jump to top while hidden, then fly up through the clouds
    requestAnimationFrame(() => { overlay.style.opacity = '1' })
    setTimeout(() => {
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true, force: true })
      else window.scrollTo(0, 0)
    }, 420)
    setTimeout(() => requestAnimationFrame(frame), 750)
  })
}

/* Picks the intro that matches the active theme. */
export function playIntro() {
  const isLight = document.documentElement.dataset.theme === 'light'
  return isLight ? playCloudIntro() : playWarpIntro()
}
