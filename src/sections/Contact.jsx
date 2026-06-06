import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'harisankarm564@gmail.com'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@._-'

function scramble(el, final, duration = 800) {
  const totalFrames = Math.ceil(duration / 30)
  let frame = 0
  const id = setInterval(() => {
    el.textContent = final.split('').map((ch, i) =>
      frame / totalFrames > i / final.length ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('')
    frame++
    if (frame > totalFrames) { el.textContent = final; clearInterval(id) }
  }, 30)
  return () => { clearInterval(id); el.textContent = final }
}

export default function Contact() {
  const sectionRef   = useRef(null)
  const titleRef     = useRef(null)
  const emailRef     = useRef(null)
  const emailTextRef = useRef(null)
  const spotRef      = useRef(null)

  const [copied, setCopied] = useState(false)

  /* cursor-following spotlight glow */
  useEffect(() => {
    const section = sectionRef.current
    const spot = spotRef.current
    if (!section || !spot) return
    const onMove = (e) => {
      const r = section.getBoundingClientRect()
      spot.style.setProperty('--mx', (e.clientX - r.left) + 'px')
      spot.style.setProperty('--my', (e.clientY - r.top) + 'px')
      spot.style.opacity = '1'
    }
    const onLeave = () => { spot.style.opacity = '0' }
    section.addEventListener('pointermove', onMove)
    section.addEventListener('pointerleave', onLeave)
    return () => {
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const copyEmail = async (e) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  useEffect(() => {
    let splitCleanup = null
    if (titleRef.current) {
      const split = new SplitType(titleRef.current, { types: 'lines' })
      split.lines.forEach(l => { l.style.overflow = 'hidden'; l.style.display = 'block' })
      splitCleanup = () => split.revert()

      ScrollTrigger.create({
        trigger: sectionRef.current, start: 'top 78%', once: true,
        onEnter: () => {
          gsap.from(split.lines,       { y: '100%', opacity: 0, stagger: 0.1, duration: 1, ease: 'power4.out' })
          gsap.from('.contact-subtext',{ opacity: 0, y: 16, duration: 0.6, delay: 0.35, ease: 'power3.out' })
          gsap.from(emailRef.current,  { opacity: 0, y: 30, duration: 0.8, delay: 0.45, ease: 'power3.out' })
          gsap.from('.contact-cta',    { opacity: 0, y: 25, duration: 0.7, delay: 0.58, ease: 'power3.out' })
          gsap.from('.contact-social', { opacity: 0, y: 20, stagger: 0.07, duration: 0.6, delay: 0.68, ease: 'power3.out' })
          setTimeout(() => {
            if (emailTextRef.current) scramble(emailTextRef.current, EMAIL, 700)
          }, 550)
        }
      })
    }

    const el = emailRef.current
    let cleanup
    const onEnter = () => { cleanup = scramble(emailTextRef.current, EMAIL, 600) }
    const onLeave = () => cleanup?.()
    el?.addEventListener('mouseenter', onEnter)
    el?.addEventListener('mouseleave', onLeave)

    return () => {
      splitCleanup?.()
      el?.removeEventListener('mouseenter', onEnter)
      el?.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <div className="contact-bg" />
      <div ref={spotRef} className="contact-spotlight" />
      <div className="contact-line" />
      <div className="container contact-inner">

        <span className="eyebrow">Get In Touch</span>

        <h2 ref={titleRef} className="contact-headline">
          Let's build something<br /><em>extraordinary</em>
        </h2>

        <p className="contact-subtext body-copy">
          Open to full-time roles, freelance projects, and interesting collaborations.
        </p>

        <div className="contact-email-row">
          <a ref={emailRef} href={`mailto:${EMAIL}`} className="contact-email magnetic">
            <span ref={emailTextRef}>{EMAIL}</span>
            <span style={{ opacity: 0.4, marginLeft: '0.4rem' }}>↗</span>
          </a>
          <button
            type="button"
            className={`contact-copy magnetic${copied ? ' is-copied' : ''}`}
            onClick={copyEmail}
            aria-label="Copy email address"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <div className="contact-cta">
          <a href={`mailto:${EMAIL}`} className="btn-primary magnetic">Send Email</a>
          <a href="https://calendly.com/" className="btn-ghost magnetic" target="_blank" rel="noopener">Book a Call</a>
        </div>

        <div className="contact-socials">
          <a href="https://linkedin.com/in/harisankarm/" target="_blank" rel="noopener" className="contact-social magnetic">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
            </svg>
            LinkedIn
          </a>
          <span className="contact-divider">·</span>
          <a href="https://github.com/harihari564" target="_blank" rel="noopener" className="contact-social magnetic">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.02-2.68-.1-.25-.44-1.27.1-2.65 0 0 .83-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.3 2.75-1.02 2.75-1.02.54 1.38.2 2.4.1 2.65.63.7 1.02 1.59 1.02 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
            </svg>
            GitHub
          </a>
          <span className="contact-divider">·</span>
          <a href="https://www.instagram.com/harisankarrajasree" target="_blank" rel="noopener" className="contact-social magnetic">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            Instagram
          </a>
        </div>

      </div>
    </section>
  )
}
