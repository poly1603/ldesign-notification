/**
 * Vue 3 Plugin
 */

import type { App, Plugin } from 'vue'
import type { NotificationManagerConfig } from '../types'
import { NotificationManager } from '../core/manager'
import NotificationContainer from './components/NotificationContainer.vue'

export interface NotificationPluginOptions {
  /** 全局配置 */
  config?: NotificationManagerConfig
  /** 组件名称 */
  componentName?: string
  /** 是否自动挂载容器 */
  autoMount?: boolean
}

/**
 * Notification Plugin
 */
export const NotificationPlugin: Plugin = {
  install(app: App, options: NotificationPluginOptions = {}) {
    const {
      config = {},
      componentName = 'NotificationContainer',
      autoMount = true,
    } = options

    // 创建全局管理器实例
    const manager = new NotificationManager(config)

    // 注册全局组件
    app.component(componentName, NotificationContainer)

    // 提供全局属性
    app.config.globalProperties.$notification = manager
    app.config.globalProperties.$toast = manager.toast
    app.config.globalProperties.$message = manager.message
    app.config.globalProperties.$alert = manager.alert

    // 提供注入键
    app.provide('notification-manager', manager)

    // 自动挂载容器
    if (autoMount) {
      // 在下一个 tick 挂载
      app.runWithContext(() => {
        import { createApp } from 'vue'

        const containerApp = createApp(NotificationContainer)
        const div = document.createElement('div')
        document.body.appendChild(div)
        containerApp.mount(div)
      })
    }
  },
}

// 默认导出
export default NotificationPlugin



