/**
 * Notification 渲染器
 */

import type { NotificationAction, NotificationItem } from '../types'
import { BaseRenderer } from './base'

/**
 * Notification 渲染器类
 */
export class NotificationRenderer extends BaseRenderer {
  render(item: NotificationItem): HTMLElement {
    const notification = document.createElement('div')
    notification.className = `ldesign-notification ldesign-notification--${item.variant}`
    notification.setAttribute('data-id', item.id)
    notification.setAttribute('data-status', 'entering')

    // 自定义类名
    if (item.className) {
      notification.classList.add(item.className)
    }

    // 自定义样式
    if (item.style) {
      Object.assign(notification.style, item.style)
    }

    // 创建头部
    const header = document.createElement('div')
    header.className = 'ldesign-notification-header'

    // 添加图标
    if (item.icon !== false) {
      const icon = this.createIcon(item)
      header.appendChild(icon)
    }

    // 创建头部内容
    const headerContent = document.createElement('div')
    headerContent.className = 'ldesign-notification-header-content'

    // 添加标题
    if (item.title) {
      const title = document.createElement('div')
      title.className = 'ldesign-notification-title'
      title.textContent = item.title
      headerContent.appendChild(title)
    }

    // 添加消息
    const message = document.createElement('div')
    message.className = 'ldesign-notification-message'
    message.textContent = item.message
    headerContent.appendChild(message)

    header.appendChild(headerContent)

    // 添加关闭按钮
    if (item.dismissible) {
      const closeButton = this.createCloseButton(() => {
        item.onClose(item.id)
      })
      header.appendChild(closeButton)
    }

    notification.appendChild(header)

    // 添加操作按钮
    const actions = item.data?.actions as NotificationAction[] | undefined
    if (actions && actions.length > 0) {
      const actionsContainer = this.createActions(actions, item)
      notification.appendChild(actionsContainer)
    }

    // 绑定事件
    this.bindEvents(notification, item, {
      onClick: item.onClick ? () => item.onClick(item.id) : undefined,
      onMouseEnter: item.pauseOnHover
        ? () => this.onMouseEnter(notification, item)
        : undefined,
      onMouseLeave: item.pauseOnHover
        ? () => this.onMouseLeave(notification, item)
        : undefined,
    })

    return notification
  }

  /**
   * 创建操作按钮
   */
  private createActions(actions: NotificationAction[], item: NotificationItem): HTMLElement {
    const container = document.createElement('div')
    container.className = 'ldesign-notification-actions'

    actions.forEach((action) => {
      const button = document.createElement('button')
      button.className = 'ldesign-notification-button'
      button.textContent = action.text

      if (action.type) {
        button.classList.add(`ldesign-notification-button--${action.type}`)
      }

      button.onclick = (e) => {
        e.stopPropagation()
        action.onClick(item.id)

        if (action.closeOnClick !== false) {
          item.onClose(item.id)
        }
      }

      container.appendChild(button)
    })

    return container
  }

  /**
   * 鼠标进入事件
   */
  private onMouseEnter(element: HTMLElement, item: NotificationItem): void {
    element.setAttribute('data-paused', 'true')
  }

  /**
   * 鼠标离开事件
   */
  private onMouseLeave(element: HTMLElement, item: NotificationItem): void {
    element.removeAttribute('data-paused')
  }
}



