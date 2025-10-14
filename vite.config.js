import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Configurazione standard Vite + React per Vercel
export default defineConfig({
  plugins: [react()],
  base: './', // usa percorsi relativi per gli asset
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 5173,
    host: true
  }
});
