import { defineConfig } from 'vite'
import react from '@vitejs/react-refresh'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none", // Helps with image loading too!
    },
  },
})