import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/sprint-metrics/',
  build: { outDir: 'dist', sourcemap: true },
})
