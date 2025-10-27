/**
 * Vitest 配置
 */

import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局设置
    globals: true,

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'es/',
        'lib/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/examples/**',
        '**/__tests__/**',
      ],
      // 覆盖率阈值
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // 包含的测试文件
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],

    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      'es',
      'lib',
    ],

    // 测试超时时间
    testTimeout: 10000,

    // 钩子超时时间
    hookTimeout: 10000,

    // 并发运行
    threads: true,

    // 隔离测试文件
    isolate: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})


