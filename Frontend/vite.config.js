import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Blesson-Portfolio/' : '/',
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('react-dom')) return 'react'
          if (id.includes('/gsap/') || id.includes('@gsap')) return 'gsap'
          if (id.includes('/ogl/')) return 'ogl'
          if (id.includes('/three/') || id.includes('three/examples')) return 'three'
          if (id.includes('@react-three') || id.includes('meshline') || id.includes('rapier')) return 'three'
          return 'vendor'
        },
      },
    },
  },
}))
