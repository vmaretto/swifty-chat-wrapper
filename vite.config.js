import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: Sostituisci 'your-repo-name' con il nome del tuo repository GitHub
export default defineConfig({
  plugins: [react()],
  base: '/swifty-chat-wrapper/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
