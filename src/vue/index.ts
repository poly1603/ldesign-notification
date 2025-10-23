/**
 * Vue 3 集成导出
 */

// 导出 Plugin
export { NotificationPlugin, default } from './plugin'
export type { NotificationPluginOptions } from './plugin'

// 导出 Composables
export {
  useNotification,
  useToast,
  useMessage,
  useAlert,
  provideNotificationManager,
  injectNotificationManager,
} from './composables/useNotification'

// 导出组件
export { default as NotificationContainer } from './components/NotificationContainer.vue'
export { default as ToastItem } from './components/ToastItem.vue'
export { default as MessageItem } from './components/MessageItem.vue'
export { default as NotificationItem } from './components/NotificationItem.vue'
export { default as AlertDialog } from './components/AlertDialog.vue'

// 重新导出类型
export type * from '../types'



