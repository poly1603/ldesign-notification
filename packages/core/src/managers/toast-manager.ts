/**
 * Toast 管理器
 * @description 管理 Toast 通知的核心类
 */

import type {
  ContentType,
  NotificationStatus,
  ToastConfig,
  ToastItem,
  ToastManagerConfig,
  ToastShortcutConfig,
} from '../types'
import { DEFAULT_TOAST_CONFIG, DEFAULT_TOAST_ICONS } from '../types/toast'
import { EventEmitter } from '../utils/event-emitter'
import { generateId } from '../utils/id'
import { createPausableTimer, type PausableTimer } from '../utils/timer'

/**
 * Toast 事件类型
 */
export interface ToastEvents {
  show: [item: ToastItem]
  close: [id: string]
  update: [item: ToastItem]
  clear: []
}

/**
 * Toast 管理器类
 */
export class ToastManager extends EventEmitter<ToastEvents> {
  /** 配置 */
  private _config: Required<ToastManagerConfig>

  /** Toast 列表 */
  private _items: Map<string, ToastItem> = new Map()

  /** 定时器映射 */
  private _timers: Map<string, PausableTimer> = new Map()

  /**
   * 创建 Toast 管理器
   * @param config - 初始配置
   */
  constructor(config?: ToastManagerConfig) {
    super()
    this._config = { ...DEFAULT_TOAST_CONFIG, ...config }
  }

  /**
   * 获取所有 Toast
   */
  get items(): ToastItem[] {
    return Array.from(this._items.values())
  }

  /**
   * 获取配置
   */
  get config(): Required<ToastManagerConfig> {
    return { ...this._config }
  }

  /**
   * 显示 Toast
   * @param options - Toast 配置
   * @returns Toast ID
   */
  show(options: ToastConfig): string {
    const id = options.id || generateId('toast')
    const type = options.type || 'info'

    // 检查最大数量限制
    if (this._items.size >= this._config.maxCount) {
      const oldest = this.items[0]
      if (oldest) {
        this.close(oldest.id)
      }
    }

    const item: ToastItem = {
      id,
      type,
      message: options.message,
      title: options.title || '',
      position: options.position || this._config.defaultPosition,
      duration: options.duration ?? this._config.defaultDuration,
      closable: options.closable ?? true,
      showIcon: options.showIcon ?? this._config.showIcon,
      icon: options.icon || DEFAULT_TOAST_ICONS[type],
      pauseOnHover: options.pauseOnHover ?? this._config.pauseOnHover,
      className: options.className || '',
      style: options.style || {},
      animation: {
        enterDuration: options.animation?.enterDuration ?? this._config.enterDuration,
        leaveDuration: options.animation?.leaveDuration ?? this._config.leaveDuration,
        easing: options.animation?.easing ?? 'ease-out',
      },
      createdAt: Date.now(),
      status: 'pending' as NotificationStatus,
      remainingTime: options.duration ?? this._config.defaultDuration,
      pausedAt: null,
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

    // 设置自动关闭定时器
    if (item.duration > 0) {
      const timer = createPausableTimer(() => {
        this.close(id)
      }, item.duration)
      this._timers.set(id, timer)
    }

    this.emit('show', item)
    return id
  }

  /**
   * 成功提示
   */
  success(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'success' })
  }

  /**
   * 错误提示
   */
  error(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'error' })
  }

  /**
   * 警告提示
   */
  warning(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'warning' })
  }

  /**
   * 信息提示
   */
  info(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'info' })
  }

  /**
   * 加载提示
   */
  loading(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({
      ...config,
      message,
      type: 'loading',
      duration: 0,
      closable: false,
    })
  }

  /**
   * 关闭 Toast
   */
  close(id: string): void {
    const item = this._items.get(id)
    if (!item || item.status === 'leaving' || item.status === 'removed')
      return

    // 取消定时器
    this._timers.get(id)?.cancel()
    this._timers.delete(id)

    // 触发离开动画
    this._updateStatus(id, 'leaving')

    setTimeout(() => {
      item.onClose?.()
      this._items.delete(id)
      this._updateStatus(id, 'removed')
      this.emit('close', id)
    }, item.animation.leaveDuration)
  }

  /**
   * 关闭所有 Toast
   */
  closeAll(): void {
    this._items.forEach((_, id) => this.close(id))
    this.emit('clear')
  }

  /**
   * 更新 Toast
   */
  update(id: string, options: Partial<ToastConfig>): void {
    const item = this._items.get(id)
    if (!item)
      return

    Object.assign(item, options)
    this.emit('update', item)
  }

  /** 更新状态 */
  private _updateStatus(id: string, status: NotificationStatus): void {
    const item = this._items.get(id)
    if (item) {
      item.status = status
    }
  }
}

