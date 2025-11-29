/**
 * 通用类型定义
 * @description 通知系统的公共类型定义
 */

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading'

/**
 * 通知位置
 */
export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center'

/**
 * 抽屉方向
 */
export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'

/**
 * 通知状态
 */
export type NotificationStatus = 'pending' | 'entering' | 'visible' | 'leaving' | 'removed'

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 进入动画持续时间（毫秒） */
  enterDuration?: number
  /** 离开动画持续时间（毫秒） */
  leaveDuration?: number
  /** 动画缓动函数 */
  easing?: string
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题模式 */
  mode?: 'light' | 'dark' | 'auto'
  /** 主色调 */
  primaryColor?: string
  /** 成功色 */
  successColor?: string
  /** 错误色 */
  errorColor?: string
  /** 警告色 */
  warningColor?: string
  /** 信息色 */
  infoColor?: string
  /** 圆角大小 */
  borderRadius?: string
  /** 阴影 */
  boxShadow?: string
}

/**
 * 基础通知配置
 */
export interface BaseNotificationConfig {
  /** 唯一标识 */
  id?: string
  /** 通知类型 */
  type?: NotificationType
  /** 持续时间（毫秒），0 表示不自动关闭 */
  duration?: number
  /** 是否可关闭 */
  closable?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: Record<string, string | number>
  /** 动画配置 */
  animation?: AnimationConfig
  /** 关闭回调 */
  onClose?: () => void
  /** 点击回调 */
  onClick?: () => void
}

/**
 * 基础通知项
 */
export interface BaseNotificationItem extends Required<Omit<BaseNotificationConfig, 'onClose' | 'onClick' | 'animation' | 'style'>> {
  /** 创建时间戳 */
  createdAt: number
  /** 当前状态 */
  status: NotificationStatus
  /** 动画配置 */
  animation: Required<AnimationConfig>
  /** 自定义样式 */
  style: Record<string, string | number>
  /** 关闭回调 */
  onClose?: () => void
  /** 点击回调 */
  onClick?: () => void
}

/**
 * 渲染函数类型 */
export type RenderFunction = () => unknown

/**
 * 内容类型
 */
export type ContentType = string | RenderFunction

/**
 * 图标类型
 */
export type IconType = string | RenderFunction

/**
 * 按钮配置
 */
export interface ButtonConfig {
  /** 按钮文本 */
  text: string
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'text' | 'danger'
  /** 点击回调 */
  onClick?: () => void | Promise<void>
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 事件发射器接口
 */
export interface EventEmitter<T extends Record<string, unknown[]>> {
  on<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void
  off<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void
  emit<K extends keyof T>(event: K, ...args: T[K]): void
}

/**
 * 通知事件类型
 */
export interface NotificationEvents {
  show: [id: string]
  close: [id: string]
  update: [id: string]
  clear: []
}

