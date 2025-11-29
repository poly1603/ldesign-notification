/**
 * Modal 管理器
 * @description 管理 Modal 模态弹窗的核心类
 */

import type {
  AlertConfig,
  ConfirmConfig,
  ModalConfig,
  ModalItem,
  PromptConfig,
} from '../types'
import { isBrowser, lockBodyScroll } from '../utils/dom'
import { EventEmitter } from '../utils/event-emitter'
import { generateId } from '../utils/id'

/**
 * Modal 事件类型
 */
export interface ModalEvents {
  open: [item: ModalItem]
  close: [id: string]
  update: [item: ModalItem]
  clear: []
}

/** 当前 z-index */
let currentZIndex = 1000

/**
 * Modal 管理器类
 */
export class ModalManager extends EventEmitter<ModalEvents> {
  /** Modal 列表 */
  private _items: Map<string, ModalItem> = new Map()

  /** 滚动锁定解锁函数 */
  private _unlockScroll: (() => void) | null = null

  /** Modal 栈 */
  private _stack: string[] = []

  /**
   * 获取所有 Modal
   */
  get items(): ModalItem[] {
    return Array.from(this._items.values())
  }

  /**
   * 获取当前最顶层 Modal
   */
  get topModal(): ModalItem | undefined {
    const topId = this._stack[this._stack.length - 1]
    return topId ? this._items.get(topId) : undefined
  }

  /**
   * 打开 Modal
   * @param config - Modal 配置
   * @returns Modal ID
   */
  async open(config: ModalConfig): Promise<string> {
    const id = config.id || generateId('modal')

    // 执行打开前回调
    if (config.beforeOpen) {
      const canOpen = await config.beforeOpen()
      if (!canOpen)
        return ''
    }

    const zIndex = ++currentZIndex

    const item: ModalItem = {
      id,
      config,
      visible: false,
      opening: true,
      closing: false,
      opened: false,
      zIndex,
      loading: false,
      createdAt: Date.now(),
      close: () => this.close(id),
    }

    this._items.set(id, item)
    this._stack.push(id)

    // 锁定滚动
    if (config.lockScroll !== false && isBrowser && !this._unlockScroll) {
      this._unlockScroll = lockBodyScroll()
    }

    // 先发出事件，让 Vue 组件先渲染 visible: false 的状态
    this.emit('open', item)

    // 然后在下一帧触发打开动画
    setTimeout(() => {
      item.visible = true
      item.opening = false
      item.opened = true
      config.onOpen?.()
      this.emit('update', item)
    }, 16) // 使用 16ms 确保 Vue 有时间渲染初始状态

    return id
  }

  /**
   * 关闭 Modal
   */
  async close(id: string): Promise<void> {
    const item = this._items.get(id)
    if (!item || item.closing)
      return

    // 执行关闭前回调
    if (item.config.beforeClose) {
      const canClose = await item.config.beforeClose()
      if (!canClose)
        return
    }

    item.closing = true
    item.visible = false

    // 立即发射 update 事件，触发关闭动画
    this.emit('update', item)

    // 等待动画完成后再删除
    setTimeout(() => {
      item.config.onClose?.()
      this._items.delete(id)
      this._stack = this._stack.filter(stackId => stackId !== id)

      // 如果没有更多 Modal，解锁滚动
      if (this._stack.length === 0 && this._unlockScroll) {
        this._unlockScroll()
        this._unlockScroll = null
      }

      this.emit('close', id)
    }, 300) // 与 CSS 动画时间一致
  }

  /**
   * 关闭所有 Modal
   */
  closeAll(): void {
    this._items.forEach((_, id) => this.close(id))
    this.emit('clear')
  }

  /**
   * 确认对话框
   */
  confirm(config: ConfirmConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const originalOnConfirm = config.onConfirm
      const originalOnCancel = config.onCancel
      const originalOnClose = config.onClose
      let resolved = false

      // 创建新配置对象，包含修改后的回调
      const modalConfig: ModalConfig & ConfirmConfig = {
        ...config,
        onConfirm: async () => {
          if (resolved)
            return
          resolved = true
          await originalOnConfirm?.()
          resolve(true)
        },
        onCancel: () => {
          if (resolved)
            return
          resolved = true
          originalOnCancel?.()
          resolve(false)
        },
        onClose: () => {
          if (resolved)
            return
          resolved = true
          originalOnClose?.()
          resolve(false)
        },
      }

      this.open(modalConfig)
    })
  }

  /**
   * 警告对话框
   */
  alert(config: AlertConfig): Promise<void> {
    return new Promise((resolve) => {
      const originalOnClose = config.onClose

      this.open({
        ...config,
        onClose: () => {
          originalOnClose?.()
          resolve()
        },
      } as ModalConfig)
    })
  }

  /**
   * 输入对话框
   */
  prompt(config: PromptConfig): Promise<string | null> {
    return new Promise((resolve) => {
      const originalOnConfirm = config.onConfirm
      const originalOnCancel = config.onCancel
      const originalOnClose = config.onClose
      let resolved = false

      // 创建新配置对象，包含修改后的回调
      const modalConfig: ModalConfig & PromptConfig = {
        ...config,
        onConfirm: async (value: string) => {
          if (resolved)
            return
          resolved = true
          await originalOnConfirm?.(value)
          resolve(value)
        },
        onCancel: () => {
          if (resolved)
            return
          resolved = true
          originalOnCancel?.()
          resolve(null)
        },
        onClose: () => {
          if (resolved)
            return
          resolved = true
          originalOnClose?.()
          resolve(null)
        },
      }

      this.open(modalConfig)
    })
  }

  /**
   * 信息确认框
   */
  info(config: Omit<ConfirmConfig, 'type'>): Promise<boolean> {
    return this.confirm({ ...config, type: 'info' })
  }

  /**
   * 成功确认框
   */
  success(config: Omit<ConfirmConfig, 'type'>): Promise<boolean> {
    return this.confirm({ ...config, type: 'success' })
  }

  /**
   * 错误确认框
   */
  error(config: Omit<ConfirmConfig, 'type'>): Promise<boolean> {
    return this.confirm({ ...config, type: 'error' })
  }

  /**
   * 警告确认框
   */
  warning(config: Omit<ConfirmConfig, 'type'>): Promise<boolean> {
    return this.confirm({ ...config, type: 'warning' })
  }

  /**
   * 更新 Modal 配置
   */
  update(id: string, config: Partial<ModalConfig>): void {
    const item = this._items.get(id)
    if (!item)
      return

    Object.assign(item.config, config)
    this.emit('update', item)
  }

  /**
   * 设置加载状态
   */
  setLoading(id: string, loading: boolean): void {
    const item = this._items.get(id)
    if (item) {
      item.loading = loading
    }
  }

  /**
   * 处理 ESC 键
   */
  handleEscape(): void {
    const topModal = this.topModal
    if (topModal && topModal.config.keyboard !== false) {
      this.close(topModal.id)
    }
  }
}

