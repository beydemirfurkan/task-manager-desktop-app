import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  // Configure Electron files to be built separately
  electron: {
    build: [
      {
        entry: 'electron/main.js',
        outDir: 'dist-electron',
      },
      {
        entry: 'electron/preload.js',
        outDir: 'dist-electron',
      }
    ]
  }
})
