/**
 * Message 相关类型定义
 */

import type { BaseNotificationConfig } from './common'

/**
 * Message 配置选项
 */
export interface MessageOptions extends BaseNotificationConfig {
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 文字是否居中 */
  center?: boolean
  /** 偏移量（像素） */
  offset?: number
  /** 是否使用 HTML 字符串 */
  dangerouslyUseHTMLString?: boolean
  /** 图标 */
  icon?: any
  /** 自定义渲染 */
  render?: (item: any) => any
}

/**
 * Message API 接口
 */
export interface MessageAPI {
  /** 显示 Message */
  (content: string, options?: MessageOptions): string

  /** 成功消息 */
  success: (content: string, options?: MessageOptions) => string

  /** 错误消息 */
  error: (content: string, options?: MessageOptions) => string

  /** 警告消息 */
  warning: (content: string, options?: MessageOptions) => string

  /** 信息消息 */
  info: (content: string, options?: MessageOptions) => string

  /** 关闭指定 Message */
  close: (id: string) => void

  /** 关闭所有 Message */
  closeAll: () => void
}



