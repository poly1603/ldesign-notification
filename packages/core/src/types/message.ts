/**
 * Message 类型定义
 * @description 消息通知组件的类型定义
 */

import type {
  BaseNotificationConfig,
  BaseNotificationItem,
  ContentType,
  IconType,
  NotificationPosition,
} from './common'

/**
 * Message 配置
 */
export interface MessageConfig extends BaseNotificationConfig {
  /** 消息内容 */
  content: ContentType
  /** 显示位置 */
  position?: NotificationPosition
  /** 是否显示图标 */
  showIcon?: boolean
  /** 自定义图标 */
  icon?: IconType
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 自定义前缀 */
  prefix?: ContentType
  /** 自定义后缀 */
  suffix?: ContentType
  /** 是否居中显示 */
  center?: boolean
  /** 偏移量 */
  offset?: number
  /** 分组 ID */
  groupId?: string
}

/**
 * Message 项
 */
export interface MessageItem extends BaseNotificationItem {
  /** 消息内容 */
  content: ContentType
  /** 显示位置 */
  position: NotificationPosition
  /** 是否显示图标 */
  showIcon: boolean
  /** 自定义图标 */
  icon: IconType
  /** 是否显示关闭按钮 */
  showClose: boolean
  /** 自定义前缀 */
  prefix: ContentType | null
  /** 自定义后缀 */
  suffix: ContentType | null
  /** 是否居中显示 */
  center: boolean
  /** 偏移量 */
  offset: number
  /** 分组 ID */
  groupId: string | null
  /** 垂直偏移（用于堆叠） */
  verticalOffset: number
}

/**
 * Message 管理器配置
 */
export interface MessageManagerConfig {
  /** 默认持续时间 */
  defaultDuration?: number
  /** 默认位置 */
  defaultPosition?: NotificationPosition
  /** 最大显示数量 */
  maxCount?: number
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 消息间距 */
  gap?: number
  /** 基础偏移量 */
  baseOffset?: number
}

/**
 * Message 快捷方法配置
 */
export type MessageShortcutConfig = Omit<MessageConfig, 'content' | 'type'>

/**
 * Message API
 */
export interface MessageAPI {
  /** 显示消息 */
  show: (config: MessageConfig) => string
  /** 成功消息 */
  success: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 错误消息 */
  error: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 警告消息 */
  warning: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 信息消息 */
  info: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 加载消息 */
  loading: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 关闭指定消息 */
  close: (id: string) => void
  /** 关闭所有消息 */
  closeAll: () => void
  /** 配置全局选项 */
  config: (config: MessageManagerConfig) => void
  /** 获取所有消息 */
  getAll: () => MessageItem[]
}

/**
 * 默认 Message 配置
 */
export const DEFAULT_MESSAGE_CONFIG: Required<MessageManagerConfig> = {
  defaultDuration: 3000,
  defaultPosition: 'top-center',
  maxCount: 5,
  showIcon: true,
  showClose: false,
  gap: 16,
  baseOffset: 20,
}

