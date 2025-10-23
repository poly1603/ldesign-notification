/**
 * Alert 渲染器
 */

import type { AlertOptions, NotificationItem } from '../types'
import { BaseRenderer } from './base'

/**
 * Alert 渲染器类
 */
export class AlertRenderer extends BaseRenderer {
  render(item: NotificationItem): HTMLElement {
    const overlay = document.createElement('div')
    overlay.className = 'ldesign-alert-overlay'
    overlay.setAttribute('data-id', item.id)

    const alert = document.createElement('div')
    alert.className = 'ldesign-alert'

    const options = item.data as AlertOptions

    // 添加图标
    if (options.icon) {
      const iconEl = this.createAlertIcon(options.icon, options.iconHtml)
      alert.appendChild(iconEl)
    }

    // 添加标题
    if (options.title || item.title) {
      const title = document.createElement('div')
      title.className = 'ldesign-alert-title'
      title.textContent = options.title || item.title || ''
      alert.appendChild(title)
    }

    // 添加文本内容
    if (options.text || item.message) {
      const text = document.createElement('div')
      text.className = 'ldesign-alert-text'

      if (options.html) {
        text.innerHTML = options.html
      }
      else {
        text.textContent = options.text || item.message
      }

      alert.appendChild(text)
    }

    // 添加输入框
    if (options.input) {
      const inputWrapper = this.createInput(options, item)
      alert.appendChild(inputWrapper)
    }

    // 添加按钮组
    const buttons = this.createButtons(options, item)
    alert.appendChild(buttons)

    // 添加定时器进度条
    if (options.timer && options.timerProgressBar) {
      const progress = this.createTimerProgress(options.timer)
      alert.appendChild(progress)
    }

    overlay.appendChild(alert)

    // 点击遮罩关闭
    if (options.allowOutsideClick !== false) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          options.onCancel?.()
        }
      }
    }

    // ESC 键关闭
    if (options.allowEscapeKey !== false) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          options.onCancel?.()
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
      document.addEventListener('keydown', handleKeyDown)
    }

    // 生命周期钩子
    options.willOpen?.()
    requestAnimationFrame(() => {
      options.didOpen?.()
    })

    return overlay
  }

  /**
   * 创建 Alert 图标
   */
  private createAlertIcon(iconType: string, iconHtml?: string): HTMLElement {
    const icon = document.createElement('div')
    icon.className = `ldesign-alert-icon ldesign-alert-icon--${iconType}`

    if (iconHtml) {
      icon.innerHTML = iconHtml
    }
    else {
      const iconMap: Record<string, string> = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        question: '?',
      }
      icon.textContent = iconMap[iconType] || ''
    }

    return icon
  }

  /**
   * 创建输入框
   */
  private createInput(options: AlertOptions, item: NotificationItem): HTMLElement {
    const wrapper = document.createElement('div')

    const input = document.createElement('input')
    input.className = 'ldesign-alert-input'
    input.type = options.input || 'text'
    input.placeholder = options.inputPlaceholder || ''
    input.value = options.inputValue || ''

    if (options.inputAttributes) {
      Object.entries(options.inputAttributes).forEach(([key, value]) => {
        input.setAttribute(key, value)
      })
    }

    wrapper.appendChild(input)

    // 验证消息容器
    const validationMessage = document.createElement('div')
    validationMessage.className = 'ldesign-alert-validation'
    validationMessage.style.display = 'none'
    wrapper.appendChild(validationMessage)

    // 保存引用以便后续验证
    item.data = {
      ...item.data,
      inputElement: input,
      validationElement: validationMessage,
    }

    return wrapper
  }

  /**
   * 创建按钮组
   */
  private createButtons(options: AlertOptions, item: NotificationItem): HTMLElement {
    const container = document.createElement('div')
    container.className = 'ldesign-alert-buttons'

    const buttons: Array<{
      text: string
      type: string
      handler: () => void
    }> = []

    // 取消按钮
    if (options.showCancelButton) {
      buttons.push({
        text: options.cancelButtonText || 'Cancel',
        type: 'cancel',
        handler: () => {
          options.onCancel?.()
        },
      })
    }

    // 拒绝按钮
    if (options.showDenyButton) {
      buttons.push({
        text: options.denyButtonText || 'No',
        type: 'deny',
        handler: () => {
          options.onDeny?.()
        },
      })
    }

    // 确认按钮
    if (options.showConfirmButton !== false) {
      buttons.push({
        text: options.confirmButtonText || 'OK',
        type: 'confirm',
        handler: async () => {
          // 如果有输入框，先验证
          if (options.input && options.inputValidator) {
            const input = item.data.inputElement as HTMLInputElement
            const validationEl = item.data.validationElement as HTMLElement

            const error = await options.inputValidator(input.value)
            if (error) {
              validationEl.textContent = error
              validationEl.style.display = 'block'
              input.classList.add('ldesign-alert-input--error')
              return
            }
          }

          // preConfirm 钩子
          if (options.preConfirm) {
            const input = item.data.inputElement as HTMLInputElement
            const value = input?.value
            try {
              await options.preConfirm(value)
            }
            catch (error) {
              console.error('preConfirm error:', error)
              return
            }
          }

          options.onConfirm?.()
        },
      })
    }

    // 反转按钮顺序
    if (options.reverseButtons) {
      buttons.reverse()
    }

    // 创建按钮元素
    buttons.forEach((btn) => {
      const button = document.createElement('button')
      button.className = `ldesign-alert-button ldesign-alert-button--${btn.type}`
      button.textContent = btn.text

      if (btn.type === 'confirm' && options.confirmButtonColor) {
        button.style.background = options.confirmButtonColor
      }

      if (btn.type === 'cancel' && options.cancelButtonColor) {
        button.style.borderColor = options.cancelButtonColor
        button.style.color = options.cancelButtonColor
      }

      if (btn.type === 'deny' && options.denyButtonColor) {
        button.style.background = options.denyButtonColor
      }

      button.onclick = btn.handler

      container.appendChild(button)
    })

    return container
  }

  /**
   * 创建定时器进度条
   */
  private createTimerProgress(duration: number): HTMLElement {
    const progress = document.createElement('div')
    progress.className = 'ldesign-alert-timer-progress'
    progress.style.animationDuration = `${duration}ms`
    return progress
  }

  /**
   * 卸载时调用生命周期钩子
   */
  async unmount(
    element: HTMLElement,
    container: HTMLElement,
    item: NotificationItem
  ): Promise<void> {
    const options = item.data as AlertOptions
    options.willClose?.()

    await super.unmount(element, container, item)

    options.didClose?.()
  }
}



