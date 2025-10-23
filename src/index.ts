/**
 * @ldesign/notification - 通知系统主入口
 */

// 导入样式
import './styles/index.css'

// 导出类型
export type * from './types'

// 导出核心类
export { NotificationManager, notificationManager } from './core/manager'
export { NotificationQueue } from './core/queue'
export { PositionManager } from './core/position'
export { AnimationEngine } from './core/animation'
export { StackManager } from './core/stack'

// 导出渲染器
export {
  BaseRenderer,
  ToastRenderer,
  MessageRenderer,
  NotificationRenderer,
  AlertRenderer,
} from './renderers'

export type { RendererConfig } from './renderers'

// 导出工具函数
export {
  generateId,
  debounce,
  throttle,
  deepMerge,
  isBrowser,
  isNotificationSupported,
} from './utils/helpers'

// 导出高级功能
export {
  BrowserNotificationManager,
  browserNotificationManager,
  SoundManager,
  soundManager,
  DEFAULT_SOUNDS,
  HistoryManager,
  historyManager,
} from './features'

export type {
  BrowserNotificationConfig,
  NotificationPermission,
  SoundConfig,
  SoundMap,
  HistoryConfig,
  HistoryItem,
} from './features'

// 导出默认实例
export const notification = notificationManager
export const toast = notificationManager.toast
export const message = notificationManager.message
export const alert = notificationManager.alert

// 默认导出
export default notificationManager


