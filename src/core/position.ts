/**
 * 位置管理器
 */

import type { NotificationItem, Position, StackStrategy } from '../types'

/**
 * 位置容器信息
 */
interface PositionContainer {
  position: Position
  element: HTMLElement
  items: NotificationItem[]
}

/**
 * 位置管理器类
 */
export class PositionManager {
  private containers: Map<Position, PositionContainer> = new Map()
  private offset: number
  private stackStrategy: StackStrategy

  constructor(offset = 16, stackStrategy: StackStrategy = 'stack') {
    this.offset = offset
    this.stackStrategy = stackStrategy
  }

  /**
   * 获取或创建容器
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
      this.containers.set(position, container)
    }

    return container.element
  }

  /**
   * 创建位置容器
   */
  private createContainer(position: Position): HTMLElement {
    const container = document.createElement('div')
    container.className = `ldesign-notification-container ldesign-notification-container--${position}`
    container.setAttribute('data-position', position)

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
   * 获取位置样式
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
   */
  addItem(position: Position, item: NotificationItem): void {
    const container = this.containers.get(position)
    if (container) {
      container.items.push(item)
      this.updateLayout(position)
    }
  }

  /**
   * 从容器移除通知
   */
  removeItem(position: Position, id: string): void {
    const container = this.containers.get(position)
    if (container) {
      const index = container.items.findIndex(item => item.id === id)
      if (index !== -1) {
        container.items.splice(index, 1)
        this.updateLayout(position)
      }
    }
  }

  /**
   * 更新容器布局
   */
  private updateLayout(position: Position): void {
    const container = this.containers.get(position)
    if (!container)
      return

    const { items, element } = container

    // 根据堆叠策略更新布局
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



