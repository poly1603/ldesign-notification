/**
 * Notification 类型定义
 * @description 通知提醒组件的类型定义
 */

import type {
  BaseNotificationConfig,
  BaseNotificationItem,
  ButtonConfig,
  ContentType,
  IconType,
  NotificationPosition,
} from './common'

/**
 * Notification 配置
 */
export interface NotificationConfig extends BaseNotificationConfig {
  /** 通知标题 */
  title: ContentType
  /** 通知内容 */
  content?: ContentType
  /** 显示位置 */
  position?: NotificationPosition
  /** 是否显示图标 */
  showIcon?: boolean
  /** 自定义图标 */
  icon?: IconType
  /** 操作按钮 */
  actions?: ButtonConfig[]
  /** 底部内容 */
  footer?: ContentType
  /** 自定义关闭按钮内容 */
  closeIcon?: IconType
  /** 是否显示进度条 */
  showProgress?: boolean
  /** 自定义宽度 */
  width?: number | string
  /** 偏移量 */
  offset?: number
}

/**
 * Notification 项
 */
export interface NotificationItem extends BaseNotificationItem {
  /** 通知标题 */
  title: ContentType
  /** 通知内容 */
  content: ContentType | null
  /** 显示位置 */
  position: NotificationPosition
  /** 是否显示图标 */
  showIcon: boolean
  /** 自定义图标 */
  icon: IconType
  /** 操作按钮 */
  actions: ButtonConfig[]
  /** 底部内容 */
  footer: ContentType | null
  /** 自定义关闭按钮内容 */
  closeIcon: IconType | null
  /** 是否显示进度条 */
  showProgress: boolean
  /** 自定义宽度 */
  width: number | string
  /** 偏移量 */
  offset: number
  /** 垂直偏移（用于堆叠） */
  verticalOffset: number
  /** 进度值（0-100） */
  progress: number
}

/**
 * Notification 管理器配置
 */
export interface NotificationManagerConfig {
  /** 默认持续时间 */
  defaultDuration?: number
  /** 默认位置 */
  defaultPosition?: NotificationPosition
  /** 最大显示数量 */
  maxCount?: number
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否显示进度条 */
  showProgress?: boolean
  /** 默认宽度 */
  defaultWidth?: number | string
  /** 消息间距 */
  gap?: number
  /** 基础偏移量 */
  baseOffset?: number
}

/**
 * Notification 快捷方法配置
 */
export type NotificationShortcutConfig = Omit<NotificationConfig, 'title' | 'type'>

/**
 * Notification API
 */
export interface NotificationAPI {
  /** 显示通知 */
  show: (config: NotificationConfig) => string
  /** 成功通知 */
  success: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 错误通知 */
  error: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 警告通知 */
  warning: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 信息通知 */
  info: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 关闭指定通知 */
  close: (id: string) => void
  /** 关闭所有通知 */
  closeAll: () => void
  /** 更新通知 */
  update: (id: string, config: Partial<NotificationConfig>) => void
  /** 配置全局选项 */
  config: (config: NotificationManagerConfig) => void
  /** 获取所有通知 */
  getAll: () => NotificationItem[]
}

/**
 * 默认 Notification 配置
 */
export const DEFAULT_NOTIFICATION_CONFIG: Required<NotificationManagerConfig> = {
  defaultDuration: 4500,
  defaultPosition: 'top-right',
  maxCount: 5,
  showIcon: true,
  showProgress: false,
  defaultWidth: 320,
  gap: 16,
  baseOffset: 24,
}

