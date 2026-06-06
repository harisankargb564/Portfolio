import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const LETTERS = ['H','A','R','I','S','A','N','K','A','R']

export default function Loader({ onComplete }) {
  const loaderRef  = useRef(null)
  const fillRef    = useRef(null)
  const countRef   = useRef(null)
  const letterRefs = useRef([])

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = ''
        onComplete?.()
      }
    })

    /* Count 0→100 */
    gsap.to({ n: 0 }, {
      n: 100, duration: 2.4, ease: 'power2.inOut',
      onUpdate() {
        if (countRef.current) countRef.current.textContent = `${Math.round(this.targets()[0].n)}%`
      }
    })

    tl.to(fillRef.current, { width: '100%', duration: 2.4, ease: 'power2.inOut' })
      .from(letterRefs.current, {
        y: '110%', opacity: 0,
        stagger: 0.06, duration: 0.6, ease: 'back.out(1.8)'
      }, 0.1)
      .to(letterRefs.current, {
        y: '-110%', opacity: 0,
        stagger: 0.04, duration: 0.4, ease: 'power2.in'
      }, 2.5)
      .to(loaderRef.current, {
        clipPath: 'inset(0 0 100% 0)', duration: 0.75, ease: 'power4.inOut'
      }, 3.0)

    return () => { tl.kill(); gsap.killTweensOf(fillRef.current) }
  }, [])

  return (
    <div ref={loaderRef} className="loader" style={{ clipPath: 'inset(0 0 0% 0)' }}>
      <div className="loader-letters">
        {LETTERS.map((l, i) => (
          <span
            key={i}
            ref={el => letterRefs.current[i] = el}
            className="loader-letter"
            style={{ transform: 'translateY(110%)', opacity: 0 }}
          >{l}</span>
        ))}
      </div>
      <div className="loader-progress-wrap">
        <div ref={fillRef} className="loader-progress-bar" />
      </div>
      <span ref={countRef} className="loader-pct">0%</span>
    </div>
  )
}
