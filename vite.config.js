import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so the built app loads from disk inside Electron
  base: './',
  plugins: [react()],
})
