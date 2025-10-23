/**
 * 基础渲染器
 */

import type { AnimationConfig } from '../core/animation'
import type { NotificationItem } from '../types'
import { AnimationEngine } from '../core/animation'

/**
 * 渲染器配置
 */
export interface RendererConfig {
  animationEngine?: AnimationEngine
  onMount?: (element: HTMLElement, item: NotificationItem) => void
  onUnmount?: (element: HTMLElement, item: NotificationItem) => void
}

/**
 * 基础渲染器抽象类
 */
export abstract class BaseRenderer {
  protected animationEngine: AnimationEngine
  protected config: RendererConfig

  constructor(config: RendererConfig = {}) {
    this.config = config
    this.animationEngine = config.animationEngine || new AnimationEngine()
  }

  /**
   * 渲染通知项
   */
  abstract render(item: NotificationItem): HTMLElement

  /**
   * 挂载到容器
   */
  async mount(
    element: HTMLElement,
    container: HTMLElement,
    item: NotificationItem
  ): Promise<void> {
    // 设置初始动画状态
    this.animationEngine.setInitialState(element, item.enterAnimation)

    // 添加到容器
    container.appendChild(element)

    // 执行进入动画
    await this.animationEngine.enter(element, {
      type: item.enterAnimation,
      duration: item.animationDuration,
    })

    // 更新状态
    element.setAttribute('data-status', 'visible')

    // 触发挂载回调
    this.config.onMount?.(element, item)
  }

  /**
   * 从容器卸载
   */
  async unmount(
    element: HTMLElement,
    container: HTMLElement,
    item: NotificationItem
  ): Promise<void> {
    // 更新状态
    element.setAttribute('data-status', 'exiting')

    // 执行退出动画
    await this.animationEngine.exit(element, {
      type: item.exitAnimation,
      duration: item.animationDuration,
    })

    // 从容器移除
    if (element.parentNode === container) {
      container.removeChild(element)
    }

    // 触发卸载回调
    this.config.onUnmount?.(element, item)
  }

  /**
   * 更新通知项
   */
  update(element: HTMLElement, item: NotificationItem): void {
    // 更新内容
    const messageEl = element.querySelector('.ldesign-notification-message')
    if (messageEl && item.message) {
      messageEl.textContent = item.message
    }

    const titleEl = element.querySelector('.ldesign-notification-title')
    if (titleEl && item.title) {
      titleEl.textContent = item.title
    }

    // 更新变体类名
    element.className = element.className.replace(
      /ldesign-\w+--\w+/g,
      ''
    )
    element.classList.add(`ldesign-${item.type}--${item.variant}`)

    // 更新自定义类名
    if (item.className) {
      element.classList.add(item.className)
    }

    // 更新自定义样式
    if (item.style) {
      Object.assign(element.style, item.style)
    }
  }

  /**
   * 创建图标元素
   */
  protected createIcon(item: NotificationItem): HTMLElement {
    const icon = document.createElement('span')
    icon.className = 'ldesign-notification-icon'

    if (item.icon) {
      if (typeof item.icon === 'string') {
        icon.textContent = item.icon
      }
      else {
        icon.appendChild(item.icon)
      }
    }
    else {
      // 默认图标
      const defaultIcons: Record<string, string> = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        loading: '⟳',
      }
      icon.textContent = defaultIcons[item.variant] || ''
    }

    // Loading 动画
    if (item.variant === 'loading') {
      icon.classList.add('ldesign-notification-loading')
    }

    return icon
  }

  /**
   * 创建关闭按钮
   */
  protected createCloseButton(onClose: () => void): HTMLElement {
    const button = document.createElement('button')
    button.className = 'ldesign-notification-close'
    button.setAttribute('aria-label', 'Close')
    button.textContent = '×'
    button.onclick = onClose

    return button
  }

  /**
   * 绑定事件
   */
  protected bindEvents(
    element: HTMLElement,
    item: NotificationItem,
    callbacks: {
      onClick?: () => void
      onMouseEnter?: () => void
      onMouseLeave?: () => void
      onFocus?: () => void
      onBlur?: () => void
    }
  ): void {
    if (callbacks.onClick) {
      element.onclick = callbacks.onClick
      element.style.cursor = 'pointer'
    }

    if (callbacks.onMouseEnter) {
      element.onmouseenter = callbacks.onMouseEnter
    }

    if (callbacks.onMouseLeave) {
      element.onmouseleave = callbacks.onMouseLeave
    }

    if (callbacks.onFocus) {
      element.addEventListener('focus', callbacks.onFocus)
    }

    if (callbacks.onBlur) {
      element.addEventListener('blur', callbacks.onBlur)
    }

    // 可访问性
    element.setAttribute('role', 'alert')
    element.setAttribute('aria-live', 'polite')
    element.setAttribute('tabindex', '0')
  }

  /**
   * 清理事件
   */
  protected unbindEvents(element: HTMLElement): void {
    element.onclick = null
    element.onmouseenter = null
    element.onmouseleave = null
  }
}



