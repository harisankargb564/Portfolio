import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

const roles = ['Full Stack Developer', 'UI/UX Designer', 'React Specialist', 'AI Engineer', 'Problem Solver']

export default function Hero() {
  const canvasRef = useRef(null)
  const heroRef   = useRef(null)
  const name1Ref  = useRef(null)
  const name2Ref  = useRef(null)
  const badgeRef  = useRef(null)
  const midRef    = useRef(null)
  const metaRef   = useRef(null)
  const scrollRef = useRef(null)
  const roleRef   = useRef(null)

  /* ─── Canvas — particle network + antigravity + hover sparks + meteors ─── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, frame = 0
    const mouse = { x: -999, y: -999, px: -999, py: -999 }

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    window.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect()
      mouse.px = mouse.x; mouse.py = mouse.y
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }, { passive: true })

    /* ── base particles ── */
    const N = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 130)
    const pts = Array.from({ length: N }, () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      return {
        ox: x, oy: y,
        dvx: (Math.random() - 0.5) * 0.2,
        dvy: (Math.random() - 0.5) * 0.2,
        x, y, vx: 0, vy: 0,
        r:  Math.random() * 1.4 + 0.3,
        op: Math.random() * 0.25 + 0.05,
      }
    })

    /* ── hover spark particles ── */
    const sparks = []
    const spawnSpark = () => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 2.2 + 0.5
      const isBig = Math.random() < 0.2
      sparks.push({
        x: mouse.x + (Math.random() - 0.5) * 40,
        y: mouse.y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.018 + 0.010,
        r: isBig ? Math.random() * 2 + 1.5 : Math.random() * 1.2 + 0.4,
        isBig,
      })
    }

    /* ── meteors / shooting stars ── */
    const meteors = []
    const spawnMeteor = () => {
      const startX = Math.random() * canvas.width  * 0.55
      const startY = Math.random() * canvas.height * 0.45
      const angle  = (Math.random() * 0.3 + 0.15) * Math.PI
      const speed  = Math.random() * 6 + 8
      meteors.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.008 + 0.006,
        tail: Math.random() * 80 + 60,
        width: Math.random() * 1.2 + 0.6,
      })
    }
    setTimeout(spawnMeteor, 1200)

    /* ── space traveler ── */
    const resetTraveler = (t) => {
      /* pick a random edge start */
      const edge = Math.floor(Math.random() * 4)
      if (edge === 0) { t.x = -40; t.y = canvas.height * (0.2 + Math.random() * 0.6) }       /* left */
      else if (edge === 1) { t.x = canvas.width + 40; t.y = canvas.height * (0.2 + Math.random() * 0.6) } /* right */
      else if (edge === 2) { t.x = canvas.width * (0.2 + Math.random() * 0.6); t.y = -40 }    /* top */
      else { t.x = canvas.width * (0.2 + Math.random() * 0.6); t.y = canvas.height + 40 }     /* bottom */
      /* aim toward opposite-ish region with slight drift */
      const tx = canvas.width  * (0.2 + Math.random() * 0.6)
      const ty = canvas.height * (0.2 + Math.random() * 0.6)
      const dist = Math.sqrt((tx - t.x) ** 2 + (ty - t.y) ** 2)
      const spd  = 0.38 + Math.random() * 0.22
      t.vx = (tx - t.x) / dist * spd
      t.vy = (ty - t.y) / dist * spd
      t.angle = Math.atan2(t.vy, t.vx)
      t.wavePhase = 0
      t.exhaustPts = []
    }
    const traveler = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, wavePhase: 0, exhaustPts: [] }
    resetTraveler(traveler)

    const REPEL  = 180
    const FORCE  = 8
    const SPRING = 0.038
    const DAMP   = 0.88

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      /* spawn hover sparks — 6 per frame every other frame */
      if (mouse.x > 0 && mouse.x < canvas.width && frame % 2 === 0) {
        for (let s = 0; s < 6; s++) spawnSpark()
      }

      /* spawn meteor every ~4–7s */
      if (frame % (Math.floor(Math.random() * 180) + 240) === 0) spawnMeteor()

      /* ── space traveler ── */
      {
        const t = traveler
        t.wavePhase += 0.018
        /* gentle sine-wave weave perpendicular to travel direction */
        const perp = t.angle + Math.PI / 2
        const wave = Math.sin(t.wavePhase) * 0.12
        t.x += t.vx + Math.cos(perp) * wave
        t.y += t.vy + Math.sin(perp) * wave

        /* exhaust particle every 4 frames */
        if (frame % 4 === 0) {
          t.exhaustPts.push({
            x: t.x - Math.cos(t.angle) * 10,
            y: t.y - Math.sin(t.angle) * 10,
            life: 1,
          })
        }
        /* draw exhaust */
        for (let i = t.exhaustPts.length - 1; i >= 0; i--) {
          const e = t.exhaustPts[i]
          e.life -= 0.035
          if (e.life <= 0) { t.exhaustPts.splice(i, 1); continue }
          ctx.beginPath()
          ctx.arc(e.x, e.y, 1.8 * e.life, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(198,255,0,${e.life * 0.45})`
          ctx.fill()
        }

        /* draw ship */
        ctx.save()
        ctx.translate(t.x, t.y)
        ctx.rotate(t.angle)
        /* body */
        ctx.beginPath()
        ctx.moveTo(10, 0)
        ctx.lineTo(-6, -4)
        ctx.lineTo(-3, 0)
        ctx.lineTo(-6, 4)
        ctx.closePath()
        ctx.fillStyle = 'rgba(220,240,255,0.82)'
        ctx.fill()
        /* left wing */
        ctx.beginPath()
        ctx.moveTo(-2, -4)
        ctx.lineTo(-8, -9)
        ctx.lineTo(-6, -4)
        ctx.closePath()
        ctx.fillStyle = 'rgba(180,210,255,0.55)'
        ctx.fill()
        /* right wing */
        ctx.beginPath()
        ctx.moveTo(-2, 4)
        ctx.lineTo(-8, 9)
        ctx.lineTo(-6, 4)
        ctx.closePath()
        ctx.fillStyle = 'rgba(180,210,255,0.55)'
        ctx.fill()
        /* cockpit glow */
        ctx.beginPath()
        ctx.arc(3, 0, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(198,255,0,0.85)'
        ctx.fill()
        /* engine glow */
        const eng = ctx.createRadialGradient(-3, 0, 0, -3, 0, 6)
        eng.addColorStop(0, 'rgba(198,255,120,0.7)')
        eng.addColorStop(1, 'rgba(198,255,0,0)')
        ctx.beginPath()
        ctx.arc(-3, 0, 6, 0, Math.PI * 2)
        ctx.fillStyle = eng
        ctx.fill()
        ctx.restore()

        /* reset when off screen */
        if (t.x < -60 || t.x > canvas.width + 60 || t.y < -60 || t.y > canvas.height + 60) {
          resetTraveler(t)
        }
      }

      /* ── meteors ── */
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.x += m.vx; m.y += m.vy
        m.life -= m.decay
        if (m.life <= 0 || m.x > canvas.width + 200 || m.y > canvas.height + 200) {
          meteors.splice(i, 1); continue
        }
        const tailX = m.x - m.vx / Math.sqrt(m.vx * m.vx + m.vy * m.vy) * m.tail
        const tailY = m.y - m.vy / Math.sqrt(m.vx * m.vx + m.vy * m.vy) * m.tail
        const grd = ctx.createLinearGradient(tailX, tailY, m.x, m.y)
        grd.addColorStop(0, `rgba(198,255,0,0)`)
        grd.addColorStop(0.6, `rgba(198,255,0,${m.life * 0.18})`)
        grd.addColorStop(1, `rgba(220,255,120,${m.life * 0.9})`)
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(m.x, m.y)
        ctx.strokeStyle = grd
        ctx.lineWidth = m.width
        ctx.lineCap = 'round'
        ctx.stroke()
        /* bright head dot */
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.width * 1.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230,255,180,${m.life * 0.95})`
        ctx.fill()
      }

      /* ── base particles ── */
      pts.forEach(p => {
        p.ox += p.dvx; p.oy += p.dvy
        if (p.ox < 0) p.ox = canvas.width;  if (p.ox > canvas.width)  p.ox = 0
        if (p.oy < 0) p.oy = canvas.height; if (p.oy > canvas.height) p.oy = 0

        const rx = p.x - mouse.x, ry = p.y - mouse.y
        const rd = Math.sqrt(rx * rx + ry * ry)
        if (rd < REPEL && rd > 0) {
          const f = (1 - rd / REPEL) * (1 - rd / REPEL) * FORCE
          p.vx += (rx / rd) * f; p.vy += (ry / rd) * f
        }

        p.vx += (p.ox - p.x) * SPRING; p.vy += (p.oy - p.y) * SPRING
        p.vx *= DAMP; p.vy *= DAMP
        p.x  += p.vx; p.y  += p.vy

        const gd = Math.sqrt((mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2)
        const g  = gd < 160 ? (1 - gd / 160) : 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + g * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(198,255,0,${Math.min(p.op + g * 0.55, 0.9)})`
        ctx.fill()
      })

      /* constellation lines */
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(198,255,0,${(1 - d / 110) * 0.08})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      /* ── hover sparks ── */
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx; s.y += s.vy
        s.vx *= 0.94; s.vy *= 0.94
        s.life -= s.decay
        if (s.life <= 0) { sparks.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(198,255,0,${s.life * 0.75})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  /* ─ Split-text char animation ─ */
  useEffect(() => {
    if (!name1Ref.current || !name2Ref.current) return

    /* SplitType only the plain text nodes — not nested spans */
    const split1 = new SplitType(name1Ref.current, { types: 'chars' })
    const split2 = new SplitType(name2Ref.current, { types: 'chars' })

    const tl = gsap.timeline({ delay: 0.1 })

    tl.fromTo(badgeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    if (split1.chars?.length) {
      tl.fromTo(split1.chars,
        { opacity: 0, yPercent: 120 },
        { opacity: 1, yPercent: 0, stagger: 0.04, duration: 0.8, ease: 'power4.out' },
        '-=0.3'
      )
    }
    if (split2.chars?.length) {
      tl.fromTo(split2.chars,
        { opacity: 0, yPercent: 120 },
        { opacity: 1, yPercent: 0, stagger: 0.04, duration: 0.8, ease: 'power4.out' },
        '-=0.65'
      )
    }
    tl.fromTo(midRef.current,   { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    tl.fromTo(metaRef.current,  { opacity: 0 },         { opacity: 1, duration: 0.6, ease: 'power3.out' },       '-=0.5')
    tl.fromTo(scrollRef.current,{ opacity: 0 },         { opacity: 1, duration: 0.5 },                           '-=0.3')

    return () => { split1.revert(); split2.revert() }
  }, [])

  /* ─ Role cycle ─ */
  useEffect(() => {
    let idx = 0
    const cycle = setInterval(() => {
      idx = (idx + 1) % roles.length
      const el = roleRef.current
      if (!el) return
      gsap.to(el, {
        opacity: 0, y: -14, duration: 0.28, ease: 'power2.in',
        onComplete: () => {
          if (!roleRef.current) return
          roleRef.current.textContent = roles[idx]
          gsap.fromTo(roleRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' })
        }
      })
    }, 2400)
    return () => clearInterval(cycle)
  }, [])

  /* ─ Name parallax on scroll ─ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-name', {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true }
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-grain" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-year-bg" aria-hidden>2025</div>

      <div className="hero-full">
        <div ref={badgeRef} className="hero-badge" style={{ opacity: 0 }}>
          <span className="hero-badge-dot" />
          Available for opportunities
        </div>

        <div className="hero-headline">
          <div className="hero-headline-row">
            {/* Plain text only — SplitType safe */}
            <h1 ref={name1Ref} className="hero-name">HARI</h1>
          </div>
          <div className="hero-headline-row hero-headline-row-b">
            {/* Outline text — split separately from the accent dot */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <h1 ref={name2Ref} className="hero-name hero-name-outline">SANKAR</h1>
              <span className="hero-name hero-name-accent" style={{ lineHeight: 0.88, letterSpacing: '-0.055em', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>.</span>
            </div>
          </div>
        </div>

        <div ref={midRef} className="hero-mid" style={{ opacity: 0 }}>
          <div className="hero-mid-left">
            <p className="hero-role-line">
              <span className="hero-role-label">Currently working as</span>
              <span ref={roleRef} className="hero-role-val">{roles[0]}</span>
            </p>
            <p className="hero-desc">
              Crafting digital experiences at the intersection of <strong>clean engineering</strong> and <strong>bold, purposeful design</strong>. Front to back.
            </p>
          </div>
          <div className="hero-mid-right">
            <a href="#projects" className="btn-primary magnetic"
              onClick={e => { e.preventDefault(); window.lenis?.scrollTo(document.getElementById('projects'), { duration: 1.4 }) }}>
              View Work
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2.5 7.5h10M7.5 3L12 7.5 7.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/Harisankar_M.pdf" className="btn-ghost magnetic" download="Harisankar_M.pdf">
              Download CV
            </a>
          </div>
        </div>

        <div ref={metaRef} className="hero-meta" style={{ opacity: 0 }}>
          {[['Degree','B.Tech CSE'],['CGPA','9.26 / 10'],['Based in','Kerala, India'],['Projects','3 Featured'],['Stack','20+ Tech']].map(([l,v]) => (
            <div key={l} className="hero-meta-item">
              <span className="hero-meta-label">{l}</span>
              <span className="hero-meta-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="hero-scroll-wrap" style={{ opacity: 0 }}>
        <div className="hero-scroll-inner">
          <div className="hero-scroll-line" />
          <span className="hero-scroll-text">Scroll</span>
        </div>
      </div>
    </section>
  )
}
