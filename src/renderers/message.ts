/**
 * Message 渲染器
 */

import type { NotificationItem } from '../types'
import { BaseRenderer } from './base'

/**
 * Message 渲染器类
 */
export class MessageRenderer extends BaseRenderer {
  render(item: NotificationItem): HTMLElement {
    const message = document.createElement('div')
    message.className = `ldesign-message ldesign-message--${item.variant}`
    message.setAttribute('data-id', item.id)
    message.setAttribute('data-status', 'entering')

    // 自定义类名
    if (item.className) {
      message.classList.add(item.className)
    }

    // 自定义样式
    if (item.style) {
      Object.assign(message.style, item.style)
    }

    // 创建内容容器
    const content = document.createElement('div')
    content.className = 'ldesign-message-content'

    // 添加图标
    if (item.icon !== false) {
      const icon = this.createIcon(item)
      content.appendChild(icon)
    }

    // 添加文本
    const text = document.createElement('span')
    text.className = 'ldesign-message-text'
    text.textContent = item.message
    content.appendChild(text)

    message.appendChild(content)

    // 添加关闭按钮（如果配置了）
    const showClose = item.data?.showClose
    if (showClose) {
      const closeButton = this.createCloseButton(() => {
        item.onClose(item.id)
      })
      message.appendChild(closeButton)
    }

    // 绑定事件
    this.bindEvents(message, item, {
      onClick: item.onClick ? () => item.onClick(item.id) : undefined,
    })

    return message
  }
}



