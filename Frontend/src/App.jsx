import './App.css'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [immersivePhase, setImmersivePhase] = useState(0)
  const heroContentRef = useRef(null)
  const heroSectionRef = useRef(null)
  const detailsRef = useRef(null)

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

    return () => {
      window.removeEventListener('scroll', onScroll)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
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

        <section ref={detailsRef} className="reference-details" id="expertise">
          <article><p className="section-label">Expertise</p><h2>AI products with a human centre.</h2></article>
          <article id="projects"><p>From the first spark to a polished release, I create useful digital experiences with care and precision.</p></article>
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
