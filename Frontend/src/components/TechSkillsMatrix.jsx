import { useState } from 'react'
import {
  Brain,
  Cpu,
  Database,
  Cloud,
  Code2,
  Sparkles,
  Layers,
  Bot,
  Zap,
  Eye,
  Server,
  Workflow,
  BarChart3,
  GitBranch,
  Terminal,
  ShieldCheck,
  Globe,
  Binary
} from 'lucide-react'

const skillCategories = [
  { id: 'all', label: 'All Skills' },
  { id: 'ai', label: 'AI & GenAI' },
  { id: 'ml', label: 'ML & Vision' },
  { id: 'backend', label: 'Backend & Async' },
  { id: 'cloud', label: 'Cloud & Infra' },
  { id: 'data', label: 'Data & Visualization' }
]

const allSkills = [
  // AI & GenAI
  { name: 'Generative AI', category: 'ai', icon: Sparkles, tag: 'Core Expertise', desc: 'LLM applications, multimodal assets & creative pipelines' },
  { name: 'LLMs & RAG', category: 'ai', icon: Brain, tag: 'Production', desc: 'Retrieval pipelines, vector indexing & contextual search' },
  { name: 'AI Agents', category: 'ai', icon: Bot, tag: 'Workflows', desc: 'Autonomous agent chains, tool use & API orchestration' },
  { name: 'Prompt Engineering', category: 'ai', icon: Terminal, tag: 'Optimization', desc: 'Structured outputs, system prompts & zero/few-shot tuning' },
  { name: 'LangChain', category: 'ai', icon: Workflow, tag: 'Framework', desc: 'Agent orchestration, memory management & chain building' },
  { name: 'Multimodal AI', category: 'ai', icon: Layers, tag: 'Vision & Text', desc: 'Cross-modal embeddings, image generation & chat' },
  { name: 'NLP', category: 'ai', icon: Binary, tag: 'Text Analytics', desc: 'Text processing, sentiment classification & extraction' },

  // ML & Vision
  { name: 'PyTorch', category: 'ml', icon: Cpu, tag: 'Deep Learning', desc: 'Model training, neural net architectures & fine-tuning' },
  { name: 'TensorFlow', category: 'ml', icon: Cpu, tag: 'ML Framework', desc: 'Deep learning pipelines & model inference' },
  { name: 'OpenCV', category: 'ml', icon: Eye, tag: 'Computer Vision', desc: 'Facial recognition, video stream processing & feature extraction' },
  { name: 'Scikit-learn', category: 'ml', icon: Zap, tag: 'Predictive Analytics', desc: 'Classification, regression, clustering & feature scaling' },
  { name: 'Model Evaluation', category: 'ml', icon: ShieldCheck, tag: 'Validation', desc: 'Hyperparameter tuning, cross-validation & metrics analysis' },
  { name: 'Data Preprocessing', category: 'ml', icon: Database, tag: 'Pipelines', desc: 'Feature engineering, normalization & dataset cleaning' },
  { name: 'EDA', category: 'ml', icon: BarChart3, tag: 'Exploratory Data', desc: 'Statistical insights, pattern discovery & distribution analysis' },

  // Backend & Async
  { name: 'FastAPI', category: 'backend', icon: Zap, tag: 'High-Perf API', desc: 'Async REST APIs, OpenAPI specs & fast JSON microservices' },
  { name: 'Django', category: 'backend', icon: Server, tag: 'Web Framework', desc: 'Scalable backend architectures, ORM & authentication' },
  { name: 'Celery & Redis', category: 'backend', icon: Workflow, tag: 'Async Tasks', desc: 'Background task queues, scheduling & distributed workers' },
  { name: 'Vector DBs (ChromaDB)', category: 'backend', icon: Database, tag: 'Vector Store', desc: 'High-dimensional embeddings storage & similarity search' },
  { name: 'PostgreSQL & SQL', category: 'backend', icon: Database, tag: 'Relational DB', desc: 'Relational schema design, complex queries & indexing' },
  { name: 'REST APIs', category: 'backend', icon: Globe, tag: 'Integration', desc: 'Clean API endpoints, authentication & third-party integration' },
  { name: 'Python', category: 'backend', icon: Code2, tag: 'Primary Lang', desc: 'Production scripting, backend logic & AI engineering' },

  // Cloud & Infra
  { name: 'AWS & EC2', category: 'cloud', icon: Cloud, tag: 'Cloud Compute', desc: 'Cloud infrastructure hosting, server setup & security groups' },
  { name: 'Docker', category: 'cloud', icon: Layers, tag: 'Containerization', desc: 'Microservice packaging, container orchestration & deployment' },
  { name: 'Linux Server Mgmt', category: 'cloud', icon: Terminal, tag: 'SysAdmin', desc: 'Bash scripting, server monitoring & environment setup' },
  { name: 'Git & GitHub', category: 'cloud', icon: GitBranch, tag: 'Version Control', desc: 'CI/CD workflows, collaborative branching & code reviews' },

  // Data & Visualization
  { name: 'Tableau', category: 'data', icon: BarChart3, tag: 'BI Dashboards', desc: 'Executive dashboard reporting & interactive data visual analytics' },
  { name: 'Power BI', category: 'data', icon: BarChart3, tag: 'Business Analytics', desc: 'Data modeling, DAX queries & automated report generation' },
  { name: 'JavaScript & React', category: 'data', icon: Code2, tag: 'Frontend', desc: 'Interactive UI, modern component systems & API wiring' }
]

export default function TechSkillsMatrix() {
  const [activeTab, setActiveTab] = useState('all')

  const filteredSkills = activeTab === 'all'
    ? allSkills
    : allSkills.filter((s) => s.category === activeTab)

  return (
    <section className="tech-matrix-section" id="skills">
      <div className="tech-matrix-container">
        <div className="tech-matrix-header">
          <span className="section-badge">FULL TECHNICAL SPECTRUM</span>
          <h2>Comprehensive Skills & AI Stack</h2>
          <p>
            From low-level model fine-tuning and computer vision pipelines to scalable async backends and production cloud deployments.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="matrix-tabs" role="tablist">
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeTab === cat.id}
              className={`matrix-tab ${activeTab === cat.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Skills */}
        <div className="matrix-grid">
          {filteredSkills.map((skill) => {
            const Icon = skill.icon
            return (
              <div className="matrix-card" key={skill.name}>
                <div className="matrix-card-top">
                  <div className="matrix-card-icon">
                    <Icon size={20} />
                  </div>
                  <span className="matrix-card-tag">{skill.tag}</span>
                </div>
                <h3>{skill.name}</h3>
                <p>{skill.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
