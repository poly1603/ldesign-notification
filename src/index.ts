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
export { KeyboardManager } from './core/keyboard'
export { DOMPool, domPool } from './core/dom-pool'
export { VirtualScroller } from './core/virtual-scroller'
export type { VirtualScrollerConfig } from './core/virtual-scroller'

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

// 导出默认实例 - 重新导出避免循环依赖
export { notificationManager as notification, notificationManager as default } from './core/manager'

// 导入单例用于便捷导出
import { notificationManager } from './core/manager'
export const toast = notificationManager.toast
export const message = notificationManager.message
export const alert = notificationManager.alert


