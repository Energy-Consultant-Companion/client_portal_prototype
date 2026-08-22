import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// GitHub Pages serves this repo under /client_portal_prototype/.
// `npm run dev` and `npm run preview` keep the same base so deep links behave identically.
const BASE = '/client_portal_prototype/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    {
      // GitHub Pages has no SPA rewrite. A copy of index.html at 404.html makes
      // deep links like /ensera/kundschaft/reuter resolve to the app shell.
      name: 'spa-404-fallback',
      closeBundle() {
        const dist = resolve(import.meta.dirname, 'dist')
        copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
      },
    },
  ],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
})
