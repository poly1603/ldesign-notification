/**
 * Toast 类型定义
 * @description 轻提示组件的类型定义
 */

import type {
  BaseNotificationConfig,
  BaseNotificationItem,
  ContentType,
  IconType,
  NotificationPosition,
  NotificationType,
} from './common'

/**
 * Toast 配置
 */
export interface ToastConfig extends BaseNotificationConfig {
  /** 消息内容 */
  message: ContentType
  /** 标题 */
  title?: string
  /** 显示位置 */
  position?: NotificationPosition
  /** 是否显示图标 */
  showIcon?: boolean
  /** 自定义图标 */
  icon?: IconType
  /** 悬停时暂停自动关闭 */
  pauseOnHover?: boolean
}

/**
 * Toast 项
 */
export interface ToastItem extends BaseNotificationItem {
  /** 消息内容 */
  message: ContentType
  /** 标题 */
  title: string
  /** 显示位置 */
  position: NotificationPosition
  /** 是否显示图标 */
  showIcon: boolean
  /** 自定义图标 */
  icon: IconType
  /** 悬停时暂停自动关闭 */
  pauseOnHover: boolean
  /** 剩余时间 */
  remainingTime: number
  /** 暂停开始时间 */
  pausedAt: number | null
}

/**
 * Toast 管理器配置
 */
export interface ToastManagerConfig {
  /** 默认持续时间 */
  defaultDuration?: number
  /** 默认位置 */
  defaultPosition?: NotificationPosition
  /** 最大显示数量 */
  maxCount?: number
  /** 是否显示图标 */
  showIcon?: boolean
  /** 悬停时暂停自动关闭 */
  pauseOnHover?: boolean
  /** 进入动画时间 */
  enterDuration?: number
  /** 离开动画时间 */
  leaveDuration?: number
}

/**
 * Toast 快捷方法配置
 */
export type ToastShortcutConfig = Omit<ToastConfig, 'message' | 'type'>

/**
 * Toast API
 */
export interface ToastAPI {
  /** 显示 Toast */
  show: (config: ToastConfig) => string
  /** 成功提示 */
  success: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 错误提示 */
  error: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 警告提示 */
  warning: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 信息提示 */
  info: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 加载提示 */
  loading: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 关闭指定 Toast */
  close: (id: string) => void
  /** 关闭所有 Toast */
  closeAll: () => void
  /** 更新 Toast */
  update: (id: string, config: Partial<ToastConfig>) => void
  /** 配置全局选项 */
  config: (config: ToastManagerConfig) => void
  /** 获取所有 Toast */
  getAll: () => ToastItem[]
}

/**
 * 默认图标映射
 */
export const DEFAULT_TOAST_ICONS: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  loading: '⟳',
}

/**
 * 默认 Toast 配置
 */
export const DEFAULT_TOAST_CONFIG: Required<ToastManagerConfig> = {
  defaultDuration: 3000,
  defaultPosition: 'top-center',
  maxCount: 5,
  showIcon: true,
  pauseOnHover: true,
  enterDuration: 300,
  leaveDuration: 300,
}

