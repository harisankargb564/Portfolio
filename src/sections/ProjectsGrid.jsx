import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import { projects } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectsGrid() {
  const sectionRef = useRef(null)
  const trackRef   = useRef(null)
  const headRef    = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    if (!section || !track) return

    /* Heading reveal */
    let splitCleanup = null
    if (headRef.current) {
      const split = new SplitType(headRef.current, { types: 'words' })
      gsap.from(split.words, {
        scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true },
        opacity: 0, y: 50, stagger: 0.08, duration: 0.8, ease: 'power3.out'
      })
      splitCleanup = () => split.revert()
    }

    /* Double-rAF so paint is done before measuring scrollWidth */
    let st
    const setup = () => {
      requestAnimationFrame(() => {
        const totalScroll = track.scrollWidth - window.innerWidth
        if (totalScroll <= 0) return

        st = gsap.to(track, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${totalScroll}`,
            pin: true,
            pinSpacing: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: self => {
              document.body.dataset.drag = self.isActive ? 'true' : 'false'
            }
          }
        })

        ScrollTrigger.refresh()
      })
    }

    requestAnimationFrame(setup)

    return () => {
      st?.scrollTrigger?.kill()
      splitCleanup?.()
      document.body.dataset.drag = 'false'
    }
  }, [])

  return (
    <>
      {/* Heading outside the pin */}
      <div className="projects-head-wrap">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="eyebrow">Selected Work</span>
              <h2 ref={headRef} className="section-title" style={{ marginTop: '0.5rem' }}>
                Projects that <em>matter</em>
              </h2>
            </div>
            <div className="projects-drag-hint">
              <span>Scroll to explore</span>
              <svg width="36" height="14" viewBox="0 0 36 14" fill="none">
                <path d="M1 7h34M28 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned horizontal track */}
      <section id="projects" className="h-section" ref={sectionRef}>
        <div className="h-track" ref={trackRef}>

          {projects.map((project) => (
            <Link key={project.id} to={`/project/${project.slug}`} className="h-card" data-cursor="view">
              <div className="h-card-img">
                <img src={project.image} alt={project.name} />
              </div>
              <div className="h-card-overlay">
                <div className="h-card-num">{project.num}</div>
                <div className="h-card-info">
                  <div className="h-card-cat">{project.category} · {project.year}</div>
                  <h3 className="h-card-name">{project.name}</h3>
                  <p className="h-card-tagline">{project.tagline}</p>
                  <div className="h-card-stack">
                    {project.stack.slice(0, 4).map(t => <span key={t} className="h-stack-tag">{t}</span>)}
                  </div>
                  <div className="h-card-link">
                    View Case Study
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2h10v10M2 12L12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="h-card-accent-line" style={{ background: project.accent }} />
            </Link>
          ))}

          {/* "Many more" end card */}
          <div className="h-card h-card-more">
            <div className="h-more-inner">
              <span className="eyebrow">Keep going</span>
              <p className="h-more-title">& many<br />more projects</p>
              <p className="h-more-sub">These are just the highlights. There's much more on GitHub.</p>
              <a href="https://github.com/harihari564" target="_blank" rel="noopener" className="btn-primary magnetic">
                See on GitHub
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7.5h10M7.5 3L12 7.5 7.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
