/**
 * 通知管理器 - 核心类
 */

import type {
  AlertAPI,
  AlertOptions,
  AlertResult,
  MessageAPI,
  MessageOptions,
  NotificationAPIType,
  NotificationConfig,
  NotificationEventListener,
  NotificationEventMap,
  NotificationItem,
  NotificationManagerConfig,
  NotificationVariant,
  PromiseMessages,
  PromiseToastOptions,
  PromptOptions,
  ToastAPI,
  ToastOptions,
} from '../types'
import { EventBus } from '@ldesign/shared'
import { AnimationEngine } from './animation'
import { PositionManager } from './position'
import { NotificationQueue } from './queue'
import { StackManager } from './stack'
import { deepMerge, generateId, isSameMessage } from '../utils/helpers'

/**
 * 通知管理器类
 */
export class NotificationManager {
  private queue: NotificationQueue
  private positionManager: PositionManager
  private animationEngine: AnimationEngine
  private stackManager: StackManager
  private eventBus: EventBus
  private config: Required<NotificationManagerConfig>
  private timers: Map<string, number> = new Map()

  constructor(config: NotificationManagerConfig = {}) {
    this.config = deepMerge(
      {
        maxNotifications: 0,
        newestOnTop: true,
        preventDuplicate: false,
        defaultPosition: 'top-right' as const,
        defaultDuration: 3000,
        stackStrategy: 'stack' as const,
        theme: 'light' as const,
        enableSound: false,
        enableBrowserNotification: false,
        enableHistory: false,
        offset: 16,
      },
      config
    )

    this.queue = new NotificationQueue(this.config.maxNotifications)
    this.positionManager = new PositionManager(this.config.offset, this.config.stackStrategy)
    this.animationEngine = new AnimationEngine()
    this.stackManager = new StackManager(this.config.stackStrategy)
    this.eventBus = new EventBus()
  }

  /**
   * Toast API
   */
  get toast(): ToastAPI {
    const toast = (message: string, options?: ToastOptions): string => {
      return this.createNotification('toast', 'default', message, options)
    }

    toast.success = (message: string, options?: ToastOptions): string => {
      return this.createNotification('toast', 'success', message, options)
    }

    toast.error = (message: string, options?: ToastOptions): string => {
      return this.createNotification('toast', 'error', message, options)
    }

    toast.warning = (message: string, options?: ToastOptions): string => {
      return this.createNotification('toast', 'warning', message, options)
    }

    toast.info = (message: string, options?: ToastOptions): string => {
      return this.createNotification('toast', 'info', message, options)
    }

    toast.loading = (message: string, options?: ToastOptions): string => {
      return this.createNotification('toast', 'loading', message, {
        ...options,
        duration: 0, // loading 不自动关闭
      })
    }

    toast.promise = async <T = any>(
      promise: Promise<T>,
      messages: PromiseMessages<T>,
      options?: PromiseToastOptions<T>
    ): Promise<T> => {
      const loadingMsg = typeof messages.loading === 'function'
        ? messages.loading()
        : messages.loading

      const id = this.createNotification('toast', 'loading', loadingMsg, {
        ...options,
        ...options?.loading,
        duration: 0,
      })

      try {
        const result = await promise
        const successMsg = typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success

        this.update(id, {
          message: successMsg,
          variant: 'success',
          duration: options?.success?.duration || this.config.defaultDuration,
        })

        return result
      }
      catch (error) {
        const errorMsg = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error

        this.update(id, {
          message: errorMsg,
          variant: 'error',
          duration: options?.error?.duration || this.config.defaultDuration,
        })

        throw error
      }
    }

    toast.dismiss = (id: string): void => {
      this.dismiss(id)
    }

    toast.dismissAll = (): void => {
      this.dismissAll()
    }

    toast.remove = (id: string): void => {
      this.remove(id)
    }

    toast.update = (id: string, options: Partial<ToastOptions> & { message?: string }): void => {
      this.update(id, options)
    }

    return toast as ToastAPI
  }

  /**
   * Message API
   */
  get message(): MessageAPI {
    const message = (content: string, options?: MessageOptions): string => {
      return this.createNotification('message', 'default', content, {
        ...options,
        position: options?.position || 'top',
      })
    }

    message.success = (content: string, options?: MessageOptions): string => {
      return this.createNotification('message', 'success', content, {
        ...options,
        position: options?.position || 'top',
      })
    }

    message.error = (content: string, options?: MessageOptions): string => {
      return this.createNotification('message', 'error', content, {
        ...options,
        position: options?.position || 'top',
      })
    }

    message.warning = (content: string, options?: MessageOptions): string => {
      return this.createNotification('message', 'warning', content, {
        ...options,
        position: options?.position || 'top',
      })
    }

    message.info = (content: string, options?: MessageOptions): string => {
      return this.createNotification('message', 'info', content, {
        ...options,
        position: options?.position || 'top',
      })
    }

    message.close = (id: string): void => {
      this.dismiss(id)
    }

    message.closeAll = (): void => {
      this.dismissAll('message')
    }

    return message as MessageAPI
  }

  /**
   * Notification API
   */
  get notification(): NotificationAPIType {
    const notification = (config: NotificationConfig): string => {
      return this.createNotification(
        'notification',
        config.type || 'default',
        config.message,
        {
          ...config,
          title: config.title,
          position: config.position || 'top-right',
        }
      )
    }

    notification.open = (config: NotificationConfig): string => {
      return notification(config)
    }

    notification.success = (config: Omit<NotificationConfig, 'type'>): string => {
      return notification({ ...config, type: 'success' })
    }

    notification.error = (config: Omit<NotificationConfig, 'type'>): string => {
      return notification({ ...config, type: 'error' })
    }

    notification.warning = (config: Omit<NotificationConfig, 'type'>): string => {
      return notification({ ...config, type: 'warning' })
    }

    notification.info = (config: Omit<NotificationConfig, 'type'>): string => {
      return notification({ ...config, type: 'info' })
    }

    notification.close = (id: string): void => {
      this.dismiss(id)
    }

    notification.destroy = (): void => {
      this.dismissAll('notification')
    }

    return notification as NotificationAPIType
  }

  /**
   * Alert API
   */
  get alert(): AlertAPI {
    const alert = async (messageOrOptions: string | AlertOptions): Promise<AlertResult> => {
      return this.showAlert(
        typeof messageOrOptions === 'string'
          ? { text: messageOrOptions }
          : messageOrOptions
      )
    }

    alert.confirm = async (message: string, options?: AlertOptions): Promise<boolean> => {
      const result = await this.showAlert({
        text: message,
        ...options,
        showCancelButton: true,
      })
      return result.isConfirmed
    }

    alert.prompt = async (message: string, options?: PromptOptions): Promise<string | null> => {
      const result = await this.showAlert({
        text: message,
        ...options,
        input: options?.input || 'text',
      } as AlertOptions)

      return result.isConfirmed ? result.value : null
    }

    alert.custom = async (options: AlertOptions): Promise<AlertResult> => {
      return this.showAlert(options)
    }

    alert.close = (): void => {
      // 关闭当前显示的 alert
      const alerts = this.queue.getByType('alert')
      if (alerts.length > 0) {
        this.dismiss(alerts[alerts.length - 1].id)
      }
    }

    return alert as AlertAPI
  }

  /**
   * 创建通知
   */
  private createNotification(
    type: NotificationItem['type'],
    variant: NotificationVariant,
    message: string,
    options: any = {}
  ): string {
    // 防重复检查
    if (this.config.preventDuplicate) {
      const existing = this.queue.getAll().find(
        item => item.type === type && isSameMessage(item.message, message)
      )
      if (existing)
        return existing.id
    }

    const id = options.id || generateId(type)
    const now = Date.now()

    const item: NotificationItem = {
      id,
      type,
      variant,
      message,
      title: options.title,
      position: options.position || this.config.defaultPosition,
      duration: options.duration !== undefined ? options.duration : this.config.defaultDuration,
      className: options.className || '',
      style: options.style || {},
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      pauseOnHover: options.pauseOnHover !== undefined ? options.pauseOnHover : true,
      pauseOnFocusLoss: options.pauseOnFocusLoss !== undefined ? options.pauseOnFocusLoss : false,
      enterAnimation: options.enterAnimation || 'fadeIn',
      exitAnimation: options.exitAnimation || 'fadeOut',
      animationDuration: options.animationDuration || 300,
      priority: options.priority || 'normal',
      onClick: options.onClick || (() => { }),
      onClose: options.onClose || (() => { }),
      onDestroy: options.onDestroy || (() => { }),
      icon: options.icon,
      render: options.render,
      createdAt: now,
      updatedAt: now,
      status: 'entering',
      read: false,
      data: options.data,
      paused: false,
      remainingTime: options.duration || this.config.defaultDuration,
    }

    // 添加到队列
    this.queue.enqueue(item)

    // 触发创建事件
    this.eventBus.emit('created', item)

    // 开始计时器
    if (item.duration > 0) {
      this.startTimer(item)
    }

    return id
  }

  /**
   * 显示 Alert
   */
  private async showAlert(options: AlertOptions): Promise<AlertResult> {
    return new Promise((resolve) => {
      const id = this.createNotification('alert', 'default', options.text || '', {
        ...options,
        position: 'center',
        duration: 0, // Alert 不自动关闭
        onClose: () => {
          resolve({
            isConfirmed: false,
            isDismissed: true,
            isDenied: false,
            dismiss: 'close',
          })
        },
        data: {
          ...options,
          onConfirm: () => {
            this.dismiss(id)
            resolve({
              isConfirmed: true,
              isDismissed: false,
              isDenied: false,
            })
          },
          onCancel: () => {
            this.dismiss(id)
            resolve({
              isConfirmed: false,
              isDismissed: true,
              isDenied: false,
              dismiss: 'cancel',
            })
          },
          onDeny: () => {
            this.dismiss(id)
            resolve({
              isConfirmed: false,
              isDismissed: false,
              isDenied: true,
            })
          },
        },
      })
    })
  }

  /**
   * 开始计时器
   */
  private startTimer(item: NotificationItem): void {
    const startTime = Date.now()
    const duration = item.remainingTime

    const timer = window.setTimeout(() => {
      this.dismiss(item.id)
    }, duration)

    this.timers.set(item.id, timer)

    // 保存原始的暂停/恢复时间
    item.data = {
      ...item.data,
      startTime,
      duration,
    }
  }

  /**
   * 暂停计时器
   */
  pauseTimer(id: string): void {
    const item = this.queue.get(id)
    if (!item || item.paused)
      return

    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }

    // 计算剩余时间
    const elapsed = Date.now() - item.data.startTime
    item.remainingTime = Math.max(0, item.data.duration - elapsed)
    item.paused = true

    this.queue.update(id, { paused: true, remainingTime: item.remainingTime })
  }

  /**
   * 恢复计时器
   */
  resumeTimer(id: string): void {
    const item = this.queue.get(id)
    if (!item || !item.paused)
      return

    item.paused = false
    this.queue.update(id, { paused: false })

    if (item.remainingTime > 0) {
      this.startTimer(item)
    }
  }

  /**
   * 更新通知
   */
  update(id: string, updates: Partial<NotificationItem>): void {
    const item = this.queue.get(id)
    if (!item)
      return

    // 如果更新了 duration，重新启动计时器
    if (updates.duration !== undefined && updates.duration !== item.duration) {
      const timer = this.timers.get(id)
      if (timer) {
        clearTimeout(timer)
        this.timers.delete(id)
      }

      item.remainingTime = updates.duration
      if (updates.duration > 0) {
        this.startTimer(item)
      }
    }

    this.queue.update(id, updates)
    this.eventBus.emit('updated', item)
  }

  /**
   * 关闭通知
   */
  dismiss(id: string): void {
    const item = this.queue.get(id)
    if (!item)
      return

    // 清除计时器
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }

    // 更新状态为退出中
    this.queue.update(id, { status: 'exiting' })
    this.eventBus.emit('dismissed', item)

    // 触发关闭回调
    item.onClose(id)

    // 延迟移除（等待退出动画完成）
    setTimeout(() => {
      this.remove(id)
    }, item.animationDuration)
  }

  /**
   * 关闭所有通知
   */
  dismissAll(type?: NotificationItem['type']): void {
    const items = type ? this.queue.getByType(type) : this.queue.getAll()
    items.forEach(item => this.dismiss(item.id))
  }

  /**
   * 移除通知
   */
  remove(id: string): void {
    const item = this.queue.get(id)
    if (!item)
      return

    this.queue.remove(id)
    this.eventBus.emit('destroyed', id)

    // 触发销毁回调
    item.onDestroy(id)
  }

  /**
   * 获取所有通知
   */
  getAll(): NotificationItem[] {
    return this.queue.getAll()
  }

  /**
   * 根据位置获取通知
   */
  getByPosition(position: NotificationItem['position']): NotificationItem[] {
    return this.queue.getByPosition(position)
  }

  /**
   * 事件监听
   */
  on<K extends keyof NotificationEventMap>(
    event: K,
    listener: NotificationEventListener<K>
  ): () => void {
    return this.eventBus.on(event, listener)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof NotificationEventMap>(
    event: K,
    listener?: NotificationEventListener<K>
  ): void {
    this.eventBus.off(event, listener)
  }

  /**
   * 设置主题
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.config.theme = theme
    document.documentElement.setAttribute('data-notification-theme', theme)
  }

  /**
   * 设置堆叠策略
   */
  setStackStrategy(strategy: NotificationManagerConfig['stackStrategy']): void {
    if (strategy) {
      this.config.stackStrategy = strategy
      this.stackManager.setStrategy(strategy)
      this.positionManager.setStackStrategy(strategy)
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.dismissAll()
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    this.positionManager.destroyAll()
    this.eventBus.clear()
  }
}

// 导出单例
export const notificationManager = new NotificationManager()



