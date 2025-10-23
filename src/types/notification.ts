/**
 * Notification 相关类型定义
 */

import type { BaseNotificationConfig, NotificationVariant } from './common'

/**
 * Notification 操作按钮
 */
export interface NotificationAction {
  /** 按钮文本 */
  text: string
  /** 点击回调 */
  onClick: (id: string) => void
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'danger'
  /** 是否关闭通知 */
  closeOnClick?: boolean
}

/**
 * Notification 配置选项
 */
export interface NotificationConfig extends BaseNotificationConfig {
  /** 标题 */
  title?: string
  /** 消息内容 */
  message: string
  /** 类型 */
  type?: NotificationVariant
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 图标 */
  icon?: any
  /** 操作按钮 */
  actions?: NotificationAction[]
  /** 自定义类名 */
  customClass?: string
  /** 偏移量 */
  offset?: number
  /** 渲染到的容器 */
  appendTo?: HTMLElement
  /** 自定义渲染 */
  render?: (item: any) => any
}

/**
 * Notification API 接口
 */
export interface NotificationAPIType {
  /** 打开通知 */
  (config: NotificationConfig): string

  /** 打开通知（别名） */
  open: (config: NotificationConfig) => string

  /** 成功通知 */
  success: (config: Omit<NotificationConfig, 'type'>) => string

  /** 错误通知 */
  error: (config: Omit<NotificationConfig, 'type'>) => string

  /** 警告通知 */
  warning: (config: Omit<NotificationConfig, 'type'>) => string

  /** 信息通知 */
  info: (config: Omit<NotificationConfig, 'type'>) => string

  /** 关闭通知 */
  close: (id: string) => void

  /** 销毁所有通知 */
  destroy: () => void
}



