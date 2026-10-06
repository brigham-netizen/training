// Bundle dist/ into one self-contained HTML file (dist/hold-the-keep.html)
// for hosts that serve a single page.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname
let html = readFileSync(join(dist, 'index.html'), 'utf8')

html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g, (_, src) => {
  const js = readFileSync(join(dist, src), 'utf8').replace(/<\/script/g, '<\\/script')
  return `<script type="module">${js}</script>`
})
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g, (_, href) => {
  return `<style>${readFileSync(join(dist, href), 'utf8')}</style>`
})
const icon = readFileSync(join(dist, 'icon.svg'), 'utf8')
const iconUri = `data:image/svg+xml,${encodeURIComponent(icon)}`
html = html
  .replace(/<link rel="manifest"[^>]*>\n?\s*/, '')
  .replace(/href="\.\/icon\.svg"/g, `href="${iconUri}"`)

writeFileSync(join(dist, 'hold-the-keep.html'), html)

// Fragment variant for hosts that supply their own document skeleton.
const fragment = html
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?html[^>]*>\s*/g, '')
  .replace(/<\/?head>\s*/g, '')
  .replace(/<\/?body>\s*/g, '')
  .replace(/<meta charset[^>]*>\s*/, '')
  .replace(/<meta name="viewport"[^>]*>\s*/, '')
const title = fragment.match(/<title>.*?<\/title>/)[0]
writeFileSync(join(dist, 'hold-the-keep.fragment.html'), title + '\n' + fragment.replace(title, ''))
console.log(`wrote dist/hold-the-keep.html (${(html.length / 1024).toFixed(1)} KB)`)
