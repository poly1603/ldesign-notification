/**
 * Toast 管理器
 * @description 管理 Toast 通知的核心类
 * @module @ldesign/notification-core/managers/toast-manager
 */

import type {
  ContentType,
  NotificationStatus,
  PromiseMessages,
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
 * @description 定义 Toast 管理器发出的所有事件
 */
export interface ToastEvents {
  /** 显示 Toast 时触发 */
  show: [item: ToastItem]
  /** 关闭 Toast 时触发 */
  close: [id: string]
  /** 更新 Toast 时触发 */
  update: [item: ToastItem]
  /** 清空所有 Toast 时触发 */
  clear: []
  /** 暂停计时器时触发 */
  pause: [id: string]
  /** 恢复计时器时触发 */
  resume: [id: string]
}

/**
 * Toast 管理器类
 * @description 提供 Toast 通知的创建、更新、关闭等全部功能
 * @example
 * ```ts
 * const toast = new ToastManager()
 *
 * // 基础用法
 * toast.success('保存成功')
 * toast.error('操作失败')
 *
 * // Promise 绑定
 * await toast.promise(fetchData(), {
 *   loading: '加载中...',
 *   success: '加载成功',
 *   error: '加载失败'
 * })
 * ```
 */
export class ToastManager extends EventEmitter<ToastEvents> {
  /** 配置 */
  private _config: Required<ToastManagerConfig>

  /** Toast 列表 */
  private _items: Map<string, ToastItem> = new Map()

  /** 定时器映射 */
  private _timers: Map<string, PausableTimer> = new Map()

  /** 内容哈希映射（用于去重） */
  private _contentHashes: Map<string, string> = new Map()

  /** 是否已销毁 */
  private _disposed = false

  /**
   * 创建 Toast 管理器
   * @param config - 初始配置
   * @example
   * ```ts
   * const toast = new ToastManager({
   *   defaultDuration: 5000,
   *   maxCount: 3,
   *   defaultPosition: 'top-right'
   * })
   * ```
   */
  constructor(config?: ToastManagerConfig) {
    super()
    this._config = { ...DEFAULT_TOAST_CONFIG, ...config }
  }

  /**
   * 获取所有 Toast
   * @returns Toast 列表的副本
   */
  get items(): ToastItem[] {
    return Array.from(this._items.values())
  }

  /**
   * 获取配置
   * @returns 配置的副本
   */
  get config(): Required<ToastManagerConfig> {
    return { ...this._config }
  }

  /**
   * 获取当前 Toast 数量
   */
  get count(): number {
    return this._items.size
  }

  /**
   * 是否已销毁
   */
  get isDisposed(): boolean {
    return this._disposed
  }

  /**
   * 显示 Toast
   * @param options - Toast 配置
   * @returns Toast ID
   * @example
   * ```ts
   * const id = toast.show({
   *   message: '自定义消息',
   *   type: 'info',
   *   duration: 5000,
   *   position: 'top-right'
   * })
   * ```
   */
  show(options: ToastConfig): string {
    if (this._disposed) {
      console.warn('ToastManager has been disposed')
      return ''
    }

    const id = options.id || generateId('toast')
    const type = options.type || 'info'

    // 检查最大数量限制
    if (this._items.size >= this._config.maxCount) {
      const oldest = this.items[0]
      if (oldest) {
        this.close(oldest.id)
      }
    }

    const duration = options.duration ?? this._config.defaultDuration

    const item: ToastItem = {
      id,
      type,
      message: options.message,
      title: options.title || '',
      position: options.position || this._config.defaultPosition,
      duration,
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
      remainingTime: duration,
      pausedAt: null,
      onClose: options.onClose,
      onClick: options.onClick,
    }

    this._items.set(id, item)

    // 触发进入动画
    requestAnimationFrame(() => {
      this._updateStatus(id, 'entering')
      setTimeout(() => {
        this._updateStatus(id, 'visible')
      }, item.animation.enterDuration)
    })

    // 设置自动关闭定时器
    if (duration > 0) {
      const timer = createPausableTimer(() => {
        this.close(id)
      }, duration)
      this._timers.set(id, timer)
    }

    this.emit('show', item)
    return id
  }

  /**
   * 成功提示
   * @param message - 消息内容
   * @param config - 可选配置
   * @returns Toast ID
   */
  success(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'success' })
  }

  /**
   * 错误提示
   * @param message - 消息内容
   * @param config - 可选配置
   * @returns Toast ID
   */
  error(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'error' })
  }

  /**
   * 警告提示
   * @param message - 消息内容
   * @param config - 可选配置
   * @returns Toast ID
   */
  warning(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'warning' })
  }

  /**
   * 信息提示
   * @param message - 消息内容
   * @param config - 可选配置
   * @returns Toast ID
   */
  info(message: ContentType, config?: ToastShortcutConfig): string {
    return this.show({ ...config, message, type: 'info' })
  }

  /**
   * 加载提示
   * @param message - 消息内容
   * @param config - 可选配置
   * @returns Toast ID
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
   * Promise 绑定
   * @description 自动根据 Promise 状态显示 loading/success/error
   * @param promise - 要绑定的 Promise
   * @param messages - 各状态的消息配置
   * @param config - 可选配置
   * @returns Promise 的原始结果
   * @example
   * ```ts
   * const data = await toast.promise(
   *   fetch('/api/data'),
   *   {
   *     loading: '加载中...',
   *     success: (data) => `成功加载 ${data.count} 条数据`,
   *     error: (err) => `加载失败: ${err.message}`
   *   }
   * )
   * ```
   */
  async promise<T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    config?: ToastShortcutConfig,
  ): Promise<T> {
    // 显示 loading
    const loadingMessage = typeof messages.loading === 'function'
      ? messages.loading()
      : messages.loading
    const id = this.loading(loadingMessage as ContentType, config)

    try {
      const result = await promise

      // 显示 success
      const successMessage = typeof messages.success === 'function'
        ? messages.success(result)
        : messages.success
      this.update(id, {
        message: successMessage as ContentType,
        type: 'success',
        duration: config?.duration ?? this._config.defaultDuration,
        closable: true,
      })

      // 重新设置定时器
      this._resetTimer(id, config?.duration ?? this._config.defaultDuration)

      return result
    }
    catch (error) {
      // 显示 error
      const errorMessage = typeof messages.error === 'function'
        ? messages.error(error)
        : messages.error
      this.update(id, {
        message: errorMessage as ContentType,
        type: 'error',
        duration: config?.duration ?? this._config.defaultDuration,
        closable: true,
      })

      // 重新设置定时器
      this._resetTimer(id, config?.duration ?? this._config.defaultDuration)

      throw error
    }
  }

  /**
   * 暂停 Toast 计时器
   * @param id - Toast ID
   */
  pause(id: string): void {
    const timer = this._timers.get(id)
    const item = this._items.get(id)

    if (timer && item && !timer.isPaused()) {
      timer.pause()
      item.pausedAt = Date.now()
      item.remainingTime = timer.remaining()
      this.emit('pause', id)
    }
  }

  /**
   * 恢复 Toast 计时器
   * @param id - Toast ID
   */
  resume(id: string): void {
    const timer = this._timers.get(id)
    const item = this._items.get(id)

    if (timer && item && timer.isPaused()) {
      timer.resume()
      item.pausedAt = null
      this.emit('resume', id)
    }
  }

  /**
   * 关闭 Toast
   * @param id - Toast ID
   */
  close(id: string): void {
    const item = this._items.get(id)
    if (!item || item.status === 'leaving' || item.status === 'removed')
      return

    // 取消定时器
    this._timers.get(id)?.cancel()
    this._timers.delete(id)

    // 清理哈希映射
    this._contentHashes.delete(id)

    // 触发离开动画
    this._updateStatus(id, 'leaving')

    setTimeout(() => {
      item.onClose?.()
      this._items.delete(id)
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
   * 批量关闭
   * @param ids - 要关闭的 Toast ID 列表
   */
  closeMultiple(ids: string[]): void {
    ids.forEach(id => this.close(id))
  }

  /**
   * 更新 Toast
   * @param id - Toast ID
   * @param options - 更新的配置
   */
  update(id: string, options: Partial<ToastConfig>): void {
    const item = this._items.get(id)
    if (!item)
      return

    // 更新属性
    if (options.message !== undefined)
      item.message = options.message
    if (options.type !== undefined) {
      item.type = options.type
      item.icon = options.icon || DEFAULT_TOAST_ICONS[options.type]
    }
    if (options.title !== undefined)
      item.title = options.title
    if (options.icon !== undefined)
      item.icon = options.icon
    if (options.closable !== undefined)
      item.closable = options.closable
    if (options.className !== undefined)
      item.className = options.className
    if (options.style !== undefined)
      item.style = options.style || {}

    this.emit('update', item)
  }

  /**
   * 配置管理器
   * @param config - 要更新的配置
   */
  configure(config: Partial<ToastManagerConfig>): void {
    Object.assign(this._config, config)
  }

  /**
   * 获取指定 ID 的 Toast
   * @param id - Toast ID
   * @returns Toast 实例或 undefined
   */
  get(id: string): ToastItem | undefined {
    return this._items.get(id)
  }

  /**
   * 检查 Toast 是否存在
   * @param id - Toast ID
   * @returns 是否存在
   */
  has(id: string): boolean {
    return this._items.has(id)
  }

  /**
   * 销毁管理器
   * @description 清理所有资源，取消所有定时器
   */
  dispose(): void {
    if (this._disposed)
      return

    // 取消所有定时器
    this._timers.forEach(timer => timer.cancel())
    this._timers.clear()

    // 清空所有 Toast
    this._items.clear()
    this._contentHashes.clear()

    // 移除所有事件监听
    this.removeAllListeners()

    this._disposed = true
  }

  /**
   * 重置定时器
   * @param id - Toast ID
   * @param duration - 新的持续时间
   */
  private _resetTimer(id: string, duration: number): void {
    // 取消旧的定时器
    this._timers.get(id)?.cancel()
    this._timers.delete(id)

    // 设置新的定时器
    if (duration > 0) {
      const timer = createPausableTimer(() => {
        this.close(id)
      }, duration)
      this._timers.set(id, timer)
    }
  }

  /**
   * 更新状态
   * @param id - Toast ID
   * @param status - 新状态
   */
  private _updateStatus(id: string, status: NotificationStatus): void {
    const item = this._items.get(id)
    if (item) {
      item.status = status
    }
  }
}

