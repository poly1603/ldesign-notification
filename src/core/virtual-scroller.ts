/**
 * 虚拟滚动管理器
 * 
 * @description
 * 为大量通知提供虚拟滚动支持，提升性能：
 * - 只渲染可见区域的通知
 * - 动态计算通知高度
 * - 缓冲区机制减少闪烁
 * - IntersectionObserver 优化
 * 
 * @example
 * ```ts
 * const scroller = new VirtualScroller(container, {
 *   itemHeight: 60,
 *   bufferSize: 3,
 *   threshold: 10
 * })
 * 
 * scroller.setItems(notifications)
 * scroller.enable()
 * ```
 */

import type { NotificationItem } from '../types'
import { VIRTUAL_SCROLL } from '../constants'
import { getElementHeight } from '../utils/helpers'

/**
 * 虚拟滚动配置接口
 */
export interface VirtualScrollerConfig {
  /** 单个项的默认高度（像素） */
  itemHeight?: number
  /** 缓冲区大小（上下各多渲染几个） */
  bufferSize?: number
  /** 启用虚拟滚动的最小项数 */
  threshold?: number
  /** 是否使用动态高度 */
  dynamicHeight?: boolean
}

/**
 * 可见范围接口
 */
interface VisibleRange {
  /** 起始索引 */
  start: number
  /** 结束索引 */
  end: number
  /** 偏移量（像素） */
  offset: number
}

/**
 * 项高度缓存
 */
interface ItemHeightCache {
  /** 项 ID */
  id: string
  /** 高度（像素） */
  height: number
  /** 偏移量（像素） */
  offset: number
}

/**
 * 虚拟滚动管理器类
 * 
 * @class VirtualScroller
 * @description 实现高性能的虚拟滚动，只渲染可见项
 */
export class VirtualScroller {
  /** 容器元素 */
  private container: HTMLElement

  /** 配置 */
  private config: Required<VirtualScrollerConfig>

  /** 通知项列表 */
  private items: NotificationItem[] = []

  /** 可见范围 */
  private visibleRange: VisibleRange = {
    start: 0,
    end: 0,
    offset: 0,
  }

  /** 项高度缓存 */
  private heightCache: Map<string, ItemHeightCache> = new Map()

  /** IntersectionObserver 实例 */
  private observer: IntersectionObserver | null = null

  /** ResizeObserver 实例 */
  private resizeObserver: ResizeObserver | null = null

  /** 是否启用 */
  private enabled = false

  /** 滚动占位元素 */
  private spacer: HTMLElement | null = null

  /** 内容包装元素 */
  private content: HTMLElement | null = null

  /**
   * 构造函数
   * 
   * @param container - 容器元素
   * @param config - 虚拟滚动配置
   */
  constructor(container: HTMLElement, config?: VirtualScrollerConfig) {
    this.container = container
    this.config = {
      itemHeight: config?.itemHeight || VIRTUAL_SCROLL.ITEM_HEIGHT,
      bufferSize: config?.bufferSize || VIRTUAL_SCROLL.BUFFER_SIZE,
      threshold: config?.threshold || VIRTUAL_SCROLL.MIN_ITEMS,
      dynamicHeight: config?.dynamicHeight !== undefined ? config.dynamicHeight : true,
    }
  }

  /**
   * 设置通知项列表
   * 
   * @param items - 通知项数组
   * 
   * @description
   * 更新通知列表，如果超过阈值自动启用虚拟滚动
   */
  setItems(items: NotificationItem[]): void {
    try {
      this.items = items

      // 如果项数少于阈值，禁用虚拟滚动
      if (items.length < this.config.threshold) {
        if (this.enabled) {
          this.disable()
        }
        return
      }

      // 如果未启用且超过阈值，启用虚拟滚动
      if (!this.enabled) {
        this.enable()
      }

      // 更新可见范围
      this.updateVisibleRange()
    }
    catch (error) {
      console.error('[VirtualScroller] Set items failed:', error)
    }
  }

  /**
   * 启用虚拟滚动
   * 
   * @description
   * 初始化虚拟滚动所需的 DOM 结构和事件监听
   */
  enable(): void {
    if (this.enabled) {
      return
    }

    try {
      // 创建虚拟滚动结构
      this.setupVirtualStructure()

      // 设置 IntersectionObserver
      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver()
      }

      // 设置 ResizeObserver（用于动态高度）
      if (this.config.dynamicHeight && 'ResizeObserver' in window) {
        this.setupResizeObserver()
      }

      // 监听滚动事件
      this.container.addEventListener('scroll', this.handleScroll, { passive: true })

      this.enabled = true

      // 初始渲染
      this.updateVisibleRange()
    }
    catch (error) {
      console.error('[VirtualScroller] Enable failed:', error)
    }
  }

  /**
   * 禁用虚拟滚动
   * 
   * @description
   * 清理虚拟滚动相关的 DOM 和事件监听
   */
  disable(): void {
    if (!this.enabled) {
      return
    }

    try {
      // 清理 Observer
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }

      // 移除事件监听
      this.container.removeEventListener('scroll', this.handleScroll)

      // 恢复原始结构
      this.cleanupVirtualStructure()

      this.enabled = false
    }
    catch (error) {
      console.error('[VirtualScroller] Disable failed:', error)
    }
  }

  /**
   * 设置虚拟滚动结构
   * 
   * @private
   * @description
   * 创建 spacer（占位）和 content（内容）元素
   */
  private setupVirtualStructure(): void {
    // 创建占位元素（撑开滚动区域）
    this.spacer = document.createElement('div')
    this.spacer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      pointer-events: none;
    `
    this.container.appendChild(this.spacer)

    // 创建内容包装元素
    this.content = document.createElement('div')
    this.content.style.cssText = `
      position: relative;
      will-change: transform;
    `

    // 将现有子元素移到 content 中
    const children = Array.from(this.container.children)
    for (const child of children) {
      if (child !== this.spacer) {
        this.content.appendChild(child)
      }
    }

    this.container.appendChild(this.content)

    // 设置容器样式
    this.container.style.position = 'relative'
    this.container.style.overflow = 'auto'
  }

  /**
   * 清理虚拟滚动结构
   * 
   * @private
   */
  private cleanupVirtualStructure(): void {
    if (this.content) {
      // 将子元素移回容器
      const children = Array.from(this.content.children)
      for (const child of children) {
        this.container.appendChild(child)
      }
      this.content.remove()
      this.content = null
    }

    if (this.spacer) {
      this.spacer.remove()
      this.spacer = null
    }
  }

  /**
   * 设置 IntersectionObserver
   * 
   * @private
   * @description
   * 监听通知项的可见性，优化渲染
   */
  private setupIntersectionObserver(): void {
    try {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const element = entry.target as HTMLElement
            const id = element.getAttribute('data-id')

            if (!id) continue

            if (entry.isIntersecting) {
              // 元素可见，确保渲染
              element.style.visibility = 'visible'
            }
            else {
              // 元素不可见，可以隐藏（但保留空间）
              element.style.visibility = 'hidden'
            }
          }
        },
        {
          root: this.container,
          rootMargin: `${this.config.itemHeight * this.config.bufferSize}px`,
          threshold: 0,
        }
      )

      // 观察所有通知项
      this.observeItems()
    }
    catch (error) {
      console.error('[VirtualScroller] Setup IntersectionObserver failed:', error)
    }
  }

  /**
   * 设置 ResizeObserver
   * 
   * @private
   * @description
   * 监听通知项高度变化，更新缓存
   */
  private setupResizeObserver(): void {
    try {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement
          const id = element.getAttribute('data-id')

          if (!id) continue

          const height = entry.contentRect.height
          const cache = this.heightCache.get(id)

          if (cache && cache.height !== height) {
            cache.height = height
            // 高度变化，重新计算偏移量
            this.recalculateOffsets()
            this.updateVisibleRange()
          }
        }
      })
    }
    catch (error) {
      console.error('[VirtualScroller] Setup ResizeObserver failed:', error)
    }
  }

  /**
   * 观察所有项
   * 
   * @private
   */
  private observeItems(): void {
    if (!this.observer || !this.content) {
      return
    }

    const children = this.content.children
    for (const child of Array.from(children)) {
      this.observer.observe(child as HTMLElement)

      if (this.resizeObserver) {
        this.resizeObserver.observe(child as HTMLElement)
      }
    }
  }

  /**
   * 处理滚动事件
   * 
   * @private
   */
  private handleScroll = (): void => {
    this.updateVisibleRange()
  }

  /**
   * 更新可见范围
   * 
   * @private
   * @description
   * 计算当前滚动位置的可见项范围
   */
  private updateVisibleRange(): void {
    if (!this.enabled || this.items.length === 0) {
      return
    }

    try {
      const scrollTop = this.container.scrollTop
      const containerHeight = this.container.clientHeight

      // 计算可见范围
      const { start, end, offset } = this.calculateVisibleRange(scrollTop, containerHeight)

      // 如果范围没有变化，跳过更新
      if (
        start === this.visibleRange.start &&
        end === this.visibleRange.end
      ) {
        return
      }

      this.visibleRange = { start, end, offset }

      // 更新 DOM
      this.updateDOM()
    }
    catch (error) {
      console.error('[VirtualScroller] Update visible range failed:', error)
    }
  }

  /**
   * 计算可见范围
   * 
   * @private
   * @param scrollTop - 滚动距离
   * @param containerHeight - 容器高度
   * @returns 可见范围
   */
  private calculateVisibleRange(
    scrollTop: number,
    containerHeight: number
  ): VisibleRange {
    const { bufferSize } = this.config

    // 计算可见区域的起始和结束位置
    const visibleStart = scrollTop
    const visibleEnd = scrollTop + containerHeight

    // 考虑缓冲区
    const bufferHeight = this.config.itemHeight * bufferSize
    const rangeStart = Math.max(0, visibleStart - bufferHeight)
    const rangeEnd = visibleEnd + bufferHeight

    // 计算对应的项索引
    let start = 0
    let end = this.items.length
    let currentOffset = 0

    for (let i = 0; i < this.items.length; i++) {
      const itemHeight = this.getItemHeight(this.items[i].id)
      const itemEnd = currentOffset + itemHeight

      if (itemEnd < rangeStart) {
        start = i + 1
      }

      if (currentOffset > rangeEnd) {
        end = i
        break
      }

      currentOffset += itemHeight
    }

    // 确保至少渲染一项
    if (start >= end) {
      end = Math.min(start + 1, this.items.length)
    }

    return {
      start: Math.max(0, start - bufferSize),
      end: Math.min(this.items.length, end + bufferSize),
      offset: this.getOffsetAt(start),
    }
  }

  /**
   * 获取项高度
   * 
   * @private
   * @param id - 项 ID
   * @returns 高度（像素）
   */
  private getItemHeight(id: string): number {
    const cache = this.heightCache.get(id)
    return cache ? cache.height : this.config.itemHeight
  }

  /**
   * 获取指定索引的偏移量
   * 
   * @private
   * @param index - 索引
   * @returns 偏移量（像素）
   */
  private getOffsetAt(index: number): number {
    let offset = 0
    for (let i = 0; i < index && i < this.items.length; i++) {
      offset += this.getItemHeight(this.items[i].id)
    }
    return offset
  }

  /**
   * 重新计算所有偏移量
   * 
   * @private
   */
  private recalculateOffsets(): void {
    let offset = 0
    for (const item of this.items) {
      const cache = this.heightCache.get(item.id)
      if (cache) {
        cache.offset = offset
        offset += cache.height
      }
      else {
        offset += this.config.itemHeight
      }
    }
  }

  /**
   * 更新 DOM
   * 
   * @private
   * @description
   * 根据可见范围更新 DOM，只渲染可见项
   */
  private updateDOM(): void {
    if (!this.content || !this.spacer) {
      return
    }

    try {
      // 计算总高度
      const totalHeight = this.items.reduce(
        (sum, item) => sum + this.getItemHeight(item.id),
        0
      )

      // 更新占位元素高度
      this.spacer.style.height = `${totalHeight}px`

      // 更新内容偏移量
      this.content.style.transform = `translateY(${this.visibleRange.offset}px)`

      // 触发自定义事件，通知外部更新渲染
      this.container.dispatchEvent(
        new CustomEvent('virtual-scroll-update', {
          detail: {
            start: this.visibleRange.start,
            end: this.visibleRange.end,
            offset: this.visibleRange.offset,
          },
        })
      )
    }
    catch (error) {
      console.error('[VirtualScroller] Update DOM failed:', error)
    }
  }

  /**
   * 缓存项高度
   * 
   * @param id - 项 ID
   * @param height - 高度（像素）
   * 
   * @description
   * 手动缓存项高度，用于动态高度场景
   */
  cacheItemHeight(id: string, height: number): void {
    if (!this.heightCache.has(id)) {
      this.heightCache.set(id, {
        id,
        height,
        offset: 0,
      })
      this.recalculateOffsets()
    }
    else {
      const cache = this.heightCache.get(id)!
      if (cache.height !== height) {
        cache.height = height
        this.recalculateOffsets()
      }
    }
  }

  /**
   * 滚动到指定项
   * 
   * @param index - 项索引
   * @param behavior - 滚动行为
   * 
   * @description
   * 滚动容器使指定项可见
   */
  scrollToItem(index: number, behavior: ScrollBehavior = 'smooth'): void {
    if (index < 0 || index >= this.items.length) {
      return
    }

    try {
      const offset = this.getOffsetAt(index)
      this.container.scrollTo({
        top: offset,
        behavior,
      })
    }
    catch (error) {
      console.error('[VirtualScroller] Scroll to item failed:', error)
    }
  }

  /**
   * 获取可见范围
   * 
   * @returns 当前可见范围
   */
  getVisibleRange(): VisibleRange {
    return { ...this.visibleRange }
  }

  /**
   * 检查是否启用
   * 
   * @returns 是否启用虚拟滚动
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 销毁虚拟滚动器
   * 
   * @description
   * 清理所有资源
   */
  destroy(): void {
    this.disable()
    this.items = []
    this.heightCache.clear()
  }
}


