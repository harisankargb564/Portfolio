import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'

function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'dark'
  )
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('hari-theme', next)
    setTheme(next)
  }
  // stay in sync when the theme is changed elsewhere (e.g. the post-tour toast)
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme || 'dark')
    window.addEventListener('themechange', sync)
    return () => window.removeEventListener('themechange', sync)
  }, [])
  return [theme, toggle]
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

const links = [
  { label: 'About',   href: '#about'   },
  { label: 'Skills',  href: '#skills'  },
  { label: 'Work',    href: '#projects'},
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ visible = true }) {
  const [scrolled,  setScrolled ] = useState(false)
  const [menuOpen,  setMenuOpen ] = useState(false)
  const [theme, toggleTheme] = useTheme()
  const navRef   = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome   = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!visible) return
    gsap.fromTo(navRef.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 }
    )
  }, [visible])

  const scrollToSection = (selector) => {
    const el = document.querySelector(selector)
    if (!el) return
    if (window.lenis) {
      window.lenis.scrollTo(el, { duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLink = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    if (!isHome) {
      navigate('/')
      setTimeout(() => scrollToSection(href), 500)
    } else {
      scrollToSection(href)
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        style={{ opacity: 0 }}
      >
        <Link to="/" className="nav-logo">HM<span className="nav-logo-dot">.</span></Link>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href} className="nav-link" onClick={e => handleLink(e, l.href)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="mailto:harisankarm564@gmail.com" className="nav-cta magnetic">
            Let's Talk
          </a>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="mobile-menu-links">
              {links.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 + 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a href={l.href} className="mobile-menu-link" onClick={e => handleLink(e, l.href)}>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
