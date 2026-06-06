import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import Loader from './components/Loader'
import Navbar from './components/Navbar'
import ChatBot from './components/ChatBot'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import AllProjects from './pages/AllProjects'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function ScrollProgress() {
  const barRef = useRef(null)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0 || !barRef.current) return
      gsap.set(barRef.current, { scaleX: window.scrollY / max })
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <div ref={barRef} className="scroll-progress" />
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const location = useLocation()
  const lenisTickerFn = useRef(null)

  /* Lenis driven by GSAP ticker — proper cleanup with stored reference */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.07, smoothWheel: true })
    window.lenis = lenis

    lenisTickerFn.current = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(lenisTickerFn.current)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', () => ScrollTrigger.update())

    return () => {
      if (lenisTickerFn.current) gsap.ticker.remove(lenisTickerFn.current)
      lenis.destroy()
      window.lenis = null
    }
  }, [])

  /* Kill all triggers + scroll to top on route change */
  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill())
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [location.pathname])

  /* Magnetic buttons */
  useEffect(() => {
    if (!loaded) return
    const attach = () => {
      document.querySelectorAll('.magnetic').forEach(el => {
        if (el._mag) return
        el._mag = true
        const onMove = (e) => {
          const r = el.getBoundingClientRect()
          gsap.to(el, {
            x: (e.clientX - (r.left + r.width / 2)) * 0.3,
            y: (e.clientY - (r.top + r.height / 2)) * 0.3,
            duration: 0.4, ease: 'power2.out'
          })
        }
        const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.55)' })
        el.addEventListener('mousemove', onMove)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    attach()
    const ob = new MutationObserver(attach)
    ob.observe(document.body, { childList: true, subtree: true })
    return () => ob.disconnect()
  }, [loaded, location.pathname])

  return (
    <>
      <ScrollProgress />
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      {loaded && (
        <>
          <Navbar visible={loaded} />
          <ChatBot />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<AllProjects />} />
              <Route path="/project/:slug" element={<ProjectDetail />} />
            </Routes>
          </AnimatePresence>
        </>
      )}
    </>
  )
}
