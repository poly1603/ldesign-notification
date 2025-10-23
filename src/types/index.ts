/**
 * @ldesign/notification - 类型定义导出
 */

// 通用类型
export type {
  Position,
  NotificationVariant,
  StackStrategy,
  AnimationType,
  Theme,
  Priority,
  NotificationStatus,
  BaseNotificationConfig,
  NotificationItem,
  NotificationManagerConfig,
  NotificationEventMap,
  NotificationEventListener,
} from './common'

// Toast 类型
export type {
  ToastOptions,
  PromiseMessages,
  PromiseToastOptions,
  ToastAPI,
} from './toast'

// Message 类型
export type {
  MessageOptions,
  MessageAPI,
} from './message'

// Notification 类型
export type {
  NotificationAction,
  NotificationConfig,
  NotificationAPIType,
} from './notification'

// Alert 类型
export type {
  AlertIcon,
  AlertInputType,
  AlertButton,
  AlertOptions,
  PromptOptions,
  AlertResult,
  AlertAPI,
} from './alert'



