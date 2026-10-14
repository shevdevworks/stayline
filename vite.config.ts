/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static routes are prerendered to real HTML files after the build, and
// 404.html is written as the SPA fallback — see scripts/prerender.mjs.
// https://vite.dev/config/
export default defineConfig({
  base: '/stayline/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Fixed so date logic around DST and month ends is tested the same way
    // on every machine.
    env: { TZ: 'Europe/Kyiv' },
  },
})
