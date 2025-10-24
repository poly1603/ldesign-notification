import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/notification/vue': resolve(__dirname, '../../src/vue/index.ts'),
      '@ldesign/notification/styles': resolve(__dirname, '../../src/styles/index.css'),
      '@ldesign/notification': resolve(__dirname, '../../src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@ldesign/notification'],
  },
  server: {
    port: 3008,
    open: true,
    host: true
  }
})

