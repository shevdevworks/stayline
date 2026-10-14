// Writes a real HTML file for every known public route, so GitHub Pages
// answers them with HTTP 200 and the page's actual content instead of
// falling through to 404.html.
//
// Runs after both builds (see "build" in package.json):
//   dist/                  client build (index.html is the template)
//   node_modules/.tmp/ssr  SSR build of src/entry-server.tsx
//
// GitHub Pages serves /venue/<slug> from venue/<slug>.html, so venue pages
// keep their existing extensionless URLs.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')
const ssrEntry = resolve(root, 'node_modules/.tmp/ssr/entry-server.js')

const SITE_ORIGIN = 'https://shevdevworks.github.io'
const BASE = '/stayline/'

const { render, getPrerenderRoutes } = await import(pathToFileURL(ssrEntry).href)

const template = readFileSync(resolve(distDir, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: dist/index.html has no empty #root to fill')
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function setMeta(html, attribute, key, content) {
  const pattern = new RegExp(`(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*(")`)
  if (!pattern.test(html)) throw new Error(`prerender: template has no meta ${attribute}="${key}"`)
  return html.replace(pattern, `$1${escapeHtml(content)}$2`)
}

function pageUrl(path) {
  return `${SITE_ORIGIN}${BASE}${path === '/' ? '' : path.slice(1)}`
}

function buildPage(route) {
  const url = pageUrl(route.path)
  let html = template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
  html = setMeta(html, 'name', 'description', route.description)
  html = setMeta(html, 'property', 'og:title', route.title)
  html = setMeta(html, 'property', 'og:description', route.description)
  html = setMeta(html, 'property', 'og:url', url)
  if (route.image) {
    html = setMeta(html, 'property', 'og:image', `${SITE_ORIGIN}${route.image}`)
    html = setMeta(html, 'property', 'og:image:width', '1200')
    html = setMeta(html, 'property', 'og:image:height', '800')
    html = setMeta(html, 'property', 'og:image:alt', route.title)
    html = setMeta(html, 'name', 'twitter:image', `${SITE_ORIGIN}${route.image}`)
    html = setMeta(html, 'name', 'twitter:image:alt', route.title)
  }
  html = html.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`)
  return html.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="${escapeHtml(route.path)}">${render(route.path)}</div>`,
  )
}

const routes = getPrerenderRoutes()
for (const route of routes) {
  const target = resolve(distDir, route.file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, buildPage(route))
}

// 404.html stays an empty app shell: GitHub Pages serves it (with status
// 404) for any path without a file — unknown URLs and booking deep links —
// and the router renders the right screen from the URL.
const fallback = template.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>')
writeFileSync(resolve(distDir, '404.html'), fallback)

console.log(`prerender: ${routes.length} pages + 404.html`)
