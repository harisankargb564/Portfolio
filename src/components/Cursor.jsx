import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const ring = useRef(null)
  const dot  = useRef(null)
  const text = useRef(null)
  let mx = 0, my = 0, rx = 0, ry = 0

  useEffect(() => {
    const onMove = (e) => { mx = e.clientX; my = e.clientY }
    document.addEventListener('mousemove', onMove)

    const tick = () => {
      rx += (mx - rx) * 0.1
      ry += (my - ry) * 0.1
      if (ring.current) gsap.set(ring.current, { x: rx, y: ry })
      if (dot.current)  gsap.set(dot.current,  { x: mx, y: my })
    }
    gsap.ticker.add(tick)

    const setState = (state) => {
      if (!ring.current || !text.current) return
      ring.current.className = `cursor-ring${state ? ' ' + state : ''}`
      text.current.textContent = state === 'view' ? 'VIEW' : state === 'drag' ? 'DRAG' : ''
    }

    const onMoveCursor = (e) => {
      if (document.body.dataset?.drag === 'true') { setState('drag'); return }
      const t = e.target
      if (!t) { setState(''); return }
      if (t.closest('[data-cursor="view"]')) setState('view')
      else if (t.closest('a, button, .magnetic, .skill-pill, .stat-card, .service-card')) setState('hover')
      else if (t.closest('p, .body-copy, .hero-desc')) setState('text')
      else setState('')
    }
    document.addEventListener('mousemove', onMoveCursor)
    document.addEventListener('mouseleave', () => ring.current?.classList.add('hidden'))
    document.addEventListener('mouseenter', () => ring.current?.classList.remove('hidden'))

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousemove', onMoveCursor)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor-ring">
        <span ref={text} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </>
  )
}
