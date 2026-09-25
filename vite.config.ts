import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// `npm run build` is the production build and ships no sourcemaps;
// `npm run build:debug` produces the same bundle with .map files.
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Sprint Metrics',
        short_name: 'Sprint Metrics',
        description: 'Sprint metrics dashboard for Scrum teams — velocity charts, burn-down, and release forecasts',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/sprint-metrics/',
        start_url: '/sprint-metrics/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  base: '/sprint-metrics/',
  build: {
    outDir: 'dist',
    sourcemap: mode === 'debug',
    rollupOptions: {
      output: {
        // The dashboard renders charts on first paint, so recharts can't be
        // lazy-loaded; splitting it (with its d3/lodash deps) and React into
        // their own chunks keeps them cached across app-only deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(recharts|recharts-scale|react-smooth|d3-[^/]+|internmap|lodash|decimal\.js-light|victory-vendor|fast-equals|eventemitter3|tiny-invariant)\//.test(id)) return 'charts'
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
        },
      },
    },
  },
}))
