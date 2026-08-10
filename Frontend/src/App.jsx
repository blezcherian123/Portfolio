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

const navItems = [
  ['work', 'Experience', 'work'],
  ['skills', 'Skills', 'code'],
  ['expertise', 'Expertise', 'bolt'],
  ['projects', 'Projects', 'folder_special'],
  ['workflow', 'Workflow', 'account_tree'],
]

const expertiseItems = [
  { icon: 'neurology', title: 'LLM & Generative AI', description: 'Fine-tuning, retrieval-augmented pipelines, and prompt systems that stay reliable in production.', tags: ['PyTorch', 'LangChain', 'RAG'], tone: 'blue' },
  { icon: 'videocam', title: 'Computer Vision & Vision AI', description: 'Real-time facial emotion recognition, OpenCV video processing streams, and vision inference models.', tags: ['OpenCV', 'Deep Learning', 'PyTorch'], tone: 'cyan' },
  { icon: 'query_stats', title: 'Machine Learning', description: 'Predictive models and deep learning systems built on a foundation of clean, well-understood data.', tags: ['TensorFlow', 'scikit-learn', 'Pandas'], tone: 'cyan' },
  { icon: 'sync_alt', title: 'Async & Distributed Systems', description: 'High-throughput task queues, Celery workers, and Redis caching for distributed asynchronous workloads.', tags: ['Celery', 'Redis', 'FastAPI'], tone: 'violet' },
  { icon: 'database', title: 'Data Engineering', description: 'Pipelines and vector stores that keep models fed with data they can actually trust.', tags: ['Postgres', 'ChromaDB', 'Pinecone'], tone: 'violet' },
  { icon: 'favorite', title: 'Human-Centred Design', description: 'Research and UX writing that keep the person on the other side of the model in view.', tags: ['Figma', 'User Research', 'UX Writing'], tone: 'blue' },
  { icon: 'widgets', title: 'Product Engineering', description: 'Turning a working model into a product people can open, trust, and actually use.', tags: ['React', 'FastAPI', 'Docker'], tone: 'cyan' },
  { icon: 'deployed_code', title: 'MLOps & Deployment', description: "Serving, monitoring, and CI/CD so a model's behaviour in production matches what shipped.", tags: ['AWS', 'Docker', 'EC2'], tone: 'violet' },
]

const experiences = [
  {
    period: '05/2025 – Present',
    role: 'AI Engineer',
    company: 'Adam Finastra',
    location: 'Kozhikode',
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

function App() {
  const [immersivePhase, setImmersivePhase] = useState(0)
  const heroContentRef = useRef(null)
  const heroSectionRef = useRef(null)
  const detailsRef = useRef(null)
  const expertiseGridRef = useRef(null)
  const experienceGridRef = useRef(null)

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
                        <span className="timeline-location">{exp.location}</span>
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
          <p className="section-label section-label--cyan">Expertise</p>
          <div className="expertise-heading">
            <h2 id="expertise-heading">AI products with a human centre.</h2>
            <p className="expertise-subheading">From the first spark to a polished release, I create useful digital experiences with care and precision.</p>
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
