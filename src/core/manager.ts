/**
 * 通知管理器 - 核心类
 * 
 * @description
 * 通知系统的核心管理器，负责：
 * - 通知的创建、更新、关闭、销毁
 * - 队列管理和优先级控制
 * - 定时器管理和生命周期控制
 * - 事件发布和订阅
 * - 内存管理和资源清理
 * 
 * @example
 * ```ts
 * const manager = new NotificationManager({
 *   maxNotifications: 5,
 *   defaultPosition: 'top-right',
 *   defaultDuration: 3000
 * })
 * 
 * manager.toast.success('操作成功！')
 * ```
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
import { deepMerge, generateId, isSameMessage, throttle } from '../utils/helpers'

/**
 * 定时器信息接口
 */
interface TimerInfo {
  /** 定时器 ID */
  id: number
  /** 开始时间 */
  startTime: number
  /** 持续时间 */
  duration: number
  /** 剩余时间 */
  remainingTime: number
}

/**
 * 通知管理器类
 * 
 * @class NotificationManager
 * @description 通知系统核心管理器，提供完整的通知生命周期管理
 */
export class NotificationManager {
  /** 通知队列 */
  private queue: NotificationQueue

  /** 位置管理器 */
  private positionManager: PositionManager

  /** 动画引擎 */
  private animationEngine: AnimationEngine

  /** 堆叠管理器 */
  private stackManager: StackManager

  /** 事件总线 */
  private eventBus: EventBus

  /** 配置对象 */
  private config: Required<NotificationManagerConfig>

  /** 定时器映射（ID -> TimerInfo） */
  private timers: Map<string, TimerInfo> = new Map()

  /** 管理器是否已销毁 */
  private destroyed = false

  /** 创建通知的节流函数 */
  private throttledCreate: ((
    type: NotificationItem['type'],
    variant: NotificationVariant,
    message: string,
    options?: any
  ) => string) | null = null

  /**
   * 构造函数
   * 
   * @param config - 管理器配置
   */
  constructor(config: NotificationManagerConfig = {}) {
    // 合并默认配置
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

    // 初始化各个子系统
    this.queue = new NotificationQueue(this.config.maxNotifications)
    this.positionManager = new PositionManager(this.config.offset, this.config.stackStrategy)
    this.animationEngine = new AnimationEngine()
    this.stackManager = new StackManager(this.config.stackStrategy)
    this.eventBus = new EventBus()

    // 设置节流保护（防止短时间内创建大量通知）
    this.throttledCreate = throttle(
      this.createNotificationInternal.bind(this),
      50, // 50ms 内最多创建一个通知
      { leading: true, trailing: false }
    )
  }

  /**
   * Toast API
   * 
   * @description 轻量级提示通知，适用于简短的操作反馈
   * 
   * @example
   * ```ts
   * manager.toast('Hello!')
   * manager.toast.success('保存成功')
   * manager.toast.error('操作失败')
   * manager.toast.promise(fetchData(), {
   *   loading: '加载中...',
   *   success: '加载完成',
   *   error: '加载失败'
   * })
   * ```
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
        duration: 0, // loading 类型不自动关闭
      })
    }

    toast.promise = async <T = any>(
      promise: Promise<T>,
      messages: PromiseMessages<T>,
      options?: PromiseToastOptions<T>
    ): Promise<T> => {
      // 获取 loading 消息
      const loadingMsg = typeof messages.loading === 'function'
        ? messages.loading()
        : messages.loading

      // 创建 loading 通知
      const id = this.createNotification('toast', 'loading', loadingMsg, {
        ...options,
        ...options?.loading,
        duration: 0,
      })

      try {
        // 等待 Promise 完成
        const result = await promise

        // 获取成功消息
        const successMsg = typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success

        // 更新为成功状态
        this.update(id, {
          message: successMsg,
          variant: 'success',
          duration: options?.success?.duration || this.config.defaultDuration,
        })

        return result
      }
      catch (error) {
        // 获取错误消息
        const errorMsg = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error

        // 更新为错误状态
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
      this.dismissAll('toast')
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
   * 
   * @description 顶部消息条，适用于全局提示
   * 
   * @example
   * ```ts
   * manager.message('这是一条消息')
   * manager.message.success('操作成功')
   * manager.message.error('发生错误')
   * ```
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
   * 
   * @description 桌面风格通知，支持标题、操作按钮等复杂内容
   * 
   * @example
   * ```ts
   * manager.notification({
   *   title: '新消息',
   *   message: '您收到了一条新消息',
   *   type: 'info'
   * })
   * ```
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
   * 
   * @description 模态对话框，需要用户交互才能关闭
   * 
   * @example
   * ```ts
   * const result = await manager.alert('确定要删除吗？')
   * const confirmed = await manager.alert.confirm('确定继续吗？')
   * const input = await manager.alert.prompt('请输入您的名字')
   * ```
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
   * 创建通知（带节流保护的公开接口）
   * 
   * @param type - 通知类型
   * @param variant - 通知变体
   * @param message - 消息内容
   * @param options - 通知选项
   * @returns 通知 ID
   */
  private createNotification(
    type: NotificationItem['type'],
    variant: NotificationVariant,
    message: string,
    options: any = {}
  ): string {
    // 检查管理器是否已销毁
    if (this.destroyed) {
      console.warn('[NotificationManager] Manager has been destroyed')
      return ''
    }

    try {
      // 对于高优先级通知，跳过节流
      if (options?.priority === 'high' || variant === 'error') {
        return this.createNotificationInternal(type, variant, message, options)
      }

      // 使用节流函数
      if (this.throttledCreate) {
        return this.throttledCreate(type, variant, message, options)
      }

      return this.createNotificationInternal(type, variant, message, options)
    }
    catch (error) {
      console.error('[NotificationManager] Create notification failed:', error)
      return ''
    }
  }

  /**
   * 创建通知（内部实现）
   * 
   * @private
   * @param type - 通知类型
   * @param variant - 通知变体
   * @param message - 消息内容
   * @param options - 通知选项
   * @returns 通知 ID
   * 
   * @description
   * 1. 检查重复（如果启用）
   * 2. 生成唯一 ID
   * 3. 创建通知项
   * 4. 添加到队列
   * 5. 触发事件
   * 6. 启动定时器
   */
  private createNotificationInternal(
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
      if (existing) {
        return existing.id
      }
    }

    // 生成唯一 ID
    const id = options.id || generateId(type)
    const now = Date.now()

    // 创建通知项
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
      data: options.data || {},
      paused: false,
      remainingTime: options.duration !== undefined ? options.duration : this.config.defaultDuration,
    }

    // 添加到队列
    this.queue.enqueue(item)

    // 触发创建事件
    this.eventBus.emit('created', item)

    // 启动定时器（如果有持续时间）
    if (item.duration > 0) {
      this.startTimer(item)
    }

    return id
  }

  /**
   * 显示 Alert 对话框
   * 
   * @private
   * @param options - Alert 选项
   * @returns Promise<AlertResult>
   */
  private async showAlert(options: AlertOptions): Promise<AlertResult> {
    return new Promise((resolve) => {
      const id = this.createNotificationInternal('alert', 'default', options.text || '', {
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
   * 启动定时器
   * 
   * @private
   * @param item - 通知项
   * 
   * @description
   * 为通知创建自动关闭定时器，并保存定时器信息用于暂停/恢复
   */
  private startTimer(item: NotificationItem): void {
    // 清除已存在的定时器（避免重复）
    this.clearTimer(item.id)

    const startTime = Date.now()
    const duration = item.remainingTime || item.duration

    // 创建定时器
    const timerId = window.setTimeout(() => {
      this.dismiss(item.id)
      // 定时器触发后自动清理
      this.timers.delete(item.id)
    }, duration)

    // 保存定时器信息
    this.timers.set(item.id, {
      id: timerId,
      startTime,
      duration,
      remainingTime: duration,
    })
  }

  /**
   * 清除定时器
   * 
   * @private
   * @param id - 通知 ID
   */
  private clearTimer(id: string): void {
    const timerInfo = this.timers.get(id)
    if (timerInfo) {
      clearTimeout(timerInfo.id)
      this.timers.delete(id)
    }
  }

  /**
   * 暂停定时器
   * 
   * @param id - 通知 ID
   * 
   * @description
   * 暂停通知的自动关闭定时器，通常在鼠标悬停时调用
   */
  pauseTimer(id: string): void {
    try {
      const item = this.queue.get(id)
      if (!item || item.paused) {
        return
      }

      const timerInfo = this.timers.get(id)
      if (!timerInfo) {
        return
      }

      // 清除当前定时器
      clearTimeout(timerInfo.id)

      // 计算剩余时间
      const elapsed = Date.now() - timerInfo.startTime
      const remainingTime = Math.max(0, timerInfo.duration - elapsed)

      // 更新定时器信息
      timerInfo.remainingTime = remainingTime
      this.timers.set(id, timerInfo)

      // 更新通知项
      this.queue.update(id, {
        paused: true,
        remainingTime,
      })
    }
    catch (error) {
      console.error('[NotificationManager] Pause timer failed:', error)
    }
  }

  /**
   * 恢复定时器
   * 
   * @param id - 通知 ID
   * 
   * @description
   * 恢复通知的自动关闭定时器，通常在鼠标离开时调用
   */
  resumeTimer(id: string): void {
    try {
      const item = this.queue.get(id)
      if (!item || !item.paused) {
        return
      }

      const timerInfo = this.timers.get(id)
      if (!timerInfo) {
        return
      }

      // 更新通知项为未暂停状态
      this.queue.update(id, { paused: false })

      // 使用剩余时间重新启动定时器
      if (timerInfo.remainingTime > 0) {
        const timerId = window.setTimeout(() => {
          this.dismiss(id)
          this.timers.delete(id)
        }, timerInfo.remainingTime)

        // 更新定时器信息
        this.timers.set(id, {
          ...timerInfo,
          id: timerId,
          startTime: Date.now(),
          duration: timerInfo.remainingTime,
        })
      }
    }
    catch (error) {
      console.error('[NotificationManager] Resume timer failed:', error)
    }
  }

  /**
   * 更新通知
   * 
   * @param id - 通知 ID
   * @param updates - 更新的字段
   * 
   * @description
   * 动态更新已存在的通知内容，如果更新了 duration，会重启定时器
   */
  update(id: string, updates: Partial<NotificationItem>): void {
    try {
      const item = this.queue.get(id)
      if (!item) {
        return
      }

      // 如果更新了 duration，重新启动定时器
      if (updates.duration !== undefined && updates.duration !== item.duration) {
        // 清除旧定时器
        this.clearTimer(id)

        // 更新剩余时间
        item.remainingTime = updates.duration

        // 如果新 duration > 0，启动新定时器
        if (updates.duration > 0) {
          this.startTimer(item)
        }
      }

      // 更新队列中的通知项
      this.queue.update(id, updates)

      // 触发更新事件
      this.eventBus.emit('updated', item)
    }
    catch (error) {
      console.error('[NotificationManager] Update notification failed:', error)
    }
  }

  /**
   * 关闭通知
   * 
   * @param id - 通知 ID
   * 
   * @description
   * 优雅地关闭通知：
   * 1. 清除定时器
   * 2. 更新状态为 exiting
   * 3. 触发关闭事件
   * 4. 等待退出动画完成后移除
   */
  dismiss(id: string): void {
    try {
      const item = this.queue.get(id)
      if (!item) {
        return
      }

      // 清除定时器
      this.clearTimer(id)

      // 更新状态为退出中
      this.queue.update(id, { status: 'exiting' })
      this.eventBus.emit('dismissed', item)

      // 触发关闭回调
      try {
        item.onClose(id)
      }
      catch (error) {
        console.error('[NotificationManager] onClose callback failed:', error)
      }

      // 延迟移除（等待退出动画完成）
      setTimeout(() => {
        this.remove(id)
      }, item.animationDuration)
    }
    catch (error) {
      console.error('[NotificationManager] Dismiss notification failed:', error)
    }
  }

  /**
   * 关闭所有通知（批量优化）
   * 
   * @param type - 可选的通知类型，仅关闭该类型的通知
   * 
   * @description
   * 批量关闭通知，相比逐个调用 dismiss，性能更好
   */
  dismissAll(type?: NotificationItem['type']): void {
    try {
      const items = type ? this.queue.getByType(type) : this.queue.getAll()

      if (items.length === 0) {
        return
      }

      // 批量清除定时器
      for (const item of items) {
        this.clearTimer(item.id)
      }

      // 批量更新状态
      for (const item of items) {
        this.queue.update(item.id, { status: 'exiting' })
        this.eventBus.emit('dismissed', item)

        try {
          item.onClose(item.id)
        }
        catch (error) {
          console.error('[NotificationManager] onClose callback failed:', error)
        }
      }

      // 获取最大动画时长
      const maxAnimationDuration = Math.max(...items.map(item => item.animationDuration))

      // 延迟批量移除
      setTimeout(() => {
        for (const item of items) {
          this.remove(item.id)
        }
      }, maxAnimationDuration)
    }
    catch (error) {
      console.error('[NotificationManager] Dismiss all notifications failed:', error)
    }
  }

  /**
   * 移除通知
   * 
   * @param id - 通知 ID
   * 
   * @description
   * 立即从队列中移除通知，清理所有相关资源
   */
  remove(id: string): void {
    try {
      const item = this.queue.get(id)
      if (!item) {
        return
      }

      // 清除定时器
      this.clearTimer(id)

      // 从队列移除
      this.queue.remove(id)

      // 触发销毁事件
      this.eventBus.emit('destroyed', id)

      // 触发销毁回调
      try {
        item.onDestroy(id)
      }
      catch (error) {
        console.error('[NotificationManager] onDestroy callback failed:', error)
      }
    }
    catch (error) {
      console.error('[NotificationManager] Remove notification failed:', error)
    }
  }

  /**
   * 获取所有通知
   * 
   * @returns 所有通知项的数组
   */
  getAll(): NotificationItem[] {
    return this.queue.getAll()
  }

  /**
   * 根据位置获取通知
   * 
   * @param position - 通知位置
   * @returns 该位置的所有通知
   */
  getByPosition(position: NotificationItem['position']): NotificationItem[] {
    return this.queue.getByPosition(position)
  }

  /**
   * 事件监听
   * 
   * @param event - 事件名称
   * @param listener - 事件监听器
   * @returns 取消监听函数
   * 
   * @example
   * ```ts
   * const unsubscribe = manager.on('created', (item) => {
   *   console.log('通知已创建:', item)
   * })
   * 
   * // 取消监听
   * unsubscribe()
   * ```
   */
  on<K extends keyof NotificationEventMap>(
    event: K,
    listener: NotificationEventListener<K>
  ): () => void {
    return this.eventBus.on(event, listener)
  }

  /**
   * 移除事件监听
   * 
   * @param event - 事件名称
   * @param listener - 可选的监听器，不传则移除该事件的所有监听器
   */
  off<K extends keyof NotificationEventMap>(
    event: K,
    listener?: NotificationEventListener<K>
  ): void {
    this.eventBus.off(event, listener)
  }

  /**
   * 设置主题
   * 
   * @param theme - 主题名称（light/dark）
   * 
   * @description
   * 通过设置 data-notification-theme 属性来切换主题
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.config.theme = theme
    document.documentElement.setAttribute('data-notification-theme', theme)
  }

  /**
   * 设置堆叠策略
   * 
   * @param strategy - 堆叠策略
   * 
   * @description
   * 动态切换通知的堆叠方式（overlap/stack/replace/collapse）
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
   * 
   * @description
   * 完全清理管理器及其所有资源：
   * 1. 关闭所有通知
   * 2. 清除所有定时器
   * 3. 销毁位置容器
   * 4. 清除所有事件监听器
   * 5. 标记为已销毁
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    try {
      // 关闭所有通知
      this.dismissAll()

      // 清除所有定时器
      for (const [id, timerInfo] of this.timers) {
        clearTimeout(timerInfo.id)
      }
      this.timers.clear()

      // 销毁位置管理器
      this.positionManager.destroyAll()

      // 清除所有事件监听器
      this.eventBus.clear()

      // 清空队列
      this.queue.clear()

      // 标记为已销毁
      this.destroyed = true

      // 清空节流函数引用
      this.throttledCreate = null
    }
    catch (error) {
      console.error('[NotificationManager] Destroy failed:', error)
    }
  }

  /**
   * 获取调试信息
   * 
   * @returns 管理器的调试信息
   */
  getDebugInfo(): {
    destroyed: boolean
    queueSize: number
    activeTimers: number
    config: NotificationManagerConfig
    queueInfo: ReturnType<NotificationQueue['getDebugInfo']>
  } {
    return {
      destroyed: this.destroyed,
      queueSize: this.queue.size,
      activeTimers: this.timers.size,
      config: this.config,
      queueInfo: this.queue.getDebugInfo(),
    }
  }
}

/**
 * 导出单例
 * 
 * @description
 * 全局共享的通知管理器实例，可直接使用
 * 
 * @example
 * ```ts
 * import { notificationManager } from '@ldesign/notification'
 * 
 * notificationManager.toast.success('操作成功！')
 * ```
 */
export const notificationManager = new NotificationManager()
