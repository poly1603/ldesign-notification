import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/notification/styles': resolve(__dirname, '../../src/styles/index.css'),
      '@ldesign/notification': resolve(__dirname, '../../src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@ldesign/notification'],
  },
  server: {
    port: 3001,
    open: true,
    host: true
  }
})

