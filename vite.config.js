import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base matches the GitHub Pages project-site path for this repo
// (https://<owner>.github.io/leo-business-advisory/). If a custom domain
// is set up later, change this back to '/' — see README.md's deployment
// section.
export default defineConfig({
  plugins: [react()],
  base: '/leo-business-advisory/',
})
