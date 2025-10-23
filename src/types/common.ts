/**
 * 通用类型定义
 */

/**
 * 通知位置
 */
export type Position =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'center'

/**
 * 通知类型/变体
 */
export type NotificationVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'

/**
 * 堆叠策略
 */
export type StackStrategy = 'overlap' | 'stack' | 'replace' | 'collapse'

/**
 * 动画类型
 */
export type AnimationType =
  | 'fadeIn' | 'fadeOut'
  | 'slideInTop' | 'slideOutTop'
  | 'slideInBottom' | 'slideOutBottom'
  | 'slideInLeft' | 'slideOutLeft'
  | 'slideInRight' | 'slideOutRight'
  | 'zoomIn' | 'zoomOut'
  | 'bounceIn' | 'bounceOut'
  | 'flipIn' | 'flipOut'
  | 'rotateIn' | 'rotateOut'
  | 'custom'

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'auto'

/**
 * 通知优先级
 */
export type Priority = 'high' | 'normal' | 'low'

/**
 * 通知状态
 */
export type NotificationStatus = 'entering' | 'visible' | 'exiting' | 'dismissed'

/**
 * 基础通知配置
 */
export interface BaseNotificationConfig {
  /** 唯一标识 */
  id?: string
  /** 显示位置 */
  position?: Position
  /** 显示时长（毫秒），0 表示不自动关闭 */
  duration?: number
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties | Record<string, string>
  /** 是否可关闭 */
  dismissible?: boolean
  /** 鼠标悬停时暂停 */
  pauseOnHover?: boolean
  /** 失去焦点时暂停 */
  pauseOnFocusLoss?: boolean
  /** 进入动画 */
  enterAnimation?: AnimationType
  /** 退出动画 */
  exitAnimation?: AnimationType
  /** 动画持续时间（毫秒） */
  animationDuration?: number
  /** 优先级 */
  priority?: Priority
  /** 点击回调 */
  onClick?: (id: string) => void
  /** 关闭回调 */
  onClose?: (id: string) => void
  /** 销毁回调 */
  onDestroy?: (id: string) => void
}

/**
 * 通知项（内部数据结构）
 */
export interface NotificationItem extends Required<BaseNotificationConfig> {
  /** 通知类型 */
  type: 'toast' | 'message' | 'notification' | 'alert'
  /** 通知变体 */
  variant: NotificationVariant
  /** 消息内容 */
  message: string
  /** 标题（可选） */
  title?: string
  /** 图标 */
  icon?: any
  /** 自定义渲染函数 */
  render?: any
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 当前状态 */
  status: NotificationStatus
  /** 是否已读 */
  read: boolean
  /** 附加数据 */
  data?: any
  /** 暂停计时器 */
  paused: boolean
  /** 剩余时间 */
  remainingTime: number
}

/**
 * 通知管理器配置
 */
export interface NotificationManagerConfig {
  /** 最大通知数量，0 表示无限制 */
  maxNotifications?: number
  /** 新通知是否在顶部 */
  newestOnTop?: boolean
  /** 防止重复通知 */
  preventDuplicate?: boolean
  /** 默认位置 */
  defaultPosition?: Position
  /** 默认持续时间 */
  defaultDuration?: number
  /** 默认堆叠策略 */
  stackStrategy?: StackStrategy
  /** 默认主题 */
  theme?: Theme
  /** 启用声音 */
  enableSound?: boolean
  /** 启用浏览器通知 */
  enableBrowserNotification?: boolean
  /** 启用历史记录 */
  enableHistory?: boolean
  /** 偏移量 */
  offset?: number
}

/**
 * 事件类型映射
 */
export interface NotificationEventMap {
  created: NotificationItem
  updated: NotificationItem
  dismissed: NotificationItem
  destroyed: string
  'queue-changed': NotificationItem[]
}

/**
 * 事件监听器
 */
export type NotificationEventListener<K extends keyof NotificationEventMap> = (
  data: NotificationEventMap[K]
) => void



