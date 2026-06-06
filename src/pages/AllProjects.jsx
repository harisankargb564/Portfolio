import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/projects'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)

function ProjectCard({ project, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    ScrollTrigger.create({
      trigger: cardRef.current, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.fromTo(cardRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.75, delay: (index % 3) * 0.08, ease: 'power3.out' }
        )
      }
    })

    const card = cardRef.current
    const onMove = (e) => {
      const r = card.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      gsap.to(card, {
        rotateX: (dy / (r.height / 2)) * -3,
        rotateY: (dx / (r.width / 2)) * 3,
        transformPerspective: 1200, duration: 0.4, ease: 'power1.out'
      })
    }
    const onOut = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' })
    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onOut)
    return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onOut) }
  }, [index])

  return (
    <Link to={`/project/${project.slug}`} style={{ display: 'block' }}>
      <article
        ref={cardRef}
        className="ap-card"
        style={{ opacity: 0, '--accent': project.accent }}
      >
        <div className="ap-card-img">
          <img src={project.image} alt={project.name} loading="lazy" />
          <div className="ap-card-num">{project.num}</div>
          {project.featured && <div className="ap-card-badge">Featured</div>}
        </div>
        <div className="ap-card-body">
          <div className="ap-card-cat">{project.category} · {project.year}</div>
          <h3 className="ap-card-name">{project.name}</h3>
          <p className="ap-card-tagline">{project.tagline}</p>
          <div className="ap-card-stack">
            {project.stack.slice(0, 3).map(t => <span key={t} className="stack-tag">{t}</span>)}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function AllProjects() {
  const headRef = useRef(null)

  useEffect(() => {
    gsap.from(headRef.current.querySelectorAll('.reveal-item'), {
      opacity: 0, y: 50, stagger: 0.1, duration: 0.85, ease: 'power3.out', delay: 0.2
    })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ minHeight: '100vh' }}
    >
      {/* HERO */}
      <div className="ap-hero">
        <div className="ap-hero-bg" />
        <div className="container ap-hero-content" ref={headRef}>
          <Link to="/" className="pd-back reveal-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7.5 3.5L3 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back Home
          </Link>
          <span className="eyebrow reveal-item">All Work</span>
          <h1 className="section-title reveal-item" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
            {projects.length}+ Projects <em>Built</em>
          </h1>
          <p className="body-copy reveal-item" style={{ maxWidth: '560px' }}>
            From AI systems and full-stack platforms to UI experiments and open-source tools — everything I've shipped.
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="container ap-grid-wrap">
        <div className="ap-grid">
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}
