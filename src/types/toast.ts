/**
 * Toast 相关类型定义
 */

import type { BaseNotificationConfig, NotificationVariant } from './common'

/**
 * Toast 配置选项
 */
export interface ToastOptions extends BaseNotificationConfig {
  /** 图标（字符串、ReactNode 或 VNode） */
  icon?: any
  /** 自定义渲染函数 */
  render?: (item: any) => any
}

/**
 * Promise Toast 消息配置
 */
export interface PromiseMessages<T = any> {
  /** 加载中的消息 */
  loading: string | ((data?: any) => string)
  /** 成功的消息 */
  success: string | ((data: T) => string)
  /** 失败的消息 */
  error: string | ((error: any) => string)
}

/**
 * Promise Toast 配置
 */
export interface PromiseToastOptions<T = any> extends Omit<ToastOptions, 'duration'> {
  /** 加载状态的配置 */
  loading?: ToastOptions
  /** 成功状态的配置 */
  success?: ToastOptions
  /** 失败状态的配置 */
  error?: ToastOptions
}

/**
 * Toast API 接口
 */
export interface ToastAPI {
  /** 显示 Toast */
  (message: string, options?: ToastOptions): string

  /** 成功提示 */
  success: (message: string, options?: ToastOptions) => string

  /** 错误提示 */
  error: (message: string, options?: ToastOptions) => string

  /** 警告提示 */
  warning: (message: string, options?: ToastOptions) => string

  /** 信息提示 */
  info: (message: string, options?: ToastOptions) => string

  /** 加载提示 */
  loading: (message: string, options?: ToastOptions) => string

  /** Promise 绑定 */
  promise: <T = any>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: PromiseToastOptions<T>
  ) => Promise<T>

  /** 关闭指定 Toast */
  dismiss: (id: string) => void

  /** 关闭所有 Toast */
  dismissAll: () => void

  /** 移除指定 Toast */
  remove: (id: string) => void

  /** 更新 Toast */
  update: (id: string, options: Partial<ToastOptions> & { message?: string }) => void
}



