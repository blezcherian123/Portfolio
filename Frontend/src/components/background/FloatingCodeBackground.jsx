import { useEffect, useRef } from 'react'

const snippets = [
  'model.predict(input_data)', 'optimizer = torch.optim.Adam()', 'loss.backward()',
  'from transformers import pipeline', 'tensor_rank_3', 'vector_embedding_1536',
  'latent_space_diffusion', 'attention_is_all_you_need', 'gradient_descent_init()',
  '0x1A4F9E', 'B.Engineer_Active',
]

export default function FloatingCodeBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const timeouts = []
    const createSnippet = () => {
      const snippet = document.createElement('span')
      snippet.className = 'floating-code'
      snippet.textContent = snippets[Math.floor(Math.random() * snippets.length)]
      snippet.style.left = `${Math.random() * 100}vw`
      snippet.style.animationDuration = `${Math.random() * 10 + 15}s`
      snippet.style.fontSize = `${Math.random() * 4 + 8}px`
      container.appendChild(snippet)
      const cleanup = window.setTimeout(() => snippet.remove(), 25000)
      timeouts.push(cleanup)
    }
    for (let index = 0; index < 15; index += 1) timeouts.push(window.setTimeout(createSnippet, Math.random() * 10000))
    const interval = window.setInterval(createSnippet, 3000)
    return () => { window.clearInterval(interval); timeouts.forEach(window.clearTimeout) }
  }, [])

  return <div className="site-background" ref={containerRef} aria-hidden="true"><div className="animated-grid" /></div>
}
