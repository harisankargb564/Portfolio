import { playIntro } from '../utils/warpIntro'
import { showThemeToast } from '../utils/themeToast'

export default function Footer() {
  const handleBackToTop = async (e) => {
    e.preventDefault()
    // cinematic ride back up to the landing page — space warp in dark mode,
    // cloud ascent in light mode (jumps to the top while hidden, then reveals)
    window.lenis?.stop()
    await playIntro()
    window.lenis?.start()
    showThemeToast()
  }

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-copy">© 2025 Harisankar M — Designed & built with passion</span>
        <a
          href="#hero"
          className="footer-back magnetic"
          onClick={handleBackToTop}
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
