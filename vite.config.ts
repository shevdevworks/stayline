import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the built app as static files: a direct visit to a
// deep route has no matching file on disk, so Pages falls back to 404.html
// if present. Copying index.html there lets the router take over instead.
function spaFallback404(): Plugin {
  let outDir = 'dist'
  let root = process.cwd()

  return {
    name: 'spa-fallback-404',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },
    closeBundle() {
      const dir = resolve(root, outDir)
      copyFileSync(resolve(dir, 'index.html'), resolve(dir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/stayline/',
  plugins: [react(), spaFallback404()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
