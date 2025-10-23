/**
 * 堆叠管理器
 */

import type { NotificationItem, StackStrategy } from '../types'

/**
 * 堆叠管理器类
 */
export class StackManager {
  private strategy: StackStrategy

  constructor(strategy: StackStrategy = 'stack') {
    this.strategy = strategy
  }

  /**
   * 应用堆叠策略
   */
  applyStrategy(
    container: HTMLElement,
    items: NotificationItem[],
    newItem?: NotificationItem
  ): void {
    switch (this.strategy) {
      case 'stack':
        this.applyStack(container, items)
        break
      case 'overlap':
        this.applyOverlap(container, items)
        break
      case 'replace':
        this.applyReplace(container, items, newItem)
        break
      case 'collapse':
        this.applyCollapse(container, items)
        break
    }
  }

  /**
   * 堆叠策略 - 通知依次堆叠
   */
  private applyStack(container: HTMLElement, items: NotificationItem[]): void {
    const children = Array.from(container.children) as HTMLElement[]
    children.forEach((child, index) => {
      child.style.position = 'relative'
      child.style.marginBottom = index < children.length - 1 ? '8px' : '0'
      child.style.transform = 'none'
      child.style.opacity = '1'
      child.style.display = 'block'
    })
  }

  /**
   * 重叠策略 - 通知重叠显示
   */
  private applyOverlap(container: HTMLElement, items: NotificationItem[]): void {
    const children = Array.from(container.children) as HTMLElement[]
    const overlap = 10 // 每个通知重叠 10px

    children.forEach((child, index) => {
      child.style.position = 'absolute'
      child.style.top = `${index * overlap}px`
      child.style.left = '0'
      child.style.right = '0'
      child.style.zIndex = String(children.length - index)
      child.style.opacity = index === children.length - 1 ? '1' : '0.7'
      child.style.transform = `scale(${1 - index * 0.02})`
      child.style.display = 'block'
    })
  }

  /**
   * 替换策略 - 只显示最新的通知
   */
  private applyReplace(
    container: HTMLElement,
    items: NotificationItem[],
    newItem?: NotificationItem
  ): void {
    const children = Array.from(container.children) as HTMLElement[]

    if (children.length > 0) {
      // 只显示最后一个（最新的）
      children.forEach((child, index) => {
        if (index === children.length - 1) {
          child.style.display = 'block'
          child.style.opacity = '1'
          child.style.transform = 'none'
        }
        else {
          child.style.display = 'none'
        }
      })
    }
  }

  /**
   * 折叠策略 - 折叠多余的通知
   */
  private applyCollapse(container: HTMLElement, items: NotificationItem[]): void {
    const maxVisible = 3 // 最多显示 3 个
    const children = Array.from(container.children) as HTMLElement[]

    children.forEach((child, index) => {
      if (index < maxVisible) {
        child.style.display = 'block'
        child.style.position = 'relative'
        child.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 2}px)`
        child.style.opacity = `${1 - index * 0.2}`
        child.style.marginBottom = index < Math.min(children.length, maxVisible) - 1 ? '8px' : '0'
        child.style.filter = index > 0 ? `blur(${index}px)` : 'none'
      }
      else {
        child.style.display = 'none'
      }
    })

    // 如果有更多通知，显示计数
    if (children.length > maxVisible) {
      const count = children.length - maxVisible
      this.showMoreIndicator(container, count)
    }
    else {
      this.hideMoreIndicator(container)
    }
  }

  /**
   * 显示更多通知指示器
   */
  private showMoreIndicator(container: HTMLElement, count: number): void {
    let indicator = container.querySelector('.ldesign-notification-more') as HTMLElement

    if (!indicator) {
      indicator = document.createElement('div')
      indicator.className = 'ldesign-notification-more'
      container.appendChild(indicator)
    }

    indicator.textContent = `+${count} more`
    indicator.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 12px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 12px;
      font-size: 12px;
      pointer-events: none;
      z-index: 10000;
    `
  }

  /**
   * 隐藏更多通知指示器
   */
  private hideMoreIndicator(container: HTMLElement): void {
    const indicator = container.querySelector('.ldesign-notification-more')
    if (indicator) {
      indicator.remove()
    }
  }

  /**
   * 设置堆叠策略
   */
  setStrategy(strategy: StackStrategy): void {
    this.strategy = strategy
  }

  /**
   * 获取当前策略
   */
  getStrategy(): StackStrategy {
    return this.strategy
  }

  /**
   * 计算通知的 z-index
   */
  calculateZIndex(index: number, total: number): number {
    switch (this.strategy) {
      case 'overlap':
        return total - index
      case 'stack':
        return 1
      case 'replace':
        return index === total - 1 ? 1 : 0
      case 'collapse':
        return index < 3 ? 3 - index : 0
      default:
        return 1
    }
  }
}



