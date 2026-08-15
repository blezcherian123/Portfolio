import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Blesson-Portfolio/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('react-dom')) return 'react'
          if (id.includes('/gsap/') || id.includes('@gsap')) return 'gsap'
          if (id.includes('/three/') || id.includes('three/examples')) return 'three'
          return 'vendor'
        },
      },
    },
  },
}))
