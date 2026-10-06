import { defineConfig } from 'vite'

// Relative base so the build works from any folder or static host.
export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 100000 },
})
