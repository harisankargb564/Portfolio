import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/projects'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)


export default function ProjectDetail() {
  const { slug } = useParams()
  const project  = projects.find(p => p.slug === slug)

  useEffect(() => {
    if (!project) return

    gsap.from('.pd-back',      { opacity: 0, x: -20, duration: 0.6, ease: 'power3.out', delay: 0.1 })
    gsap.from('.pd-category',  { opacity: 0, y: 20,  duration: 0.6, ease: 'power3.out', delay: 0.2 })
    gsap.from('.pd-name',      { opacity: 0, y: 60,  duration: 0.9, ease: 'power4.out', delay: 0.25 })
    gsap.from('.pd-meta-item', { opacity: 0, y: 30, stagger: 0.08, duration: 0.65, ease: 'power3.out', delay: 0.5 })

    document.querySelectorAll('.pd-reveal').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        opacity: 0, y: 50, duration: 0.85, ease: 'power3.out'
      })
    })

    ScrollTrigger.create({
      trigger: '.pd-features-grid', start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to('.pd-feature-card', { opacity: 1, y: 0, stagger: 0.08, duration: 0.75, ease: 'power3.out' })
      }
    })

    ScrollTrigger.create({
      trigger: '.pd-stack-grid', start: 'top 88%', once: true,
      onEnter: () => {
        gsap.from('.pd-stack-chip', { opacity: 0, scale: 0.85, stagger: 0.06, duration: 0.55, ease: 'back.out(1.5)' })
      }
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [project, slug])

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: '2rem' }}>Project not found</h2>
        <Link to="/" className="btn-primary">← Go Home</Link>
      </div>
    )
  }

  const others = projects.filter(p => p.slug !== slug)

  return (
    <motion.div
      className="project-detail"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* HERO */}
      <div className="pd-hero">
        <div className="pd-hero-bg" style={{
          background: `radial-gradient(ellipse at 65% -10%, ${project.accent}14, transparent 55%),
                       radial-gradient(ellipse at 20% 80%, ${project.accent}08, transparent 50%)`
        }} />
        <div className="pd-hero-grain" />
        <div className="pd-hero-content">
          <Link to="/" className="pd-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7.5 3.5L3 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All Projects
          </Link>
          <div className="pd-category" style={{ color: project.accent }}>{project.category} · {project.year}</div>
          <h1 className="pd-name">{project.name}</h1>
          <div className="pd-meta-row">
            {[['Role', project.role], ['Client', project.client], ['Year', project.year], ['Category', project.category]].map(([label, val]) => (
              <div key={label} className="pd-meta-item">
                <span className="pd-meta-label">{label}</span>
                <span className="pd-meta-val">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="pd-section pd-reveal">
        <div className="pd-overview-grid">
          <div>
            <span className="eyebrow">Overview</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: 0 }}>The Project</h2>
          </div>
          <p className="pd-overview-text">{project.overview}</p>
        </div>
      </div>

      {/* SCREENSHOT */}
      <div className="pd-section pd-reveal">
        <span className="eyebrow">Preview</span>
        <h2 className="section-title">Project <em>Showcase</em></h2>
        <div className="pd-screenshot">
          <div className="pd-screenshot-bar">
            <span className="pd-screenshot-dot" />
            <span className="pd-screenshot-dot" />
            <span className="pd-screenshot-dot" />
            <div className="pd-screenshot-url">
              {project.slug === 'tastyworld' && 'tastyworld-hotel.vercel.app'}
              {project.slug === 'clickart' && 'clickart-shop.vercel.app'}
              {project.slug === 'depression-detection' && 'depressiondetect.ai'}
            </div>
          </div>
          <img src={project.image} alt={`${project.name} screenshot`} />
        </div>
      </div>

      {/* TECH STACK */}
      <div className="pd-section pd-reveal">
        <span className="eyebrow">Built With</span>
        <h2 className="section-title">Technology <em>Stack</em></h2>
        <div className="pd-stack-grid">
          {project.stack.map(tech => (
            <div key={tech} className="pd-stack-chip">
              <span className="pd-stack-dot" style={{ background: project.accent }} />
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="pd-section pd-reveal">
        <span className="eyebrow">Capabilities</span>
        <h2 className="section-title">Key <em>Features</em></h2>
        <div className="pd-features-grid">
          {project.features.map((f, i) => (
            <div key={f.title} className="pd-feature-card" style={{ opacity: 0, transform: 'translateY(30px)' }}>
              <div className="pd-feature-icon" style={{ background: project.accent + '15', borderColor: project.accent + '30' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.85rem', color: project.accent, letterSpacing: '-0.02em' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="pd-feature-title">{f.title}</div>
              <div className="pd-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CHALLENGE & SOLUTION */}
      <div className="pd-section pd-reveal">
        <span className="eyebrow">Behind the Build</span>
        <h2 className="section-title">Challenge & <em>Solution</em></h2>
        <div className="pd-cs-grid">
          <div>
            <div className="pd-cs-label" style={{ color: project.accent }}>The Challenge</div>
            <p className="pd-cs-text">{project.challenge}</p>
          </div>
          <div>
            <div className="pd-cs-label" style={{ color: project.accent }}>The Solution</div>
            <p className="pd-cs-text">{project.solution}</p>
          </div>
        </div>
      </div>

      {/* MORE PROJECTS */}
      <div className="pd-section pd-reveal">
        <span className="eyebrow">Keep Exploring</span>
        <h2 className="section-title">More <em>Projects</em></h2>
        <div className="pd-more-grid">
          {others.map(p => (
            <Link key={p.id} to={`/project/${p.slug}`} style={{ display: 'block' }}>
              <div className="pd-more-card">
                <div style={{ overflow: 'hidden', borderRadius: '12px', marginBottom: '1.5rem', aspectRatio: '16/9' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', display: 'block' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>
                <div className="pd-more-num">{p.num}</div>
                <div className="pd-more-name">{p.name}</div>
                <div className="pd-more-cat">{p.category}</div>
                <div className="pd-more-arrow">
                  View Project
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7.5 2.5L12 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}
