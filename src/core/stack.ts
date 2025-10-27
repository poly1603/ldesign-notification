/**
 * 堆叠管理器
 * 
 * @description
 * 管理通知的堆叠显示策略：
 * - stack: 依次堆叠，每个通知完整显示
 * - overlap: 重叠显示，只显示部分内容
 * - replace: 替换模式，只显示最新的通知
 * - collapse: 折叠模式，最多显示 3 个，其余折叠
 * 
 * @example
 * ```ts
 * const manager = new StackManager('collapse')
 * manager.applyStrategy(container, items)
 * manager.setStrategy('stack')
 * ```
 */

import type { NotificationItem, StackStrategy } from '../types'
import { STACK_CONFIG } from '../constants'

/**
 * 堆叠管理器类
 * 
 * @class StackManager
 * @description 提供四种通知堆叠策略的实现
 */
export class StackManager {
  /** 当前堆叠策略 */
  private strategy: StackStrategy

  /** 更多通知指示器缓存 */
  private moreIndicators: WeakMap<HTMLElement, HTMLElement> = new WeakMap()

  /**
   * 构造函数
   * 
   * @param strategy - 堆叠策略，默认 'stack'
   */
  constructor(strategy: StackStrategy = 'stack') {
    this.strategy = strategy
  }

  /**
   * 应用堆叠策略
   * 
   * @param container - 容器元素
   * @param items - 通知项列表
   * @param newItem - 可选的新增通知项
   * 
   * @description
   * 根据当前策略对容器内的通知进行布局
   */
  applyStrategy(
    container: HTMLElement,
    items: NotificationItem[],
    newItem?: NotificationItem
  ): void {
    try {
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
    catch (error) {
      console.error('[StackManager] Apply strategy failed:', error)
    }
  }

  /**
   * 堆叠策略 - 通知依次堆叠
   * 
   * @private
   * @param container - 容器元素
   * @param items - 通知项列表
   * 
   * @description
   * 每个通知完整显示，依次向下堆叠，间隔 8px
   */
  private applyStack(container: HTMLElement, items: NotificationItem[]): void {
    const children = Array.from(container.children) as HTMLElement[]
    const gap = STACK_CONFIG.STACK_GAP

    children.forEach((child, index) => {
      child.style.position = 'relative'
      child.style.marginBottom = index < children.length - 1 ? `${gap}px` : '0'
      child.style.transform = 'none'
      child.style.opacity = '1'
      child.style.display = 'block'
      child.style.zIndex = '1'
    })
  }

  /**
   * 重叠策略 - 通知重叠显示
   * 
   * @private
   * @param container - 容器元素
   * @param items - 通知项列表
   * 
   * @description
   * 通知部分重叠，每个偏移 10px，最新的在最上面
   */
  private applyOverlap(container: HTMLElement, items: NotificationItem[]): void {
    const children = Array.from(container.children) as HTMLElement[]
    const overlap = STACK_CONFIG.OVERLAP_OFFSET

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
   * 
   * @private
   * @param container - 容器元素
   * @param items - 通知项列表
   * @param newItem - 新增的通知项（未使用）
   * 
   * @description
   * 只显示最新的通知，隐藏其他所有通知
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
          child.style.position = 'relative'
          child.style.zIndex = '1'
        }
        else {
          child.style.display = 'none'
        }
      })
    }
  }

  /**
   * 折叠策略 - 折叠多余的通知
   * 
   * @private
   * @param container - 容器元素
   * @param items - 通知项列表
   * 
   * @description
   * 最多显示 3 个通知，超出的显示 "+N more" 指示器
   * 显示的通知会逐渐缩小和模糊
   */
  private applyCollapse(container: HTMLElement, items: NotificationItem[]): void {
    const maxVisible = STACK_CONFIG.COLLAPSE_MAX_VISIBLE
    const children = Array.from(container.children) as HTMLElement[]
    const gap = STACK_CONFIG.STACK_GAP

    children.forEach((child, index) => {
      if (index < maxVisible) {
        child.style.display = 'block'
        child.style.position = 'relative'
        child.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 2}px)`
        child.style.opacity = `${1 - index * 0.2}`
        child.style.marginBottom = index < Math.min(children.length, maxVisible) - 1 ? `${gap}px` : '0'
        child.style.filter = index > 0 ? `blur(${index}px)` : 'none'
        child.style.zIndex = String(maxVisible - index)
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
   * 
   * @private
   * @param container - 容器元素
   * @param count - 隐藏的通知数量
   * 
   * @description
   * 在容器底部显示 "+N more" 指示器
   * 优先复用已存在的指示器
   */
  private showMoreIndicator(container: HTMLElement, count: number): void {
    // 尝试从缓存获取
    let indicator = this.moreIndicators.get(container)

    if (!indicator) {
      indicator = container.querySelector('.ldesign-notification-more') as HTMLElement
    }

    if (!indicator) {
      indicator = document.createElement('div')
      indicator.className = 'ldesign-notification-more'
      indicator.setAttribute('role', 'status')
      indicator.setAttribute('aria-live', 'polite')
      container.appendChild(indicator)
      this.moreIndicators.set(container, indicator)
    }

    indicator.textContent = `+${count} 条更多`
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
      white-space: nowrap;
    `
  }

  /**
   * 隐藏更多通知指示器
   * 
   * @private
   * @param container - 容器元素
   */
  private hideMoreIndicator(container: HTMLElement): void {
    const indicator = this.moreIndicators.get(container) ||
      container.querySelector('.ldesign-notification-more') as HTMLElement
    if (indicator) {
      indicator.style.display = 'none'
    }
  }

  /**
   * 设置堆叠策略
   * 
   * @param strategy - 新的堆叠策略
   * 
   * @description
   * 动态切换堆叠策略，立即生效
   */
  setStrategy(strategy: StackStrategy): void {
    this.strategy = strategy
  }

  /**
   * 获取当前策略
   * 
   * @returns 当前的堆叠策略
   */
  getStrategy(): StackStrategy {
    return this.strategy
  }

  /**
   * 计算通知的 z-index
   * 
   * @param index - 通知在列表中的索引
   * @param total - 通知总数
   * @returns 计算出的 z-index 值
   * 
   * @description
   * 根据不同的堆叠策略计算合适的 z-index
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
        return index < STACK_CONFIG.COLLAPSE_MAX_VISIBLE ? STACK_CONFIG.COLLAPSE_MAX_VISIBLE - index : 0
      default:
        return 1
    }
  }

  /**
   * 清理资源
   * 
   * @description
   * 清理所有缓存的指示器引用
   */
  destroy(): void {
    this.moreIndicators = new WeakMap()
  }
}



