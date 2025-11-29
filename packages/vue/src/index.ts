/**
 * @ldesign/notification-vue
 * @description LDesign 通知系统 Vue 3 适配器
 * @author LDesign Team
 * @license MIT
 */

// 导入样式
import './styles/index.css'

import type { App } from 'vue'
import { LDrawer, LMessage, LModal, LNotification, LToast } from './components'

// 导出组件
export * from './components'

// 导出 Composables
export * from './composables'

// 从 core 重新导出类型
export type {
  // 通用类型
  AnimationConfig,
  BaseNotificationConfig,
  BaseNotificationItem,
  ButtonConfig,
  ContentType,
  DrawerPlacement,
  IconType,
  NotificationEvents,
  NotificationPosition,
  NotificationStatus,
  NotificationType,
  RenderFunction,
  ThemeConfig,
  // Toast 类型
  ToastConfig,
  ToastItem,
  ToastManagerConfig,
  ToastShortcutConfig,
  // Message 类型
  MessageConfig,
  MessageItem,
  MessageManagerConfig,
  MessageShortcutConfig,
  // Notification 类型
  NotificationConfig,
  NotificationItem,
  NotificationManagerConfig,
  NotificationShortcutConfig,
  // Modal 类型
  AlertConfig,
  ConfirmConfig,
  ModalConfig,
  ModalItem,
  ModalState,
  PromptConfig,
  // Drawer 类型
  DrawerConfig,
  DrawerItem,
  DrawerState,
} from '@ldesign/notification-core'

// 从 core 重新导出管理器
export {
  DrawerManager,
  MessageManager,
  ModalManager,
  NotificationManager,
  ToastManager,
} from '@ldesign/notification-core'

// 从 core 重新导出工具函数
export {
  createEventEmitter,
  createFocusTrap,
  createPausableTimer,
  debounce,
  delay,
  EventEmitter,
  generateId,
  getDrawerSizeStyle,
  getDrawerTransform,
  getPositionStyle,
  isBrowser,
  lockBodyScroll,
  throttle,
} from '@ldesign/notification-core'

/**
 * 安装插件
 * @param app - Vue 应用实例
 */
export function install(app: App): void {
  app.component('LToast', LToast)
  app.component('LMessage', LMessage)
  app.component('LNotification', LNotification)
  app.component('LModal', LModal)
  app.component('LDrawer', LDrawer)
}

/**
 * 默认导出
 */
export default {
  install,
}

