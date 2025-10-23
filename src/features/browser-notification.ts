/**
 * 浏览器原生通知功能
 */

import type { NotificationItem, NotificationVariant } from '../types'
import { isBrowser, isNotificationSupported } from '../utils/helpers'

/**
 * 浏览器通知配置
 */
export interface BrowserNotificationConfig {
  /** 通知标题 */
  title: string
  /** 通知内容 */
  body?: string
  /** 图标 */
  icon?: string
  /** 徽章 */
  badge?: string
  /** 标签（用于替换相同标签的通知） */
  tag?: string
  /** 是否静音 */
  silent?: boolean
  /** 是否需要交互 */
  requireInteraction?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 关闭回调 */
  onClose?: () => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * 权限状态
 */
export type NotificationPermission = 'default' | 'granted' | 'denied'

/**
 * 浏览器通知管理器
 */
export class BrowserNotificationManager {
  private enabled = false
  private fallbackCallback?: (item: NotificationItem) => void

  constructor() {
    this.enabled = isBrowser && isNotificationSupported()
  }

  /**
   * 检查是否支持
   */
  isSupported(): boolean {
    return this.enabled
  }

  /**
   * 获取权限状态
   */
  getPermission(): NotificationPermission {
    if (!this.enabled)
      return 'denied'
    return Notification.permission as NotificationPermission
  }

  /**
   * 请求权限
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.enabled) {
      console.warn('[BrowserNotification] Not supported')
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      return permission as NotificationPermission
    }
    catch (error) {
      console.error('[BrowserNotification] Request permission failed:', error)
      return 'denied'
    }
  }

  /**
   * 显示浏览器通知
   */
  async show(config: BrowserNotificationConfig): Promise<Notification | null> {
    // 检查支持
    if (!this.enabled) {
      console.warn('[BrowserNotification] Not supported')
      return null
    }

    // 检查权限
    let permission = this.getPermission()

    if (permission === 'default') {
      permission = await this.requestPermission()
    }

    if (permission !== 'granted') {
      console.warn('[BrowserNotification] Permission denied')
      return null
    }

    // 创建通知
    try {
      const notification = new Notification(config.title, {
        body: config.body,
        icon: config.icon,
        badge: config.badge,
        tag: config.tag,
        silent: config.silent,
        requireInteraction: config.requireInteraction,
      })

      // 绑定事件
      if (config.onClick) {
        notification.onclick = () => {
          config.onClick?.()
          notification.close()
        }
      }

      if (config.onClose) {
        notification.onclose = () => {
          config.onClose?.()
        }
      }

      if (config.onError) {
        notification.onerror = (event) => {
          config.onError?.(new Error('Notification error'))
        }
      }

      return notification
    }
    catch (error) {
      console.error('[BrowserNotification] Create notification failed:', error)
      config.onError?.(error as Error)
      return null
    }
  }

  /**
   * 从 NotificationItem 创建浏览器通知
   */
  async showFromItem(item: NotificationItem): Promise<Notification | null> {
    const iconMap: Record<NotificationVariant, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳',
      default: '🔔',
    }

    const config: BrowserNotificationConfig = {
      title: item.title || item.message,
      body: item.title ? item.message : undefined,
      icon: typeof item.icon === 'string' ? item.icon : iconMap[item.variant],
      tag: item.id,
      onClick: () => item.onClick(item.id),
      onClose: () => item.onClose(item.id),
    }

    const notification = await this.show(config)

    // Fallback 到 Web 通知
    if (!notification && this.fallbackCallback) {
      this.fallbackCallback(item)
    }

    return notification
  }

  /**
   * 设置 Fallback 回调
   */
  setFallback(callback: (item: NotificationItem) => void): void {
    this.fallbackCallback = callback
  }

  /**
   * 关闭所有通知
   */
  closeAll(): void {
    // 浏览器原生通知没有全局关闭 API
    // 需要通过 tag 来管理
    console.warn('[BrowserNotification] closeAll is not supported')
  }
}

// 导出单例
export const browserNotificationManager = new BrowserNotificationManager()



