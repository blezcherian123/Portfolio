import { useEffect, useRef, useState } from 'react'
import './AiAssistant.css'

const WAVE_BARS = [14, 22, 12, 26, 18, 26, 12, 22, 14]

const START_MESSAGE =
  "Hi, I'm Blesson's AI assistant. Ask me about his experience, skills, projects, or how to get in touch with him."

const QUICK_OPTIONS = ['What can you do?', 'Experience', 'Skills', 'Get in touch']

const strip = (raw) => raw.toLowerCase().replace(/[^a-z0-9 ]/g, ' ')

function getBotReply(raw) {
  const t = strip(raw)

  if (!t.trim()) {
    return "I didn't quite catch that. Try asking \"What can you do?\" or tap one of the quick questions below."
  }

  if (/\b(thanks|thank you|thx|awesome|great|nice|cool)\b/.test(t)) {
    return "You're welcome! Anything else you'd like to know about Blesson or his work?"
  }

  if (/\b(who are you|about you|about blesson|introduce|tell me about)\b/.test(t) || t.includes('yourself')) {
    return "Blesson C Biju is an AI Engineer at Adam Finastra in Kozhikode, focused on Generative AI, autonomous agent workflows, and high-performance backend systems. He studied B.Tech in Computer Science at APJ Abdul Kalam Technological University. Ask me about his experience, skills, or projects!"
  }

  if (/\b(experience|work history|career|job|worked|work at|work as|roles|professional)\b/.test(t)) {
    return 'Blesson is currently an AI Engineer at Adam Finastra (Kozhikode), where he builds Generative AI applications, agent workflows, and automation pipelines with Python, Django, FastAPI, Celery, Redis, and PostgreSQL. Earlier, he was a Data Science Intern at Techolas Technologies (Kochi), working on ML models, data pipelines, and dashboards with Python, Pandas, and Tableau.'
  }

  if (/\b(skill|skills|tech|stack|tools|technologies|know|proficient)\b/.test(t)) {
    return "His core stack: Python, PyTorch, TensorFlow, Generative AI, LLMs & RAG, AI Agents, LangChain, OpenCV, and deep learning. On the infrastructure side: FastAPI, Celery & Redis, Docker, AWS & EC2, Django, ChromaDB, and PostgreSQL. You can scroll to the Skills section to see the full marquee."
  }

  if (/\b(project|projects|built|build|portfolio|github|workflow|products)\b/.test(t)) {
    return 'He ships AI products end-to-end: marketing content generation, computer-vision pipelines, RAG systems, and MLOps deployments. Head to the Projects/Workflow sections on this page for a closer look, or ask what stack he prefers.'
  }

  if (/\b(contact|email|reach|hire|connect|collaborate|collab|talk to)\b/.test(t)) {
    return 'You can reach Blesson through the Contact section at the bottom of this page — he is open to collaborations and AI engineering opportunities. Tap the "Get In Touch" link there to get started!'
  }

  if (/\b(resume|cv|certificate|certifications|degree|education|college|university)\b/.test(t)) {
    return 'Blesson holds a B.Tech in Computer Science from APJ Abdul Kalam Technological University (KTU), graduating in 2024 from Mar Baselios Christian College of Engineering and Technology, Kuttikanam. Want his contact info or work history next?'
  }

  if (/\b(help|what can you do|how do you work|options|commands)\b/.test(t)) {
    return "I can tell you about Blesson's work. Try asking: \"Who is Blesson?\", \"What is his experience?\", \"What are his skills?\", \"Show his projects\", or \"How can I contact him?\"."
  }

  if (/\b(hello|hi|hey|yo|hola|namaste|good morning|good evening|good afternoon|greetings)\b/.test(t)) {
    return "Hey there! I'm the AI assistant for Blesson's portfolio. Ask me about his experience, skills, projects, or how to reach him — I'm happy to help!"
  }

  return "I don't have an answer for that yet, but I can help with Blesson's experience, skills, projects, and contact details. Try one of the quick questions below!"
}

function SiriOrb({ className = '', active = false }) {
  return (
    <span className={`siri-orb${active ? ' siri-orb--active' : ''} ${className}`.trim()} aria-hidden="true">
      {WAVE_BARS.map((height, i) => (
        <span key={i} className="siri-bar" style={{ height: `${height}px` }} />
      ))}
    </span>
  )
}

// A friendly 3D-style chatbot head button: a layered robot face with glossy
// glass visor, animated iris, flapping antenna, mouth, and a floating "Hi!"
// speech bubble. Built purely from CSS with layered gradients, shadows, and
// transform-based animation so it reads as a character, not a flat orb.
function ChatbotFace() {
  return (
    <span className="bot-3d" aria-hidden="true">
      {/* Antenna + signal ring on top of the head */}
      <span className="bot-antenna">
        <span className="bot-antenna-ball" />
        <span className="bot-antenna-ring" />
      </span>

      {/* The head shell */}
      <span className="bot-head">
        {/* Visor / screen with animated eyes + mouth */}
        <span className="bot-visor">
          <span className="bot-visor-glass" />
          <span className="bot-eye bot-eye--left">
            <span className="bot-iris" />
          </span>
          <span className="bot-eye bot-eye--right">
            <span className="bot-iris" />
          </span>
          <span className="bot-mouth" />
          <span className="bot-face-glow" />
        </span>

        {/* Cheek "modules" for the robot look */}
        <span className="bot-cheek bot-cheek--left" />
        <span className="bot-cheek bot-cheek--right" />

        {/* Specular highlight + inner light on the shell */}
        <span className="bot-shell-highlight" />
        <span className="bot-shell-rim" />
      </span>

      {/* Floating speech bubble */}
      <span className="bot-bubble">Hi!</span>
    </span>
  )
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: START_MESSAGE }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const timeoutsRef = useRef([])

  const later = (fn, delay) => {
    const id = window.setTimeout(fn, delay)
    timeoutsRef.current.push(id)
  }

  useEffect(() => () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  const send = (raw) => {
    const value = (raw ?? input).trim()
    if (!value || typing) return
    setMessages((m) => [...m, { role: 'user', text: value }])
    setInput('')
    setTyping(true)
    const reply = getBotReply(value)
    const delay = 550 + Math.min(900, reply.length * 6)
    later(() => {
      setMessages((m) => [...m, { role: 'bot', text: reply }])
      setTyping(false)
    }, delay)
  }

  const quick = (option) => () => {
    if (open) send(option)
  }

  return (
    <div className={`siri-chat${open ? ' is-open' : ''}`}>
      <div className="siri-panel" role="dialog" aria-label="AI assistant chat">
        <div className="siri-header">
          <SiriOrb className="siri-header-orb" active />
          <div className="siri-header-text">
            <span className="siri-header-title">Blesson Assistant</span>
            <span className="siri-header-sub">Ready to help with his work</span>
          </div>
          <span className="siri-header-dot" aria-hidden="true" />
        </div>

        <div className="siri-messages" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`siri-msg siri-msg--${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {typing && (
            <div className="siri-msg siri-msg--bot siri-typing" aria-label="Assistant is typing">
              <i /><i /><i />
            </div>
          )}
        </div>

        <div className="siri-chips">
          {QUICK_OPTIONS.map((option) => (
            <button key={option} type="button" className="siri-chip" onClick={quick(option)}>
              {option}
            </button>
          ))}
        </div>

        <div className="siri-input-row">
          <input
            ref={inputRef}
            className="siri-input"
            type="text"
            value={input}
            placeholder="Ask about Blesson…"
            aria-label="Message the assistant"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
          />
          <button
            type="button"
            className="siri-send"
            onClick={() => send()}
            disabled={typing || !input.trim()}
            aria-label="Send message"
          >
            <span className="material-symbols-outlined" aria-hidden="true">send</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        className="siri-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        title={open ? 'Close assistant' : 'Ask Blesson Assistant'}
      >
        {open ? (
          <span className="material-symbols-outlined siri-fab-icon" aria-hidden="true">close</span>
        ) : (
          <ChatbotFace />
        )}
      </button>
    </div>
  )
}