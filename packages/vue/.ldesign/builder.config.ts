/**
 * @ldesign/notification-vue Builder Configuration
 *
 * 使用 TDesign 风格的构建配置
 * 生成 es/、esm/、cjs/、dist/ 四种产物
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 输入配置 - 使用主入口文件
  input: 'src/index.ts',

  // 输出配置 - TDesign 风格
  output: {
    // ES 模块 - 使用 .mjs + 编译后的 CSS
    es: {
      dir: 'es',
      sourcemap: true,
    },

    // ESM 模块 - 使用 .js + 保留样式源文件
    esm: {
      dir: 'esm',
      sourcemap: true,
    },

    // CJS 模块 - 忽略样式
    cjs: {
      dir: 'cjs',
      sourcemap: true,
    },

    // UMD 模块 - 单个 CSS
    umd: {
      dir: 'dist',
      name: 'LDesignNotification',
      globals: {
        vue: 'Vue',
        '@ldesign/notification-core': 'LDesignNotificationCore',
      },
    },
  },

  // 外部依赖
  external: ['vue', '@ldesign/notification-core'],

  // 全局变量映射 (UMD 使用)
  globals: {
    vue: 'Vue',
    '@ldesign/notification-core': 'LDesignNotificationCore',
  },

  // 打包器
  bundler: 'rollup',

  // 类型声明
  dts: {
    enabled: true,
  },
})
