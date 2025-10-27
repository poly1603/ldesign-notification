/**
 * 键盘导航管理器
 * 
 * @description
 * 为通知系统提供完整的键盘导航支持：
 * - Tab/Shift+Tab: 在通知间切换焦点
 * - Arrow Up/Down: 在同一位置的通知间导航
 * - Escape: 关闭当前聚焦的通知或所有通知
 * - Enter/Space: 触发通知的点击事件
 * - Home/End: 跳转到第一个/最后一个通知
 * 
 * @example
 * ```ts
 * const keyboard = new KeyboardManager(notificationManager)
 * keyboard.enable()
 * // 用户可以使用键盘导航通知了
 * keyboard.disable()
 * ```
 */

import type { NotificationManager } from './manager'
import type { NotificationItem } from '../types'
import { KEYBOARD } from '../constants'

/**
 * 焦点状态接口
 */
interface FocusState {
  /** 当前聚焦的通知 ID */
  currentId: string | null
  /** 焦点历史记录 */
  history: string[]
  /** 最大历史记录数 */
  maxHistory: number
}

/**
 * 键盘快捷键配置接口
 */
export interface KeyboardShortcuts {
  /** 关闭通知 */
  close?: string
  /** 确认/激活 */
  confirm?: string
  /** 取消 */
  cancel?: string
  /** 上一个 */
  previous?: string
  /** 下一个 */
  next?: string
  /** 第一个 */
  first?: string
  /** 最后一个 */
  last?: string
}

/**
 * 键盘管理器类
 * 
 * @class KeyboardManager
 * @description 管理通知系统的键盘交互
 */
export class KeyboardManager {
  /** 通知管理器引用 */
  private manager: NotificationManager

  /** 是否启用键盘导航 */
  private enabled = false

  /** 焦点状态 */
  private focusState: FocusState = {
    currentId: null,
    history: [],
    maxHistory: 10,
  }

  /** 快捷键配置 */
  private shortcuts: Required<KeyboardShortcuts>

  /** 键盘事件监听器 */
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null

  /** AbortController 用于清理事件监听器 */
  private abortController: AbortController | null = null

  /**
   * 构造函数
   * 
   * @param manager - 通知管理器实例
   * @param shortcuts - 自定义快捷键配置
   */
  constructor(manager: NotificationManager, shortcuts?: Partial<KeyboardShortcuts>) {
    this.manager = manager
    this.shortcuts = {
      close: KEYBOARD.CLOSE,
      confirm: KEYBOARD.CONFIRM,
      cancel: KEYBOARD.CANCEL,
      previous: KEYBOARD.PREVIOUS,
      next: KEYBOARD.NEXT,
      first: 'Home',
      last: 'End',
      ...shortcuts,
    }
  }

  /**
   * 启用键盘导航
   * 
   * @description
   * 注册全局键盘事件监听器，开始处理键盘输入
   * 
   * @example
   * ```ts
   * keyboard.enable()
   * ```
   */
  enable(): void {
    if (this.enabled) {
      return
    }

    try {
      this.abortController = new AbortController()

      this.keydownHandler = this.handleKeydown.bind(this)

      document.addEventListener('keydown', this.keydownHandler, {
        signal: this.abortController.signal,
        capture: true,
      })

      this.enabled = true
    }
    catch (error) {
      console.error('[KeyboardManager] Enable failed:', error)
    }
  }

  /**
   * 禁用键盘导航
   * 
   * @description
   * 移除键盘事件监听器，停止处理键盘输入
   */
  disable(): void {
    if (!this.enabled) {
      return
    }

    try {
      if (this.abortController) {
        this.abortController.abort()
        this.abortController = null
      }

      this.keydownHandler = null
      this.enabled = false
      this.clearFocus()
    }
    catch (error) {
      console.error('[KeyboardManager] Disable failed:', error)
    }
  }

  /**
   * 处理键盘事件
   * 
   * @private
   * @param event - 键盘事件
   */
  private handleKeydown(event: KeyboardEvent): void {
    // 如果在输入框内，不处理
    const target = event.target as HTMLElement
    if (this.isInputElement(target)) {
      return
    }

    const { key, shiftKey, ctrlKey, metaKey } = event
    const hasModifier = ctrlKey || metaKey

    try {
      // Escape - 关闭通知
      if (key === this.shortcuts.close) {
        this.handleClose(event, hasModifier)
        return
      }

      // Tab - 切换焦点
      if (key === KEYBOARD.TAB) {
        this.handleTab(event, shiftKey)
        return
      }

      // 只有在有聚焦的通知时才处理以下快捷键
      if (!this.focusState.currentId) {
        return
      }

      // Enter/Space - 确认/激活
      if (key === this.shortcuts.confirm || key === ' ') {
        this.handleConfirm(event)
        return
      }

      // Arrow Up - 上一个
      if (key === this.shortcuts.previous) {
        this.handleNavigate(event, 'previous')
        return
      }

      // Arrow Down - 下一个
      if (key === this.shortcuts.next) {
        this.handleNavigate(event, 'next')
        return
      }

      // Home - 第一个
      if (key === this.shortcuts.first) {
        this.handleNavigate(event, 'first')
        return
      }

      // End - 最后一个
      if (key === this.shortcuts.last) {
        this.handleNavigate(event, 'last')
        return
      }
    }
    catch (error) {
      console.error('[KeyboardManager] Handle keydown failed:', error)
    }
  }

  /**
   * 处理关闭操作
   * 
   * @private
   * @param event - 键盘事件
   * @param closeAll - 是否关闭所有通知
   */
  private handleClose(event: KeyboardEvent, closeAll: boolean): void {
    event.preventDefault()

    if (closeAll) {
      // Ctrl/Cmd + Escape: 关闭所有通知
      this.manager.dismissAll()
      this.clearFocus()
    }
    else if (this.focusState.currentId) {
      // Escape: 关闭当前聚焦的通知
      this.manager.dismiss(this.focusState.currentId)
      this.focusNext()
    }
  }

  /**
   * 处理 Tab 导航
   * 
   * @private
   * @param event - 键盘事件
   * @param reverse - 是否反向导航
   */
  private handleTab(event: KeyboardEvent, reverse: boolean): void {
    const notifications = this.manager.getAll()

    if (notifications.length === 0) {
      return
    }

    event.preventDefault()

    if (!this.focusState.currentId) {
      // 没有聚焦的通知，聚焦第一个
      this.focusNotification(notifications[0].id)
      return
    }

    // 找到当前通知的索引
    const currentIndex = notifications.findIndex(n => n.id === this.focusState.currentId)

    if (currentIndex === -1) {
      this.focusNotification(notifications[0].id)
      return
    }

    // 计算下一个索引
    let nextIndex: number
    if (reverse) {
      nextIndex = currentIndex - 1
      if (nextIndex < 0) {
        nextIndex = notifications.length - 1 // 循环到最后一个
      }
    }
    else {
      nextIndex = currentIndex + 1
      if (nextIndex >= notifications.length) {
        nextIndex = 0 // 循环到第一个
      }
    }

    this.focusNotification(notifications[nextIndex].id)
  }

  /**
   * 处理确认操作
   * 
   * @private
   * @param event - 键盘事件
   */
  private handleConfirm(event: KeyboardEvent): void {
    if (!this.focusState.currentId) {
      return
    }

    event.preventDefault()

    const notification = this.manager.getAll().find(n => n.id === this.focusState.currentId)
    if (notification) {
      // 触发通知的点击回调
      if (notification.onClick) {
        notification.onClick(notification.id)
      }
    }
  }

  /**
   * 处理方向导航
   * 
   * @private
   * @param event - 键盘事件
   * @param direction - 导航方向
   */
  private handleNavigate(
    event: KeyboardEvent,
    direction: 'previous' | 'next' | 'first' | 'last'
  ): void {
    event.preventDefault()

    const notifications = this.manager.getAll()
    if (notifications.length === 0) {
      return
    }

    let targetIndex: number

    switch (direction) {
      case 'first':
        targetIndex = 0
        break

      case 'last':
        targetIndex = notifications.length - 1
        break

      case 'previous':
      case 'next': {
        if (!this.focusState.currentId) {
          targetIndex = 0
          break
        }

        const currentIndex = notifications.findIndex(n => n.id === this.focusState.currentId)
        if (currentIndex === -1) {
          targetIndex = 0
          break
        }

        if (direction === 'previous') {
          targetIndex = Math.max(0, currentIndex - 1)
        }
        else {
          targetIndex = Math.min(notifications.length - 1, currentIndex + 1)
        }
        break
      }
    }

    this.focusNotification(notifications[targetIndex].id)
  }

  /**
   * 聚焦通知
   * 
   * @param id - 通知 ID
   * 
   * @description
   * 将焦点设置到指定的通知，并添加到历史记录
   * 
   * @example
   * ```ts
   * keyboard.focusNotification('notification-123')
   * ```
   */
  focusNotification(id: string): void {
    try {
      // 查找通知元素
      const element = document.querySelector(`[data-id="${id}"]`) as HTMLElement
      if (!element) {
        console.warn(`[KeyboardManager] Notification element not found: ${id}`)
        return
      }

      // 移除之前的焦点
      if (this.focusState.currentId) {
        const prevElement = document.querySelector(
          `[data-id="${this.focusState.currentId}"]`
        ) as HTMLElement
        if (prevElement) {
          prevElement.classList.remove('ldesign-notification-focused')
          prevElement.removeAttribute('tabindex')
        }
      }

      // 设置新焦点
      element.classList.add('ldesign-notification-focused')
      element.setAttribute('tabindex', '0')
      element.focus()

      // 更新焦点状态
      this.focusState.currentId = id

      // 添加到历史记录
      this.focusState.history.push(id)
      if (this.focusState.history.length > this.focusState.maxHistory) {
        this.focusState.history.shift()
      }
    }
    catch (error) {
      console.error('[KeyboardManager] Focus notification failed:', error)
    }
  }

  /**
   * 聚焦下一个通知
   * 
   * @private
   * @description
   * 用于在当前通知被关闭后自动聚焦下一个
   */
  private focusNext(): void {
    const notifications = this.manager.getAll()
    if (notifications.length > 0) {
      this.focusNotification(notifications[0].id)
    }
    else {
      this.clearFocus()
    }
  }

  /**
   * 清除焦点
   * 
   * @description
   * 移除当前聚焦的通知的焦点状态
   */
  clearFocus(): void {
    if (this.focusState.currentId) {
      const element = document.querySelector(
        `[data-id="${this.focusState.currentId}"]`
      ) as HTMLElement
      if (element) {
        element.classList.remove('ldesign-notification-focused')
        element.removeAttribute('tabindex')
      }
    }

    this.focusState.currentId = null
  }

  /**
   * 检查元素是否为输入元素
   * 
   * @private
   * @param element - DOM 元素
   * @returns 是否为输入元素
   */
  private isInputElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      element.isContentEditable
    )
  }

  /**
   * 获取当前聚焦的通知 ID
   * 
   * @returns 通知 ID 或 null
   */
  getCurrentFocusId(): string | null {
    return this.focusState.currentId
  }

  /**
   * 获取焦点历史记录
   * 
   * @returns 历史记录数组
   */
  getFocusHistory(): string[] {
    return [...this.focusState.history]
  }

  /**
   * 检查是否启用
   * 
   * @returns 是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 设置快捷键
   * 
   * @param shortcuts - 快捷键配置
   * 
   * @description
   * 动态更新快捷键配置
   */
  setShortcuts(shortcuts: Partial<KeyboardShortcuts>): void {
    this.shortcuts = {
      ...this.shortcuts,
      ...shortcuts,
    }
  }

  /**
   * 销毁键盘管理器
   * 
   * @description
   * 清理所有资源
   */
  destroy(): void {
    this.disable()
    this.focusState.history = []
  }
}


