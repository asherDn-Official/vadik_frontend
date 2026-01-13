import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    allowedHosts: [
      "0e907ea7340c.ngrok-free.app"
    ],
  },
})
