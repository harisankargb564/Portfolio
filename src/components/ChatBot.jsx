import { useState, useRef, useEffect, useCallback } from 'react'
import { playIntro } from '../utils/warpIntro'
import { showThemeToast } from '../utils/themeToast'

const SYSTEM_PROMPT = `You are the AI assistant on Harisankar M's portfolio. Answer in plain text only — no markdown, no bullet symbols, no asterisks, no headers. For simple questions give short compact replies. For content requests like essays or detailed explanations, fulfill them completely without cutting short. Be formal and helpful. At the very end, add one casual sarcastic remark in parentheses — short, light, not rude.

Harisankar M — Full Stack Developer & AI Engineer, Kerala, India. B.Tech CSE 2021-2025, CGPA 9.26/10. Skills: React, Node.js, Python, MongoDB, MySQL, TailwindCSS, PHP, AI/ML, OpenCV, NLP. Projects: TastyWorld (food delivery, UK client, React+Node+Stripe), ClickArt (AI eCommerce, PHP+Gemini AI), Depression Detection (CNN+LSTM multimodal AI). Email: harisankarm564@gmail.com. LinkedIn: linkedin.com/in/harisankarm/. GitHub: github.com/harihari564.`

function TypingDots() {
  return (
    <span className="cb-typing">
      <span /><span /><span />
    </span>
  )
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function ChatBot() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm Hari's AI. Ask me about his work, skills, projects — or literally anything else." }
  ])
  const [input, setInput]       = useState('')
  const [streaming, setStreaming] = useState(false)
  const [touring, setTouring]   = useState(false)
  const msgsRef  = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const tourRef  = useRef(false)

  const scrollToBottom = useCallback(() => {
    if (!msgsRef.current) return
    msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streaming, scrollToBottom])

  /* pause Lenis while mouse is inside the chatbot panel so scroll stays local */
  useEffect(() => {
    const panel = document.querySelector('.cb-panel')
    if (!panel) return
    const pause  = () => window.lenis?.stop()
    const resume = () => window.lenis?.start()
    panel.addEventListener('mouseenter', pause)
    panel.addEventListener('mouseleave', resume)
    return () => {
      panel.removeEventListener('mouseenter', pause)
      panel.removeEventListener('mouseleave', resume)
      window.lenis?.start()
    }
  }, [])

  /* smooth-scroll the page to a section (works even when Lenis is paused) */
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    if (window.lenis) {
      window.lenis.start()
      window.lenis.scrollTo(el, {
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  /* guided tour — walks the page section by section with narration */
  const TOUR = [
    { id: 'hero',     text: "Welcome aboard. This is Harisankar M — Full Stack Developer & AI Engineer. Buckle up, quick tour incoming." },
    { id: 'about',    text: "About section. CGPA 9.26, real international client work, and yes — that 3D Earth on the right was hand-built." },
    { id: 'skills',   text: "Skills. 35+ technologies across the full stack, from pixel to pipeline." },
    { id: 'projects', text: "Projects. TastyWorld, ClickArt, and a multimodal depression-detection AI. Actual shipped work, not toy demos." },
    { id: 'contact',  text: "And the Contact section — this is where you reach out. (Go on, his inbox doesn't bite.)" },
  ]

  const runTour = async () => {
    if (tourRef.current || streaming) return
    tourRef.current = true
    setTouring(true)
    try {
      // cinematic intro (space warp in dark mode, cloud ascent in light), landing on the hero
      window.lenis?.stop()
      await playIntro()
      window.lenis?.start()
      await new Promise(r => setTimeout(r, 400))   // settle on landing page

      for (const stop of TOUR) {
        if (!tourRef.current) break
        setMessages(prev => [...prev, { role: 'assistant', content: stop.text }])
        scrollToSection(stop.id)
        await new Promise(r => setTimeout(r, 2800))
      }
      if (tourRef.current) {
        setMessages(prev => [...prev, { role: 'assistant', content: "That's the grand tour. Ask me anything else — I'm not going anywhere. (Where would I even go?)" }])
        setOpen(false)          // close the panel so it doesn't overlap the toast
        showThemeToast()
      }
    } finally {
      tourRef.current = false
      setTouring(false)
    }
  }

  const suggestions = [
    { label: 'Give me a tour', icon: '🧭', action: runTour },
    { label: 'About Boss',     icon: '👤', action: () => scrollToSection('about') },
    { label: 'Contact Him',    icon: '✉️', action: () => scrollToSection('contact') },
  ]

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setStreaming(true)

    const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history]

    // In production the key lives only in the Vercel function (/api/chat).
    // For local `npm run dev` (no serverless runtime) fall back to calling
    // Cerebras directly with the key from .env — dev only, never deployed.
    const devKey = import.meta.env.DEV ? import.meta.env.VITE_CEREBRAS_API_KEY : null

    const doRequest = async (attempt = 0) => {
      abortRef.current = new AbortController()

      const res = devKey
        ? await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            signal: abortRef.current.signal,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${devKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-oss-120b',
              messages,
              max_tokens: 2048,
              temperature: 0.5,
              stream: true,
            }),
          })
        : await fetch('/api/chat', {
            method: 'POST',
            signal: abortRef.current.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
          })

      if (res.status === 429 && attempt < 3) {
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
        return doRequest(attempt + 1)
      }

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`${res.status}: ${body}`)
      }

      // add empty assistant message then stream into it
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            const delta  = parsed.choices?.[0]?.delta?.content
            if (!delta) continue

            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'assistant',
                content: updated[updated.length - 1].content + delta,
              }
              return updated
            })
            scrollToBottom()
          } catch {
            // malformed chunk — skip
          }
        }
      }
    }

    try {
      await doRequest()
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('ChatBot error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Cerebras is busy right now. Please try again in a moment.' }])
    } finally {
      setStreaming(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Panel */}
      <div className={`cb-panel${open ? ' cb-panel--open' : ''}`} aria-hidden={!open}>
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-avatar">
              <span>H</span>
              <span className="cb-avatar-ring" />
            </div>
            <div className="cb-header-text">
              <div className="cb-name">Hari's Assistant</div>
              <div className="cb-status"><span className="cb-dot" />Online</div>
            </div>
          </div>
          <button className="cb-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="cb-messages" ref={msgsRef} data-lenis-prevent>
          {messages.map((m, i) => (
            <div key={i} className={`cb-msg cb-msg--${m.role}`}>
              {m.role === 'assistant' && <div className="cb-msg-label">AI</div>}
              <div className="cb-msg-bubble">
                {m.content || (i === messages.length - 1 && streaming ? <TypingDots /> : null)}
              </div>
            </div>
          ))}
        </div>

        {/* Quick-action suggestion chips */}
        <div className="cb-suggestions">
          {suggestions.map(s => (
            <button
              key={s.label}
              className="cb-chip"
              onClick={s.action}
              disabled={streaming || touring}
            >
              <span className="cb-chip-icon">{s.icon}</span>{s.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="cb-input-area">
          <textarea
            ref={inputRef}
            className="cb-input"
            placeholder="Ask anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={streaming}
          />
          <button
            className="cb-send-btn"
            onClick={send}
            disabled={streaming || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        className={`cb-fab${open ? ' cb-fab--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <span className="cb-fab-ring" />
        <span className="cb-fab-inner">
          {open ? <CloseIcon /> : <ChatIcon />}
        </span>
      </button>
    </>
  )
}
