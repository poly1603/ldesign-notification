/**
 * Toast 渲染器
 */

import type { NotificationItem } from '../types'
import { BaseRenderer } from './base'

/**
 * Toast 渲染器类
 */
export class ToastRenderer extends BaseRenderer {
  render(item: NotificationItem): HTMLElement {
    const toast = document.createElement('div')
    toast.className = `ldesign-toast ldesign-toast--${item.variant}`
    toast.setAttribute('data-id', item.id)
    toast.setAttribute('data-status', 'entering')

    // 自定义类名
    if (item.className) {
      toast.classList.add(item.className)
    }

    // 自定义样式
    if (item.style) {
      Object.assign(toast.style, item.style)
    }

    // 创建内容容器
    const content = document.createElement('div')
    content.className = 'ldesign-toast-content'

    // 添加图标
    if (item.icon !== false) {
      const icon = this.createIcon(item)
      content.appendChild(icon)
    }

    // 添加消息
    const message = document.createElement('div')
    message.className = 'ldesign-toast-message'
    message.textContent = item.message
    content.appendChild(message)

    toast.appendChild(content)

    // 添加关闭按钮
    if (item.dismissible) {
      const closeButton = this.createCloseButton(() => {
        item.onClose(item.id)
      })
      toast.appendChild(closeButton)
    }

    // 添加进度条（如果有持续时间）
    if (item.duration > 0 && item.variant !== 'loading') {
      const progress = this.createProgressBar(item)
      toast.appendChild(progress)
    }

    // 绑定事件
    this.bindEvents(toast, item, {
      onClick: item.onClick ? () => item.onClick(item.id) : undefined,
      onMouseEnter: item.pauseOnHover
        ? () => this.onMouseEnter(toast, item)
        : undefined,
      onMouseLeave: item.pauseOnHover
        ? () => this.onMouseLeave(toast, item)
        : undefined,
    })

    // 手势支持（移动端）
    this.addSwipeGesture(toast, item)

    return toast
  }

  /**
   * 创建进度条
   */
  private createProgressBar(item: NotificationItem): HTMLElement {
    const progressContainer = document.createElement('div')
    progressContainer.className = 'ldesign-notification-progress'

    const progressBar = document.createElement('div')
    progressBar.className = 'ldesign-notification-progress-bar'
    progressBar.style.animationDuration = `${item.duration}ms`

    progressContainer.appendChild(progressBar)
    return progressContainer
  }

  /**
   * 鼠标进入事件
   */
  private onMouseEnter(element: HTMLElement, item: NotificationItem): void {
    element.setAttribute('data-paused', 'true')
    // 暂停进度条动画
    const progressBar = element.querySelector('.ldesign-notification-progress-bar') as HTMLElement
    if (progressBar) {
      progressBar.style.animationPlayState = 'paused'
    }
  }

  /**
   * 鼠标离开事件
   */
  private onMouseLeave(element: HTMLElement, item: NotificationItem): void {
    element.removeAttribute('data-paused')
    // 恢复进度条动画
    const progressBar = element.querySelector('.ldesign-notification-progress-bar') as HTMLElement
    if (progressBar) {
      progressBar.style.animationPlayState = 'running'
    }
  }

  /**
   * 添加滑动手势支持
   */
  private addSwipeGesture(element: HTMLElement, item: NotificationItem): void {
    let startX = 0
    let currentX = 0
    let isDragging = false

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      isDragging = true
      element.classList.add('dragging')
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging)
        return

      currentX = e.touches[0].clientX
      const diff = currentX - startX

      // 只允许向外滑动
      if (Math.abs(diff) > 10) {
        element.style.transform = `translateX(${diff}px)`
        element.style.opacity = `${1 - Math.abs(diff) / 200}`

        if (Math.abs(diff) > 100) {
          element.classList.add('will-dismiss')
        }
        else {
          element.classList.remove('will-dismiss')
        }
      }
    }

    const handleTouchEnd = () => {
      if (!isDragging)
        return

      isDragging = false
      element.classList.remove('dragging')

      const diff = currentX - startX

      // 如果滑动距离超过阈值，关闭通知
      if (Math.abs(diff) > 100) {
        item.onClose(item.id)
      }
      else {
        // 恢复位置
        element.style.transform = ''
        element.style.opacity = ''
        element.classList.remove('will-dismiss')
      }
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)
    element.addEventListener('touchcancel', handleTouchEnd)
  }
}



