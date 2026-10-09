import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

// Build stamp shown in feedback reports: date plus commit.
function buildStamp() {
  const day = new Date().toISOString().slice(0, 10)
  try {
    return `${day} ${execSync('git rev-parse --short HEAD').toString().trim()}`
  } catch {
    return day
  }
}

// Relative base so the build works from any folder or static host.
export default defineConfig({
  base: './',
  // Everything inlines (the single-file build needs it), the unit models too.
  build: { assetsInlineLimit: 2000000, chunkSizeWarningLimit: 6000 },
  assetsInclude: ['**/*.glb'],
  define: { __BUILD__: JSON.stringify(buildStamp()) },
})
