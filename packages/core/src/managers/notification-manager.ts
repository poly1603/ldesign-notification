/**
 * Notification 管理器
 * @description 管理 Notification 通知提醒的核心类
 */

import type {
  ContentType,
  NotificationConfig,
  NotificationItem,
  NotificationManagerConfig,
  NotificationShortcutConfig,
  NotificationStatus,
} from '../types'
import { DEFAULT_NOTIFICATION_CONFIG } from '../types/notification'
import { DEFAULT_TOAST_ICONS } from '../types/toast'
import { EventEmitter } from '../utils/event-emitter'
import { generateId } from '../utils/id'
import { createPausableTimer, type PausableTimer } from '../utils/timer'

/**
 * Notification 事件类型
 */
export interface NotificationEvents {
  show: [item: NotificationItem]
  close: [id: string]
  update: [item: NotificationItem]
  clear: []
}

/**
 * Notification 管理器类
 */
export class NotificationManager extends EventEmitter<NotificationEvents> {
  /** 配置 */
  private _config: Required<NotificationManagerConfig>

  /** Notification 列表 */
  private _items: Map<string, NotificationItem> = new Map()

  /** 定时器映射 */
  private _timers: Map<string, PausableTimer> = new Map()

  /** 进度更新定时器 */
  private _progressTimers: Map<string, ReturnType<typeof setInterval>> = new Map()

  /**
   * 创建 Notification 管理器
   * @param config - 初始配置
   */
  constructor(config?: NotificationManagerConfig) {
    super()
    this._config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config }
  }

  /**
   * 获取所有 Notification
   */
  get items(): NotificationItem[] {
    return Array.from(this._items.values())
  }

  /**
   * 获取配置
   */
  get config(): Required<NotificationManagerConfig> {
    return { ...this._config }
  }

  /**
   * 显示 Notification
   * @param options - Notification 配置
   * @returns Notification ID
   */
  show(options: NotificationConfig): string {
    const id = options.id || generateId('notification')
    const type = options.type || 'info'

    // 检查最大数量限制
    if (this._items.size >= this._config.maxCount) {
      const oldest = this.items[0]
      if (oldest) {
        this.close(oldest.id)
      }
    }

    // 计算垂直偏移
    const verticalOffset = this._calculateVerticalOffset(options.position || this._config.defaultPosition)
    const duration = options.duration ?? this._config.defaultDuration

    const item: NotificationItem = {
      id,
      type,
      title: options.title,
      content: options.content || null,
      position: options.position || this._config.defaultPosition,
      duration,
      closable: options.closable ?? true,
      showIcon: options.showIcon ?? this._config.showIcon,
      icon: options.icon || DEFAULT_TOAST_ICONS[type],
      actions: options.actions || [],
      footer: options.footer || null,
      closeIcon: options.closeIcon || null,
      showProgress: options.showProgress ?? this._config.showProgress,
      width: options.width ?? this._config.defaultWidth,
      offset: options.offset ?? this._config.baseOffset,
      className: options.className || '',
      style: options.style || {},
      animation: {
        enterDuration: 300,
        leaveDuration: 300,
        easing: 'ease-out',
      },
      createdAt: Date.now(),
      status: 'pending' as NotificationStatus,
      verticalOffset,
      progress: 100,
      onClose: options.onClose,
      onClick: options.onClick,
    }

    this._items.set(id, item)

    // 触发进入动画
    setTimeout(() => {
      this._updateStatus(id, 'entering')
      setTimeout(() => {
        this._updateStatus(id, 'visible')
      }, item.animation.enterDuration)
    }, 0)

    // 设置自动关闭定时器和进度条
    if (duration > 0) {
      const timer = createPausableTimer(() => {
        this.close(id)
      }, duration)
      this._timers.set(id, timer)

      // 进度条更新
      if (item.showProgress) {
        const startTime = Date.now()
        const progressTimer = setInterval(() => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
          item.progress = remaining
          if (remaining <= 0) {
            clearInterval(progressTimer)
          }
        }, 50)
        this._progressTimers.set(id, progressTimer)
      }
    }

    this.emit('show', item)
    return id
  }

  /**
   * 成功通知
   */
  success(title: ContentType, config?: NotificationShortcutConfig): string {
    return this.show({ ...config, title, type: 'success' })
  }

  /**
   * 错误通知
   */
  error(title: ContentType, config?: NotificationShortcutConfig): string {
    return this.show({ ...config, title, type: 'error' })
  }

  /**
   * 警告通知
   */
  warning(title: ContentType, config?: NotificationShortcutConfig): string {
    return this.show({ ...config, title, type: 'warning' })
  }

  /**
   * 信息通知
   */
  info(title: ContentType, config?: NotificationShortcutConfig): string {
    return this.show({ ...config, title, type: 'info' })
  }

  /**
   * 关闭 Notification
   */
  close(id: string): void {
    const item = this._items.get(id)
    if (!item || item.status === 'leaving' || item.status === 'removed')
      return

    // 取消定时器
    this._timers.get(id)?.cancel()
    this._timers.delete(id)

    // 取消进度定时器
    const progressTimer = this._progressTimers.get(id)
    if (progressTimer) {
      clearInterval(progressTimer)
      this._progressTimers.delete(id)
    }

    // 触发离开动画
    this._updateStatus(id, 'leaving')

    setTimeout(() => {
      item.onClose?.()
      this._items.delete(id)
      this._updateStatus(id, 'removed')
      this._recalculateOffsets()
      this.emit('close', id)
    }, item.animation.leaveDuration)
  }

  /**
   * 关闭所有 Notification
   */
  closeAll(): void {
    this._items.forEach((_, id) => this.close(id))
    this.emit('clear')
  }

  /**
   * 更新 Notification
   */
  update(id: string, options: Partial<NotificationConfig>): void {
    const item = this._items.get(id)
    if (!item)
      return

    Object.assign(item, options)
    this.emit('update', item)
  }

  /**
   * 配置全局选项
   */
  configure(config: NotificationManagerConfig): void {
    Object.assign(this._config, config)
  }

  /** 计算垂直偏移 */
  private _calculateVerticalOffset(position: string): number {
    const samePositionItems = this.items.filter(item =>
      item.position === position && item.status !== 'leaving' && item.status !== 'removed',
    )
    return this._config.baseOffset + samePositionItems.length * (80 + this._config.gap)
  }

  /** 重新计算所有偏移 */
  private _recalculateOffsets(): void {
    const positions = new Map<string, number>()

    this.items
      .filter(item => item.status !== 'leaving' && item.status !== 'removed')
      .forEach((item) => {
        const currentOffset = positions.get(item.position) ?? this._config.baseOffset
        item.verticalOffset = currentOffset
        positions.set(item.position, currentOffset + 80 + this._config.gap)
      })
  }

  /** 更新状态 */
  private _updateStatus(id: string, status: NotificationStatus): void {
    const item = this._items.get(id)
    if (item) {
      item.status = status
    }
  }
}

