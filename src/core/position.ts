/**
 * 位置管理器
 * 
 * @description
 * 管理通知在屏幕上的位置和布局：
 * - 创建和管理位置容器
 * - 计算通知的偏移量
 * - 应用不同的堆叠策略
 * - 支持 9 个预定义位置
 * 
 * @example
 * ```ts
 * const manager = new PositionManager(16, 'stack')
 * const container = manager.getContainer('top-right')
 * manager.addItem('top-right', notificationItem)
 * ```
 */

import type { NotificationItem, Position, StackStrategy } from '../types'
import { rafBatch } from '../utils/helpers'

/**
 * 位置容器信息接口
 * 
 * @interface PositionContainer
 */
interface PositionContainer {
  /** 位置标识 */
  position: Position
  /** 容器 DOM 元素 */
  element: HTMLElement
  /** 该位置的通知列表 */
  items: NotificationItem[]
  /** ResizeObserver 实例 */
  observer?: ResizeObserver
}

/**
 * 位置管理器类
 * 
 * @class PositionManager
 * @description 管理通知的屏幕位置和布局策略
 */
export class PositionManager {
  /** 位置容器映射 */
  private containers: Map<Position, PositionContainer> = new Map()

  /** 容器与屏幕边缘的偏移量（像素） */
  private offset: number

  /** 堆叠策略 */
  private stackStrategy: StackStrategy

  /** 是否启用 ResizeObserver */
  private useResizeObserver = typeof window !== 'undefined' && 'ResizeObserver' in window

  /**
   * 构造函数
   * 
   * @param offset - 偏移量（像素），默认 16
   * @param stackStrategy - 堆叠策略，默认 'stack'
   */
  constructor(offset = 16, stackStrategy: StackStrategy = 'stack') {
    this.offset = offset
    this.stackStrategy = stackStrategy
  }

  /**
   * 获取或创建容器
   * 
   * @param position - 位置标识
   * @returns 容器 DOM 元素
   * 
   * @description
   * 懒加载方式创建位置容器，只在需要时创建
   */
  getContainer(position: Position): HTMLElement {
    let container = this.containers.get(position)

    if (!container) {
      const element = this.createContainer(position)
      container = {
        position,
        element,
        items: [],
      }

      // 如果支持 ResizeObserver，监听容器大小变化
      if (this.useResizeObserver) {
        this.setupResizeObserver(container)
      }

      this.containers.set(position, container)
    }

    return container.element
  }

  /**
   * 创建位置容器
   * 
   * @private
   * @param position - 位置标识
   * @returns 容器 DOM 元素
   * 
   * @description
   * 创建固定定位的容器，并设置对应的位置样式
   */
  private createContainer(position: Position): HTMLElement {
    const container = document.createElement('div')
    container.className = `ldesign-notification-container ldesign-notification-container--${position}`
    container.setAttribute('data-position', position)
    container.setAttribute('role', 'region')
    container.setAttribute('aria-label', `通知容器 - ${position}`)

    // 设置容器样式
    Object.assign(container.style, {
      position: 'fixed',
      zIndex: '9999',
      pointerEvents: 'none',
      ...this.getPositionStyles(position),
    })

    document.body.appendChild(container)
    return container
  }

  /**
   * 设置 ResizeObserver
   * 
   * @private
   * @param container - 位置容器
   * 
   * @description
   * 监听容器大小变化，自动更新布局
   */
  private setupResizeObserver(container: PositionContainer): void {
    try {
      const observer = new ResizeObserver(() => {
        this.updateLayout(container.position)
      })

      observer.observe(container.element)
      container.observer = observer
    }
    catch (error) {
      console.warn('[PositionManager] ResizeObserver setup failed:', error)
    }
  }

  /**
   * 获取位置样式
   * 
   * @private
   * @param position - 位置标识
   * @returns CSS 样式对象
   * 
   * @description
   * 根据位置标识返回对应的 CSS 定位样式
   */
  private getPositionStyles(position: Position): Partial<CSSStyleDeclaration> {
    const offset = `${this.offset}px`

    const styles: Record<Position, Partial<CSSStyleDeclaration>> = {
      'top': {
        top: offset,
        left: '50%',
        transform: 'translateX(-50%)',
      },
      'top-center': {
        top: offset,
        left: '50%',
        transform: 'translateX(-50%)',
      },
      'top-left': {
        top: offset,
        left: offset,
      },
      'top-right': {
        top: offset,
        right: offset,
      },
      'bottom': {
        bottom: offset,
        left: '50%',
        transform: 'translateX(-50%)',
      },
      'bottom-center': {
        bottom: offset,
        left: '50%',
        transform: 'translateX(-50%)',
      },
      'bottom-left': {
        bottom: offset,
        left: offset,
      },
      'bottom-right': {
        bottom: offset,
        right: offset,
      },
      'center': {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
    }

    return styles[position] || styles.top
  }

  /**
   * 添加通知到容器
   * 
   * @param position - 位置标识
   * @param item - 通知项
   * 
   * @description
   * 将通知添加到指定位置的容器，并触发布局更新
   */
  addItem(position: Position, item: NotificationItem): void {
    const container = this.containers.get(position)
    if (container) {
      container.items.push(item)
      // 使用 RAF 批量更新，避免布局抖动
      rafBatch(() => {
        this.updateLayout(position)
      })
    }
  }

  /**
   * 从容器移除通知
   * 
   * @param position - 位置标识
   * @param id - 通知 ID
   * 
   * @description
   * 从指定位置的容器中移除通知，并触发布局更新
   */
  removeItem(position: Position, id: string): void {
    const container = this.containers.get(position)
    if (container) {
      const index = container.items.findIndex(item => item.id === id)
      if (index !== -1) {
        container.items.splice(index, 1)
        // 使用 RAF 批量更新
        rafBatch(() => {
          this.updateLayout(position)
        })
      }
    }
  }

  /**
   * 更新容器布局
   * 
   * @private
   * @param position - 位置标识
   * 
   * @description
   * 根据当前的堆叠策略重新计算和应用布局
   */
  private updateLayout(position: Position): void {
    const container = this.containers.get(position)
    if (!container) {
      return
    }

    const { items, element } = container

    // 根据堆叠策略更新布局
    try {
      switch (this.stackStrategy) {
        case 'stack':
          this.applyStackLayout(element, items)
          break
        case 'overlap':
          this.applyOverlapLayout(element, items)
          break
        case 'replace':
          this.applyReplaceLayout(element, items)
          break
        case 'collapse':
          this.applyCollapseLayout(element, items)
          break
      }
    }
    catch (error) {
      console.error('[PositionManager] Update layout failed:', error)
    }
  }

  /**
   * 堆叠布局
   */
  private applyStackLayout(container: HTMLElement, items: NotificationItem[]): void {
    // 默认行为，通知依次堆叠
    const children = Array.from(container.children) as HTMLElement[]
    children.forEach((child, index) => {
      child.style.marginBottom = index < children.length - 1 ? '8px' : '0'
    })
  }

  /**
   * 重叠布局
   */
  private applyOverlapLayout(container: HTMLElement, items: NotificationItem[]): void {
    const children = Array.from(container.children) as HTMLElement[]
    children.forEach((child, index) => {
      child.style.position = 'absolute'
      child.style.top = `${index * 10}px`
      child.style.opacity = index === children.length - 1 ? '1' : '0.8'
    })
  }

  /**
   * 替换布局（只显示最新的）
   */
  private applyReplaceLayout(container: HTMLElement, items: NotificationItem[]): void {
    const children = Array.from(container.children) as HTMLElement[]
    children.forEach((child, index) => {
      child.style.display = index === children.length - 1 ? 'block' : 'none'
    })
  }

  /**
   * 折叠布局
   */
  private applyCollapseLayout(container: HTMLElement, items: NotificationItem[]): void {
    const maxVisible = 3
    const children = Array.from(container.children) as HTMLElement[]

    children.forEach((child, index) => {
      if (index < maxVisible) {
        child.style.display = 'block'
        child.style.transform = `scale(${1 - index * 0.05})`
        child.style.opacity = `${1 - index * 0.2}`
      }
      else {
        child.style.display = 'none'
      }
    })
  }

  /**
   * 计算通知偏移量
   */
  calculateOffset(position: Position, items: NotificationItem[]): number[] {
    const container = this.containers.get(position)
    if (!container)
      return []

    const offsets: number[] = []
    let currentOffset = 0

    items.forEach((item, index) => {
      offsets.push(currentOffset)
      // 假设每个通知高度 + 间距
      currentOffset += 60 + 8 // 默认高度 + 间距
    })

    return offsets
  }

  /**
   * 销毁容器
   */
  destroyContainer(position: Position): void {
    const container = this.containers.get(position)
    if (container) {
      container.element.remove()
      this.containers.delete(position)
    }
  }

  /**
   * 销毁所有容器
   */
  destroyAll(): void {
    this.containers.forEach(container => {
      container.element.remove()
    })
    this.containers.clear()
  }

  /**
   * 设置堆叠策略
   */
  setStackStrategy(strategy: StackStrategy): void {
    this.stackStrategy = strategy
    // 更新所有容器的布局
    this.containers.forEach((_, position) => {
      this.updateLayout(position)
    })
  }

  /**
   * 设置偏移量
   */
  setOffset(offset: number): void {
    this.offset = offset
    // 重新创建所有容器
    const positions = Array.from(this.containers.keys())
    this.destroyAll()
    positions.forEach(position => this.getContainer(position))
  }
}



