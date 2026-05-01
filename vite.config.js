import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  build: {
    rollupOptions: {
      // 🚀 This tells the web-builder (Render) to ignore these mobile-only plugins
      external: [
        '@capacitor/status-bar',
        '@capacitor/core',
        '@capacitor/android'
      ],
    },
  },
})