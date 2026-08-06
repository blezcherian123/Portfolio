import './App.css'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import HeroMonogram from './components/background/HeroMonogram'
import HeroGreeting from './components/background/HeroGreeting'
import FloatingCodeBackground from './components/background/FloatingCodeBackground'
import ParticleNetworkBackground from './components/background/ParticleNetworkBackground'
import portfolioPencilHolding from './assets/portfolio-pencil-holding.png'

const navItems = [
  ['work', 'Experience', 'work'],
  ['expertise', 'Expertise', 'bolt'],
  ['projects', 'Projects', 'folder_special'],
  ['workflow', 'Workflow', 'account_tree'],
]

const expertiseItems = [
  { icon: 'neurology', title: 'LLM & Generative AI', description: 'Fine-tuning, retrieval-augmented pipelines, and prompt systems that stay reliable in production.', tags: ['PyTorch', 'LangChain', 'RAG'], tone: 'blue' },
  { icon: 'query_stats', title: 'Machine Learning', description: 'Predictive models and deep learning systems built on a foundation of clean, well-understood data.', tags: ['TensorFlow', 'scikit-learn', 'Pandas'], tone: 'cyan' },
  { icon: 'database', title: 'Data Engineering', description: 'Pipelines and vector stores that keep models fed with data they can actually trust.', tags: ['Airflow', 'Postgres', 'Pinecone'], tone: 'violet' },
  { icon: 'favorite', title: 'Human-Centred Design', description: 'Research and UX writing that keep the person on the other side of the model in view.', tags: ['Figma', 'User Research', 'UX Writing'], tone: 'blue' },
  { icon: 'widgets', title: 'Product Engineering', description: 'Turning a working model into a product people can open, trust, and actually use.', tags: ['React', 'FastAPI', 'Docker'], tone: 'cyan' },
  { icon: 'deployed_code', title: 'MLOps & Deployment', description: "Serving, monitoring, and CI/CD so a model's behaviour in production matches what shipped.", tags: ['AWS', 'Kubernetes', 'MLflow'], tone: 'violet' },
]

const aiSkillsCore = [
  'Python',
  'PyTorch',
  'TensorFlow',
  'Generative AI',
  'LLMs & RAG',
  'AI Agents',
  'LangChain',
  'OpenCV',
  'Scikit-Learn',
  'Deep Learning',
  'Machine Learning',
]

const aiSkillsInfra = [
  'FastAPI',
  'ChromaDB',
  'Prompt Engineering',
  'Multimodal AI',
  'Celery & Redis',
  'Docker',
  'AWS & EC2',
  'NLP Pipelines',
  'Django',
  'PostgreSQL',
]

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [immersivePhase, setImmersivePhase] = useState(0)
  const heroContentRef = useRef(null)
  const heroSectionRef = useRef(null)
  const detailsRef = useRef(null)
  const expertiseGridRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById('work')
      if (!section) return
      const top = section.getBoundingClientRect().top
      const windowHeight = window.innerHeight
      if (top < windowHeight * 0.15) {
        setImmersivePhase(3)
      } else if (top < windowHeight * 0.45) {
        setImmersivePhase(2)
      } else if (top < windowHeight * 0.8) {
        setImmersivePhase(1)
      } else {
        setImmersivePhase(0)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const heroContent = heroContentRef.current
    const heroSection = heroSectionRef.current
    const details = detailsRef.current

    if (heroContent && heroSection) {
      gsap.fromTo(
        heroContent,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.15,
        },
      )
    }

    if (details) {
      gsap.fromTo(
        details.children,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: details,
            start: 'top 80%',
            once: true,
          },
        },
      )
    }

    const expertiseGrid = expertiseGridRef.current
    if (expertiseGrid) {
      const cards = expertiseGrid.querySelectorAll('.expertise-card')
      const ornaments = expertiseGrid.querySelectorAll('.expertise-orbit')
      const animation = gsap.timeline({
        scrollTrigger: { trigger: expertiseGrid, start: 'top 78%', once: true },
      })
      animation
        .fromTo(cards, { opacity: 0, y: 72, rotateX: -15, scale: 0.92 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.05, stagger: { each: 0.12, from: 'random' }, ease: 'power4.out' })
        .fromTo(ornaments, { opacity: 0, scale: 0.35, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 1.2, stagger: 0.08, ease: 'back.out(1.7)' }, 0.2)
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      window.removeEventListener('scroll', onScroll)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      lenis.destroy()
    }
  }, [])

  return (
    <div className="portfolio-page">
      <FloatingCodeBackground />

      <a className="reference-contact" href="#contact">Contact</a>

      <aside className="reference-side-nav" aria-label="Section navigation">
        {navItems.map(([id, label, icon], index) => (
          <a className={`side-nav-item${index === 0 ? ' is-active' : ''}`} href={`#${id}`} key={id} aria-label={label}>
            <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
            <span className="side-nav-tooltip">{label}</span>
          </a>
        ))}
      </aside>

      <main>
        <section ref={heroSectionRef} className="reference-hero" id="home" aria-labelledby="hero-title">
          <ParticleNetworkBackground
            className="hero-network-canvas"
            pointsCount={180}
            linkDistance={3.25}
            color={0x2E86C1}
            coverage={0.82}
            showAmbientCloud={false}
          />
          <HeroMonogram />
          <HeroGreeting />
          <div ref={heroContentRef} className="reference-hero-content">
            <div className="hero-status">
              <i aria-hidden="true" />
              <span className="role-rotator" aria-label="AI Engineer and Full Stack Developer">
                <span aria-hidden="true">AI Engineer</span>
                <span aria-hidden="true">Full Stack Developer</span>
              </span>
            </div>
            <h1 id="hero-title">Blesson C Biju</h1>
            {/* <p>Building Intelligent AI Products That Solve Real Problems.</p> */}
            <p className="hero-intro">From first idea to confident launch, I turn complex data and ambitious ideas into dependable, human-centred AI experiences that create measurable momentum.</p>
            <ul className="hero-capabilities" aria-label="Core capabilities">
              <li>AI Strategy</li>
              <li>Intelligent Automation</li>
              <li>Production-ready Systems</li>
            </ul>
            <div className="reference-actions">
              <a className="reference-primary-button" href="#projects">View Projects</a>
              <a className="reference-secondary-button" href="#contact">Contact</a>
            </div>
          </div>
          <a className="reference-scroll-indicator" href="#work">
            <span>Scroll To Explore</span>
            <b aria-hidden="true" />
            <i aria-hidden="true"><em /></i>
          </a>
        </section>

        <section className={`particle-section immersive-section phase-${immersivePhase}`} id="work" aria-labelledby="network-heading">
          <ParticleNetworkBackground
            className="immersive-network-canvas"
            pointsCount={100}
            linkDistance={2.8}
            color={0x2E86C1}
            coverage={0.94}
            showAmbientCloud={false}
          />
          <div className="particle-content">
            <div className="particle-copy">
              <p className="section-label section-label--cyan">Intelligence in motion</p>
              <h2 id="network-heading">Bridging Human Cognition with Artificial Systems.</h2>
              <p>I specialize in developing high-performance AI architectures that transcend traditional computing. My focus lies at the intersection of deep learning and computer vision, creating systems that don't just process data—they understand it.</p>
            </div>
            <div className="particle-illustration">
              <img src={portfolioPencilHolding} alt="Portfolio illustration featuring pencil with AI concept" />
            </div>
          </div>
        </section>

        <section className="tools-marquee-section" aria-label="Tools and Technologies">
          <div className="marquee-header">
            <p className="marquee-label">Tools & Technologies</p>
          </div>
          <div className="marquee-wrap">
            <div className="marquee-track marquee-track--left">
              {[...aiSkillsCore, ...aiSkillsCore, ...aiSkillsCore].map((tool, idx) => (
                <div key={`core-${idx}`} className="marquee-pill">
                  <span className="pill-dot pill-dot--cyan" aria-hidden="true" />
                  <span className="pill-text">{tool}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="marquee-wrap marquee-wrap--reverse">
            <div className="marquee-track marquee-track--right">
              {[...aiSkillsInfra, ...aiSkillsInfra, ...aiSkillsInfra].map((tool, idx) => (
                <div key={`infra-${idx}`} className="marquee-pill">
                  <span className="pill-dot pill-dot--violet" aria-hidden="true" />
                  <span className="pill-text">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" aria-hidden="true">
          <div className="flow-line flow-line-1" />
          <div className="flow-line flow-line-2" />
          <div className="flow-line flow-line-3" />
          <div className="flow-dots">
            <span /><span /><span /><span /><span />
          </div>
        </div>

        <section ref={detailsRef} className="reference-details" id="expertise" aria-labelledby="expertise-heading">
          <div className="expertise-heading">
            <div>
              <p className="section-label">Expertise</p>
              <h2 id="expertise-heading">AI products with a human centre.</h2>
            </div>
            <p>From the first spark to a polished release, I create useful digital experiences with care and precision.</p>
          </div>
          <div ref={expertiseGridRef} className="expertise-grid">
            {expertiseItems.map((item) => (
              <article className={`expertise-card expertise-card--${item.tone}`} key={item.title}>
                <span className="expertise-orbit" aria-hidden="true" />
                <div className="expertise-icon"><span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="expertise-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </article>
            ))}
          </div>
          <span id="projects" aria-hidden="true" />
          <span className="workflow-anchor" id="workflow" aria-hidden="true" />
        </section>
      </main>

      <footer className="reference-footer" id="contact">
        <span>B.</span>
        <span>(c) 2026 AI Engineering Portfolio</span>
        <div><a href="#github">GitHub</a><a href="#linkedin">LinkedIn</a><a href="#twitter">Twitter</a></div>
      </footer>
    </div>
  )
}

export default App
