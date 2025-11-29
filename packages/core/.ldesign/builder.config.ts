/**
 * @ldesign/notification-core 构建配置
 * 框架无关的通知系统核心模块
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 输入配置
  input: 'src/index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
  },

  // 外部依赖
  external: [],

  // 类型声明
  dts: true,

  // Source Map
  sourcemap: true,

  // 不压缩
  minify: false,

  // 清理输出目录
  clean: true,

  // TypeScript 配置
  typescript: {
    target: 'es2020',
  },
})

