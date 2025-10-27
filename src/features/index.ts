/**
 * 高级功能导出
 */

// 浏览器通知
export {
  BrowserNotificationManager,
  browserNotificationManager,
} from './browser-notification'

export type {
  BrowserNotificationConfig,
  NotificationPermission,
} from './browser-notification'

// 声音系统
export {
  SoundManager,
  soundManager,
  DEFAULT_SOUNDS,
} from './sound'

export type {
  SoundConfig,
  SoundMap,
} from './sound'

// 历史记录
export {
  HistoryManager,
  historyManager,
} from './history'

export type {
  HistoryConfig,
  HistoryItem,
} from './history'

// 通知中心
export {
  NotificationCenter,
} from './notification-center'

export type {
  NotificationCenterConfig,
  FilterOptions,
} from './notification-center'



