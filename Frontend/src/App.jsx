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
import myProfileImage from './assets/my-profile.png'
import aiDemoVideo from './assets/video_2026-08-11_00-15-32.mp4'
import mlopsVideo from './assets/video_2026-08-11_00-15-43.mp4'
import dataEngineeringVideo from './assets/video_2026-08-11_00-16-05.mp4'
import mlVideo from './assets/doc_2026-08-11_00-16-01.mp4'
import visionVideo from './assets/doc_2026-08-11_00-15-58.mp4'
import asyncVideo from './assets/doc_2026-08-11_00-15-49.mp4'
import ThemeToggler from './components/ThemeToggler'
import ClickSpark from './components/ClickSpark'
import TrueFocus from './components/TrueFocus'
import DecryptedText from './components/DecryptedText'
import SplitText from './components/SplitText'

const navItems = [
  ['work', 'Experience', 'work'],
  ['skills', 'Skills', 'code'],
  ['expertise', 'Expertise', 'bolt'],
  ['projects', 'Projects', 'folder_special'],
  ['workflow', 'Workflow', 'account_tree'],
]

const expertiseItems = [
  { icon: 'neurology', title: 'LLM & Generative AI', description: 'Fine-tuning, retrieval-augmented pipelines, and prompt systems that stay reliable in production.', tags: ['PyTorch', 'LangChain', 'RAG'], tone: 'blue', video: aiDemoVideo },
  { icon: 'videocam', title: 'Computer Vision & Vision AI', description: 'Real-time facial emotion recognition, OpenCV video processing streams, and vision inference models.', tags: ['OpenCV', 'Deep Learning', 'PyTorch'], tone: 'cyan', video: visionVideo },
  { icon: 'query_stats', title: 'Machine Learning', description: 'Predictive models and deep learning systems built on a foundation of clean, well-understood data.', tags: ['TensorFlow', 'scikit-learn', 'Pandas'], tone: 'cyan', video: mlVideo },
  { icon: 'sync_alt', title: 'Async & Distributed Systems', description: 'High-throughput task queues, Celery workers, and Redis caching for distributed asynchronous workloads.', tags: ['Celery', 'Redis', 'FastAPI'], tone: 'violet', video: asyncVideo },
  { icon: 'database', title: 'Data Engineering', description: 'Pipelines and vector stores that keep models fed with data they can actually trust.', tags: ['Postgres', 'ChromaDB', 'Pinecone'], tone: 'violet', video: dataEngineeringVideo },
  { icon: 'deployed_code', title: 'MLOps & Deployment', description: "Serving, monitoring, and CI/CD so a model's behaviour in production matches what shipped.", tags: ['AWS', 'Docker', 'EC2'], tone: 'blue', video: mlopsVideo },
]

const experiences = [
  {
    period: '05/2025 – Present',
    role: 'AI Engineer',
    company: 'Adam Finastra',
    location: 'Kozhikode',
    locationUrl: 'https://maps.app.goo.gl/jr3RUwj95iW45woT8',
    color: 'primary',
    bullets: [
      'Built AI-powered applications and intelligent automation systems using Generative AI and modern backend technologies.',
      'Developed AI-driven marketing and content generation workflows capable of generating captions & assets automatically.',
      'Designed and orchestrated robust AI agent workflows, API integrations, and automated processing pipelines.',
      'Implemented high-performance backend systems using Python, Django, FastAPI, Celery, Redis, and PostgreSQL.'
    ]
  },
  {
    period: '07/2024 – 04/2025',
    role: 'Data Science Intern',
    company: 'Techolas Technologies',
    location: 'Kochi',
    locationUrl: 'https://maps.app.goo.gl/2yY8WKMQbYD5sFDj8',
    color: 'secondary',
    bullets: [
      'Analyzed and processed large datasets using Python, SQL, Pandas, and NumPy to extract business insights.',
      'Developed and optimized machine learning models for predictive analytics and performance improvement.',
      'Worked on data preprocessing, feature engineering, and model evaluation techniques for real-world datasets.',
      'Created interactive dashboards and visual reports using Tableau and Power BI to support decision-making.'
    ]
  }
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

function RoleCycler({ roles, interval = 2800 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animState, setAnimState] = useState('visible') // 'visible' | 'exit' | 'enter'

  useEffect(() => {
    const tick = setInterval(() => {
      // Step 1: fade-slide out
      setAnimState('exit')
      setTimeout(() => {
        // Step 2: swap text (invisible)
        setCurrentIndex(i => (i + 1) % roles.length)
        setAnimState('enter')
        // Step 3: fade-slide in
        setTimeout(() => setAnimState('visible'), 40)
      }, 320)
    }, interval)
    return () => clearInterval(tick)
  }, [roles, interval])

  return (
    <p className={`profile-role-title profile-role-title--${animState}`}>
      {roles[currentIndex]}
    </p>
  )
}

function HeroName() {
  const [stage, setStage] = useState(0)

  return (
    <>
      {stage === 0 && (
        <DecryptedText
          text="Blesson C Biju"
          animateOn="view"
          sequential
          revealDirection="start"
          speed={55}
          className="hero-name-revealed"
          encryptedClassName="hero-name-encrypted"
          onDecryptComplete={() => setStage(1)}
        />
      )}
      {stage === 1 && (
        <TrueFocus
          sentence="Blesson C Biju"
          once
          blurAmount={4}
          borderColor="#5de6ff"
          glowColor="rgba(93, 230, 255, 0.6)"
          animationDuration={0.5}
          pauseBetweenAnimations={0.9}
          onComplete={() => setStage(2)}
        />
      )}
      {stage === 2 && <span className="hero-name-plain">Blesson C Biju</span>}
    </>
  )
}

function ExpertiseCard({ item }) {
  const [flipped, setFlipped] = useState(false)
  const toggleFlip = () => setFlipped((f) => !f)

  return (
    <article
      className={`expertise-card expertise-card--${item.tone}${flipped ? ' is-flipped' : ''}`}
      tabIndex={0}
      onClick={toggleFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleFlip()
        }
      }}
    >
      <div className="expertise-card-media">
        <video
          src={item.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`Showcase video for ${item.title}`}
          ref={(el) => {
            if (el) el.play().catch(() => {})
          }}
        />
        <div className="expertise-card-media-overlay" aria-hidden="true" />
      </div>
      <div className="expertise-card-title">
        <h3>{item.title}</h3>
      </div>
      <div className="expertise-card-back">
        <div className="expertise-card-back-inner">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="expertise-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </div>
      <span className="expertise-orbit" aria-hidden="true" />
    </article>
  )
}

function App() {
  const [immersivePhase, setImmersivePhase] = useState(0)
  const heroContentRef = useRef(null)
  const heroSectionRef = useRef(null)
  const detailsRef = useRef(null)
  const expertiseGridRef = useRef(null)
  const experienceGridRef = useRef(null)
  const lenisRef = useRef(null)

  const scrollToSection = (e, target) => {
    e.preventDefault()
    setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { duration: 1.2 })
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 420)
  }

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
      const detailChildren = Array.from(details.children).filter(
        (child) => !child.classList.contains('expertise-heading'),
      )
      gsap.fromTo(
        detailChildren,
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
        .fromTo(cards, { opacity: 0, y: 72, rotateX: -15, scale: 0.92 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.05, stagger: { each: 0.12, from: 'random' }, ease: 'power4.out', clearProps: 'transform' })
        .fromTo(ornaments, { opacity: 0, scale: 0.35, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 1.2, stagger: 0.08, ease: 'back.out(1.7)' }, 0.2)
    }

    // Timeline items scroll-in animation via IntersectionObserver
    const timelineItems = document.querySelectorAll('.timeline-item')
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target
            const delay = Number(item.dataset.delay || 0)
            setTimeout(() => {
              item.classList.add('is-visible')
            }, delay)
            timelineObserver.unobserve(item)
          }
        })
      },
      { threshold: 0.25 }
    )
    timelineItems.forEach((item, idx) => {
      item.dataset.delay = idx * 150
      timelineObserver.observe(item)
    })

    // Experience section whole-layout scroll animation
    const expGrid = experienceGridRef.current
    if (expGrid) {
      const cols = expGrid.querySelectorAll('.experience-profile-col, .experience-timeline-col')
      gsap.fromTo(
        cols,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: { trigger: expGrid, start: 'top 82%', once: true },
        }
      )
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    })
    lenisRef.current = lenis

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

      <div className="top-nav-bar">
        <ThemeToggler />
        <ClickSpark sparkColor="#5de6ff" sparkSize={12} sparkRadius={24} sparkCount={14} duration={450}>
          <a className="reference-contact" href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Contact</a>
        </ClickSpark>
      </div>

      <aside className="reference-side-nav" aria-label="Section navigation">
        {navItems.map(([id, label, icon], index) => (
          <a className={`side-nav-item${index === 0 ? ' is-active' : ''}`} href={`#${id}`} key={id} aria-label={label}>
            <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
            <span className="side-nav-tooltip">{label}</span>
          </a>
        ))}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.map(([id, label, icon]) => (
          <a className="mobile-nav-item" href={`#${id}`} key={id}>
            <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
            <span className="mobile-nav-label">{label}</span>
          </a>
        ))}
      </nav>

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
            <h1 id="hero-title">
              <HeroName />
              <span className="sr-only">Blesson C Biju</span>
            </h1>
            {/* <p>Building Intelligent AI Products That Solve Real Problems.</p> */}
            <p className="hero-intro">From first idea to confident launch, I turn complex data and ambitious ideas into dependable, human-centred AI experiences that create measurable momentum.</p>
            <ul className="hero-capabilities" aria-label="Core capabilities">
              <li>AI Strategy</li>
              <li>Intelligent Automation</li>
              <li>Production-ready Systems</li>
            </ul>
            <div className="reference-actions">
              <a className="reference-primary-button" href="#projects">View Projects</a>
              <ClickSpark sparkColor="#5de6ff" sparkSize={10} sparkRadius={20} sparkCount={12} duration={400}>
                <a className="reference-secondary-button" href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Contact</a>
              </ClickSpark>
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

          <div className="experience-grid-layout" ref={experienceGridRef}>
            {/* Left Column: About/Profile Card */}
            <div className="experience-profile-col">
              <div className="glass-panel profile-card-wrap">
                <div className="profile-image-container">
                  <img
                    className="profile-cyber-image"
                    alt="Blesson C Biju AI Engineer"
                    src={myProfileImage}
                  />
                  <div className="profile-image-gradient-overlay" />
                </div>
                <div className="profile-identity-content">
                  <h3 className="profile-name-text">Blesson C Biju</h3>
                  <RoleCycler roles={['AI Engineer', 'Full Stack Developer']} />
                  <p className="profile-bio-text">
                    Architecting next-generation Generative AI products, autonomous agentic workflows, and high-performance backend systems. I transform complex business operations into resilient, self-adapting software that delivers real-world impact.
                  </p>
                </div>
                <div className="profile-tags-chips">
                  <span className="profile-tag-chip">Generative AI</span>
                  <span className="profile-tag-chip">AI Agents</span>
                  <span className="profile-tag-chip">Intelligent Automation</span>
                  <span className="profile-tag-chip">Scalable Systems</span>
                </div>
              </div>

              {/* 
              <div className="glass-panel philosophy-card-wrap">
                <h4 className="philosophy-title">
                  <span className="material-symbols-outlined philosophy-icon" aria-hidden="true">bolt</span>
                  Core Philosophy
                </h4>
                <p className="philosophy-body-text">
                  "Complexity is a debt; simplicity is the dividend. I strive to build systems that are not just intelligent, but inherently transparent and resilient."
                </p>
              </div>
              */}

              <div className="glass-panel education-card-wrap">
                <h4 className="education-title">
                  <span className="material-symbols-outlined education-icon" aria-hidden="true">school</span>
                  Education
                </h4>
                <div className="education-degree">Bachelor of Technology (B.Tech) - Computer Science</div>
                <div className="education-university">APJ Abdul Kalam Technological University (KTU)</div>
                <div className="education-college">Mar Baselios Christian College of Engineering and Technology, Kuttikanam</div>
                <div className="education-footer">
                  <div className="education-year">2020 – 2024</div>
                  <a
                    href="https://maps.app.goo.gl/a5i4EdhuGm4Q8tc18"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="education-location-btn"
                    title="View Mar Baselios Christian College of Engineering and Technology on Google Maps"
                  >
                    <span className="material-symbols-outlined location-pin-icon" aria-hidden="true">location_on</span>
                    <span>View Location</span>
                    <span className="material-symbols-outlined open-icon" aria-hidden="true">north_east</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Experience Timeline Card */}
            <div className="experience-timeline-col">
              <div className="glass-panel experience-card-wrap">
                <h3 className="timeline-title">Professional Experience</h3>
                <div className="timeline-journey">
                  <div className="timeline-line" />
                  {experiences.map((exp, idx) => (
                    <div className="timeline-item group" key={idx}>
                      <div className={`timeline-dot timeline-dot--${exp.color}`} />
                      <div className="timeline-content">
                        <span className="timeline-date">{exp.period}</span>
                        <h4 className="timeline-role">
                          {exp.role} <span className="timeline-company">@ {exp.company}</span>
                        </h4>
                        <div className="timeline-location-row">
                          <span className="timeline-location">{exp.location}</span>
                          {exp.locationUrl && (
                            <a
                              href={exp.locationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="timeline-location-btn"
                              title={`View ${exp.company} on Google Maps`}
                            >
                              <span className="material-symbols-outlined location-pin-icon" aria-hidden="true">location_on</span>
                              <span>View Location</span>
                              <span className="material-symbols-outlined open-icon" aria-hidden="true">north_east</span>
                            </a>
                          )}
                        </div>
                        <ul className="timeline-bullets">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="tools-marquee-section" id="skills" aria-label="Tools and Technologies">
          <ParticleNetworkBackground
            className="section-network-canvas"
            pointsCount={70}
            linkDistance={2.8}
            color={0x2E86C1}
            coverage={0.9}
            showAmbientCloud={false}
          />
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
          <ParticleNetworkBackground
            className="section-network-canvas"
            pointsCount={80}
            linkDistance={2.9}
            color={0x2E86C1}
            coverage={0.95}
            showAmbientCloud={false}
          />
          <p className="section-label section-label--cyan">Expertise</p>
          <div className="expertise-heading">
            <SplitText
              tag="h2"
              id="expertise-heading"
              text="AI products with a human centre."
              className="expertise-heading-title"
              textAlign="left"
              delay={70}
              duration={1.25}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
            />
            <SplitText
              text="From the first spark to a polished release, I create useful digital experiences with care and precision."
              className="expertise-subheading"
              textAlign="left"
              delay={30}
              duration={1}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
            />
          </div>
          <div ref={expertiseGridRef} className="expertise-grid">
            {expertiseItems.map((item) => (
              <ExpertiseCard key={item.title} item={item} />
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
