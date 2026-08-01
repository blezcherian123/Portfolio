import './App.css'
import HeroMonogram from './components/background/HeroMonogram'
import FloatingCodeBackground from './components/background/FloatingCodeBackground'
import ParticleNetworkBackground from './components/background/ParticleNetworkBackground'

const navItems = [
  ['work', 'Experience', 'work'],
  ['expertise', 'Expertise', 'bolt'],
  ['projects', 'Projects', 'folder_special'],
  ['workflow', 'Workflow', 'account_tree'],
]

function App() {
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
        <section className="reference-hero" id="home" aria-labelledby="hero-title">
          <ParticleNetworkBackground
            className="hero-network-canvas"
            pointsCount={180}
            linkDistance={3.25}
            color={0x2E86C1}
            coverage={0.82}
            showAmbientCloud={false}
          />
          <HeroMonogram />
          <div className="reference-hero-content">
            <div className="hero-status"><i aria-hidden="true" /> <span>AI Engineer</span></div>
            <h1 id="hero-title">Blesson C Biju</h1>
            <p>Building Intelligent AI Products That Solve Real Problems</p>
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

        <section className="particle-section" id="work" aria-labelledby="network-heading">
          <ParticleNetworkBackground className="particle-canvas" pointsCount={80} linkDistance={3.25} color={0x2E86C1} />
          <div className="particle-content">
            <p className="section-label">Intelligence in motion</p>
            <h2 id="network-heading">Systems that connect.</h2>
            <p>Ideas, data, and product thinking working together in one clear direction.</p>
          </div>
        </section>

        <section className="reference-details" id="expertise">
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
