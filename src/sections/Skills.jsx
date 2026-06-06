import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

/* Official brand colors — chosen for visibility on dark bg */
const row1 = [
  { name: 'React',        slug: 'react',             hex: '61DAFB' },
  { name: 'Vue.js',       slug: 'vuedotjs',          hex: '4FC08D' },
  { name: 'Node.js',      slug: 'nodedotjs',         hex: '6DA55F' },
  { name: 'TypeScript',   slug: 'typescript',        hex: '3178C6' },
  { name: 'Python',       slug: 'python',            hex: 'FFD43B' },
  { name: 'Django',       slug: 'django',            hex: '44B78B' },
  { name: 'FastAPI',      slug: 'fastapi',           hex: '059669' },
  { name: 'MongoDB',      slug: 'mongodb',           hex: '47A248' },
  { name: 'Firebase',     slug: 'firebase',          hex: 'FFCA28' },
  { name: 'AWS',          slug: 'amazonwebservices', hex: 'FF9900' },
  { name: 'Tailwind CSS', slug: 'tailwindcss',       hex: '38BDF8' },
  { name: 'Figma',        slug: 'figma',             hex: 'F24E1E' },
]
const row2 = [
  { name: 'JavaScript',   slug: 'javascript',        hex: 'F7DF1E' },
  { name: 'HTML5',        slug: 'html5',             hex: 'E34F26' },
  { name: 'CSS3',         slug: 'css3',              hex: '264DE4' },
  { name: 'Java',         slug: 'coffeescript',      hex: 'F89820' },
  { name: 'PHP',          slug: 'php',               hex: '8993BE' },
  { name: 'Power BI',     slug: 'powerbi',           hex: 'F2C811' },
  { name: 'Docker',       slug: 'docker',            hex: '2496ED' },
  { name: 'Git',          slug: 'git',               hex: 'F05032' },
  { name: 'Vercel',       slug: 'vercel',            hex: 'ffffff' },
  { name: 'Adobe XD',     slug: 'adobexd',           hex: 'FF61F6' },
  { name: 'MySQL',        slug: 'mysql',             hex: '4479A1' },
  { name: 'npm',          slug: 'npm',               hex: 'CB3837' },
]
const row3 = [
  { name: 'PostgreSQL',   slug: 'postgresql',        hex: '4169E1' },
  { name: 'Oracle DB',    slug: 'oracle',            hex: 'F80000' },
  { name: 'Elasticsearch',slug: 'elasticsearch',     hex: '00BFB3' },
  { name: 'MS Azure',     slug: 'microsoftazure',    hex: '0078D4' },
  { name: 'Vite',         slug: 'vite',              hex: '646CFF' },
  { name: 'Pandas',       slug: 'pandas',            hex: 'E70488' },
  { name: 'Playwright',   slug: 'playwright',        hex: '2EAD33' },
  { name: 'Framer Motion',slug: 'framer',            hex: '0055FF' },
  { name: 'LangChain',    slug: 'langchain',         hex: '1C3C3C' },
  { name: 'JWT Auth',     slug: 'jsonwebtokens',     hex: 'FB015B' },
  { name: 'SQLAlchemy',   slug: 'sqlalchemy',        hex: 'D71F00' },
  { name: 'Zustand',      slug: 'zustand',           hex: '443E38' },
]

function SkillCard({ name, slug, hex }) {
  return (
    <div className="skill-card" style={{ '--brand': `#${hex}` }}>
      <div className="skill-card-logo-wrap">
        <img
          src={`https://cdn.simpleicons.org/${slug}/${hex}`}
          alt={name}
          className="skill-card-logo"
          width="26"
          height="26"
          loading="lazy"
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>
      <span className="skill-card-name">{name}</span>
    </div>
  )
}

function MarqueeRow({ items, reverse, speed }) {
  return (
    <div className={`marquee-row${reverse ? ' marquee-rev' : ''}`} style={{ '--speed': `${speed}s` }}>
      {[0, 1].map(k => (
        <div key={k} className="marquee-inner" aria-hidden={k === 1}>
          {items.map(skill => <SkillCard key={skill.name} {...skill} />)}
        </div>
      ))}
    </div>
  )
}

export default function Skills() {
  const headerRef = useRef(null)
  const titleRef  = useRef(null)

  useEffect(() => {
    if (!headerRef.current) return

    gsap.from(headerRef.current.querySelectorAll('.reveal-item'), {
      scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true },
      opacity: 0, y: 40, stagger: 0.1, duration: 0.8, ease: 'power3.out'
    })

    if (titleRef.current) {
      const split = new SplitType(titleRef.current, { types: 'words' })
      ScrollTrigger.create({
        trigger: titleRef.current, start: 'top 85%', once: true,
        onEnter: () => gsap.from(split.words, {
          opacity: 0, y: 40, stagger: 0.06, duration: 0.8, ease: 'power3.out'
        })
      })
      return () => split.revert()
    }
  }, [])

  return (
    <section id="skills" className="skills">
      <div ref={headerRef} className="skills-header">
        <span className="eyebrow reveal-item">Tech Stack</span>
        <h2 ref={titleRef} className="section-title reveal-item">
          Technologies I <em>work with</em>
        </h2>
        <p className="body-copy reveal-item" style={{ maxWidth: '520px', marginTop: '0.5rem' }}>
          35+ tools and technologies across the full stack — from pixel to pipeline.
        </p>
      </div>
      <div className="marquee-section">
        <MarqueeRow items={row1} reverse={false} speed={30} />
        <MarqueeRow items={row2} reverse={true}  speed={25} />
        <MarqueeRow items={row3} reverse={false} speed={35} />
      </div>
    </section>
  )
}
