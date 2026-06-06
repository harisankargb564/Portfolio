import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import Globe3D from '../components/Globe3D'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { num: 9.26, suffix: '',  label: 'CGPA / 10',        decimals: 2 },
  { num: 10,   suffix: '+', label: 'Projects Built',    decimals: 0 },
  { num: 35,   suffix: '+', label: 'Technologies',      decimals: 0 },
  { num: 100,  suffix: '%', label: 'Commitment',        decimals: 0 },
]

const ServiceIcon = ({ type }) => {
  if (type === 'stack') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  )
  if (type === 'design') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  )
  if (type === 'ai') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
      <path d="M7 14h.01M12 14h.01M17 14h.01"/>
    </svg>
  )
  if (type === 'responsive') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  )
  return null
}

const services = [
  { type: 'stack',      title: 'Full Stack Dev',  desc: 'End-to-end web applications, DB to pixel-perfect UI.' },
  { type: 'design',     title: 'UI / UX Design',  desc: 'Pixel-perfect, user-first interfaces that convert.' },
  { type: 'ai',         title: 'AI Engineering',  desc: 'Intelligent systems and ML pipelines in real products.' },
  { type: 'responsive', title: 'Responsive Dev',  desc: 'Flawless across every screen from 320px to 4K.' },
]

function StatCard({ num, suffix, label, decimals }) {
  const numRef  = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    ScrollTrigger.create({
      trigger: cardRef.current, start: 'top 88%', once: true,
      onEnter: () => {
        gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        gsap.to({ v: 0 }, {
          v: num, duration: 1.8, ease: 'power2.out',
          onUpdate() {
            const v = this.targets()[0].v
            if (numRef.current)
              numRef.current.textContent = (decimals > 0 ? v.toFixed(decimals) : Math.round(v)) + suffix
          }
        })
      }
    })
  }, [])

  return (
    <div ref={cardRef} className="stat-card" style={{ opacity: 0, transform: 'translateY(20px)' }}>
      <span ref={numRef} className="stat-num">0</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default function About() {
  const sectionRef = useRef(null)
  const titleRef   = useRef(null)
  const eyebrowRef = useRef(null)
  const bodyRefs   = useRef([])

  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current, start: 'top 82%', once: true,
      onEnter: () => gsap.from(eyebrowRef.current, { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' })
    })

    let splitCleanup = null
    if (titleRef.current) {
      const split = new SplitType(titleRef.current, { types: 'lines' })
      split.lines.forEach(l => { l.style.overflow = 'hidden'; l.style.display = 'block' })
      ScrollTrigger.create({
        trigger: titleRef.current, start: 'top 84%', once: true,
        onEnter: () => gsap.from(split.lines, { y: '100%', opacity: 0, stagger: 0.12, duration: 1, ease: 'power4.out' })
      })
      splitCleanup = () => split.revert()
    }

    bodyRefs.current.forEach((el, i) => {
      if (!el) return
      ScrollTrigger.create({
        trigger: el, start: 'top 89%', once: true,
        onEnter: () => gsap.from(el, { opacity: 0, y: 28, duration: 0.7, delay: i * 0.06, ease: 'power3.out' })
      })
    })

    gsap.from('.service-card', {
      scrollTrigger: { trigger: '.services-grid', start: 'top 85%', once: true },
      opacity: 0, y: 40, scale: 0.96, stagger: 0.09, duration: 0.75, ease: 'power3.out'
    })

    return () => splitCleanup?.()
  }, [])

  return (
    <section id="about" className="about" ref={sectionRef}>
      <div className="container">
        <div className="about-grid">

          {/* LEFT */}
          <div className="about-left">
            <span ref={eyebrowRef} className="eyebrow">About Me</span>
            <h2 ref={titleRef} className="section-title" style={{ marginTop: '0.75rem' }}>
              Crafting digital<br />experiences with <em>purpose</em>
            </h2>
            <p className="body-copy" ref={el => bodyRefs.current[0] = el}>
              I'm a Computer Science & Engineering graduate from Kerala, building at the intersection of clean engineering and bold design. Full-stack apps, AI systems, pixel-perfect UIs — I do it all.
            </p>
            <p className="body-copy" ref={el => bodyRefs.current[1] = el}>
              CGPA 9.26 · React, Node.js, Python, AI/ML · Delivered real client work internationally.
            </p>

            {/* Social icon circles */}
            <div className="about-social-row" ref={el => bodyRefs.current[2] = el}>
              <a href="https://linkedin.com/in/harisankarm/" target="_blank" rel="noopener" className="about-social-icon magnetic" title="LinkedIn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="https://github.com/harihari564" target="_blank" rel="noopener" className="about-social-icon magnetic" title="GitHub">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.02-2.68-.1-.25-.44-1.27.1-2.65 0 0 .83-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.3 2.75-1.02 2.75-1.02.54 1.38.2 2.4.1 2.65.63.7 1.02 1.59 1.02 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
                </svg>
              </a>
              <a href="mailto:harisankarm564@gmail.com" className="about-social-icon magnetic" title="Email">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            </div>

            <div className="stats-grid" ref={el => bodyRefs.current[3] = el}>
              {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>
          </div>

          {/* RIGHT */}
          <div className="about-right">
            <div className="services-grid">
              {services.map(s => (
                <div key={s.title} className="service-card">
                  <div className="service-icon">
                    <ServiceIcon type={s.type} />
                  </div>
                  <div className="service-title">{s.title}</div>
                  <div className="service-desc">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="edu-card">
              <div className="edu-card-label">Education</div>
              <div className="edu-card-name">B.Tech Computer Science & Engineering</div>
              <div className="edu-card-detail">2021 – 2025 &nbsp;·&nbsp; Kerala, India &nbsp;·&nbsp; CGPA 9.26 / 10</div>
            </div>
            <div className="about-globe-wrap">
              <Globe3D />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
