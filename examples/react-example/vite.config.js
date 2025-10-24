import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/notification/react': resolve(__dirname, '../../src/react/index.ts'),
      '@ldesign/notification/styles': resolve(__dirname, '../../src/styles/index.css'),
      '@ldesign/notification': resolve(__dirname, '../../src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@ldesign/notification'],
  },
  server: {
    port: 3002,
    open: true,
    host: true
  }
})

