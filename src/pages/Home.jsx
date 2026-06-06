import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'
import GalaxySection from '../sections/GalaxySection'
import ProjectsGrid from '../sections/ProjectsGrid'
import Contact from '../sections/Contact'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'

/* Ticker between hero and about */
const tickerItems = [
  'Web Development','UI/UX Design','Full Stack','React & Vue',
  'Node.js','Python & Django','AI / ML','MongoDB','Firebase',
  'AWS','Figma','TypeScript',
]

function Ticker() {
  const doubled = [...tickerItems, ...tickerItems]
  return (
    <div className="ticker">
      <div className="ticker-track">
        {[0, 1].map(k => (
          <div key={k} className="ticker-item" aria-hidden={k === 1}>
            {tickerItems.map((item, i) => (
              <span key={item + i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5rem' }}>
                {item}
                <span className="ticker-sep" aria-hidden="true">
                  <svg width="4" height="4" viewBox="0 0 4 4"><circle cx="2" cy="2" r="2" fill="currentColor"/></svg>
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Hero />
      <Ticker />
      <About />
      <Skills />
      <GalaxySection />
      <ProjectsGrid />
      <Contact />
      <Footer />
    </motion.div>
  )
}
