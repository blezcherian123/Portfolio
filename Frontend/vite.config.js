import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react') || id.includes('react-dom') || id.includes('react/jsx-runtime')) return 'react'
          if (id.includes('gsap') || id.includes('@gsap')) return 'gsap'
          if (id.includes('ogl')) return 'ogl'
          if (id.includes('three')) return 'three'
          if (id.includes('@react-three')) return 'r3f'
          if (id.includes('meshline')) return 'meshline'
          if (id.includes('rapier')) return 'rapier'
          if (id.includes('react-smokey-fluid-cursor')) return 'smokey'
          if (id.includes('lenis')) return 'lenis'
          if (id.includes('lucide') || id.includes('lozad')) return 'utils'
          return 'vendor'
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three'],
    exclude: [],
  },
}))
