import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// NOTE: GitHub Pages deployment (base path / custom domain) is configured
// in a later phase once image paths are finalized — see docs/PROJECT_STATUS.md.
export default defineConfig({
  plugins: [react()],
})
