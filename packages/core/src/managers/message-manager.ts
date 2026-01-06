/**
 * Message 管理器
 * @description 管理 Message 消息通知的核心类
 */

import type {
  ContentType,
  MessageConfig,
  MessageItem,
  MessageManagerConfig,
  MessageShortcutConfig,
  NotificationStatus,
} from '../types'
import { DEFAULT_MESSAGE_CONFIG } from '../types/message'
import { DEFAULT_TOAST_ICONS } from '../types/toast'
import { EventEmitter } from '../utils/event-emitter'
import { generateId } from '../utils/id'
import { createPausableTimer, type PausableTimer } from '../utils/timer'

/**
 * Message 事件类型
 */
export interface MessageEvents {
  show: [item: MessageItem]
  close: [id: string]
  clear: []
}

/**
 * Message 管理器类
 */
export class MessageManager extends EventEmitter<MessageEvents> {
  /** 配置 */
  private _config: Required<MessageManagerConfig>

  /** Message 列表 */
  private _items: Map<string, MessageItem> = new Map()

  /** 定时器映射 */
  private _timers: Map<string, PausableTimer> = new Map()

  /**
   * 创建 Message 管理器
   * @param config - 初始配置
   */
  constructor(config?: MessageManagerConfig) {
    super()
    this._config = { ...DEFAULT_MESSAGE_CONFIG, ...config }
  }

  /**
   * 获取所有 Message
   */
  get items(): MessageItem[] {
    return Array.from(this._items.values())
  }

  /**
   * 获取配置
   */
  get config(): Required<MessageManagerConfig> {
    return { ...this._config }
  }

  /**
   * 显示 Message
   * @param options - Message 配置
   * @returns Message ID
   */
  show(options: MessageConfig): string {
    const id = options.id || generateId('message')
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

    const item: MessageItem = {
      id,
      type,
      content: options.content,
      position: options.position || this._config.defaultPosition,
      duration: options.duration ?? this._config.defaultDuration,
      closable: options.closable ?? true,
      showIcon: options.showIcon ?? this._config.showIcon,
      icon: options.icon || DEFAULT_TOAST_ICONS[type],
      showClose: options.showClose ?? this._config.showClose,
      prefix: options.prefix || null,
      suffix: options.suffix || null,
      center: options.center ?? false,
      offset: options.offset ?? this._config.baseOffset,
      groupId: options.groupId || null,
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
   * 成功消息
   */
  success(content: ContentType, config?: MessageShortcutConfig): string {
    return this.show({ ...config, content, type: 'success' })
  }

  /**
   * 错误消息
   */
  error(content: ContentType, config?: MessageShortcutConfig): string {
    return this.show({ ...config, content, type: 'error' })
  }

  /**
   * 警告消息
   */
  warning(content: ContentType, config?: MessageShortcutConfig): string {
    return this.show({ ...config, content, type: 'warning' })
  }

  /**
   * 信息消息
   */
  info(content: ContentType, config?: MessageShortcutConfig): string {
    return this.show({ ...config, content, type: 'info' })
  }

  /**
   * 加载消息
   */
  loading(content: ContentType, config?: MessageShortcutConfig): string {
    return this.show({
      ...config,
      content,
      type: 'loading',
      duration: 0,
      closable: false,
    })
  }

  /**
   * 关闭 Message
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
      this._recalculateOffsets()
      this.emit('close', id)
    }, item.animation.leaveDuration)
  }

  /**
   * 关闭所有 Message
   */
  closeAll(): void {
    this._items.forEach((_, id) => this.close(id))
    this.emit('clear')
  }

  /**
   * 更新 Message
   * @param id - Message ID
   * @param options - 更新的配置
   */
  update(id: string, options: Partial<MessageConfig>): void {
    const item = this._items.get(id)
    if (!item)
      return

    // 更新属性
    if (options.content !== undefined)
      item.content = options.content
    if (options.type !== undefined) {
      item.type = options.type
      item.icon = options.icon || DEFAULT_TOAST_ICONS[options.type]
    }
    if (options.icon !== undefined)
      item.icon = options.icon
    if (options.showClose !== undefined)
      item.showClose = options.showClose
    if (options.className !== undefined)
      item.className = options.className
    if (options.style !== undefined)
      item.style = options.style || {}

    // 触发更新事件（需要添加到 MessageEvents）
  }

  /**
   * 配置全局选项
   * @param config - 要更新的配置
   */
  configure(config: MessageManagerConfig): void {
    Object.assign(this._config, config)
  }

  /**
   * 获取指定 ID 的 Message
   * @param id - Message ID
   * @returns Message 实例或 undefined
   */
  get(id: string): MessageItem | undefined {
    return this._items.get(id)
  }

  /**
   * 检查 Message 是否存在
   * @param id - Message ID
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
    // 取消所有定时器
    this._timers.forEach(timer => timer.cancel())
    this._timers.clear()

    // 清空所有 Message
    this._items.clear()

    // 移除所有事件监听
    this.removeAllListeners()
  }

  /** 计算垂直偏移 */
  private _calculateVerticalOffset(position: string): number {
    const samePositionItems = this.items.filter(item =>
      item.position === position && item.status !== 'leaving' && item.status !== 'removed',
    )
    return this._config.baseOffset + samePositionItems.length * (40 + this._config.gap)
  }

  /** 重新计算所有偏移 */
  private _recalculateOffsets(): void {
    const positions = new Map<string, number>()

    this.items
      .filter(item => item.status !== 'leaving' && item.status !== 'removed')
      .forEach((item) => {
        const currentOffset = positions.get(item.position) ?? this._config.baseOffset
        item.verticalOffset = currentOffset
        positions.set(item.position, currentOffset + 40 + this._config.gap)
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

