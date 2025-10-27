/**
 * DOM 元素复用池
 * 
 * @description
 * 通过复用 DOM 元素来减少频繁创建/销毁的性能开销
 * 
 * 特性：
 * - 按类型分类管理元素池
 * - 自动清理过期元素
 * - 内存使用监控
 * - 元素重置机制
 */

import type { NotificationItem } from '../types'
import { DOM_POOL } from '../constants'

/**
 * 池化元素接口
 */
interface PooledElement {
  /** DOM 元素 */
  element: HTMLElement
  /** 通知类型 */
  type: NotificationItem['type']
  /** 创建时间 */
  createdAt: number
  /** 最后使用时间 */
  lastUsedAt: number
  /** 使用次数 */
  useCount: number
}

/**
 * DOM 复用池类
 * 
 * @class DOMPool
 * @description 管理可复用的 DOM 元素，提升性能
 */
export class DOMPool {
  /** 可用元素池（按类型分组） */
  private availablePool: Map<NotificationItem['type'], PooledElement[]> = new Map()

  /** 使用中的元素 */
  private inUseElements: WeakMap<HTMLElement, PooledElement> = new WeakMap()

  /** 每种类型的最大缓存数量 */
  private maxSize: number

  /** 清理定时器 */
  private cleanupTimer: number | null = null

  /** 是否启用池化 */
  private enabled = true

  /**
   * 构造函数
   * 
   * @param maxSize - 每种类型的最大缓存数量
   */
  constructor(maxSize = DOM_POOL.MAX_SIZE) {
    this.maxSize = maxSize
    this.startCleanupTimer()
  }

  /**
   * 获取元素（从池中取出或创建新的）
   * 
   * @param type - 通知类型
   * @param creator - 创建元素的函数
   * @returns HTML 元素
   * 
   * @description
   * 1. 尝试从池中获取可用元素
   * 2. 如果没有可用元素，调用 creator 创建新元素
   * 3. 重置元素状态
   * 4. 标记为使用中
   * 
   * @example
   * ```ts
   * const element = pool.acquire('toast', () => {
   *   return document.createElement('div')
   * })
   * ```
   */
  acquire(
    type: NotificationItem['type'],
    creator: () => HTMLElement
  ): HTMLElement {
    if (!this.enabled) {
      return creator()
    }

    try {
      // 尝试从池中获取
      const pool = this.availablePool.get(type)
      if (pool && pool.length > 0) {
        const pooled = pool.pop()!

        // 重置元素状态
        this.resetElement(pooled.element)

        // 更新使用信息
        pooled.lastUsedAt = Date.now()
        pooled.useCount++

        // 标记为使用中
        this.inUseElements.set(pooled.element, pooled)

        return pooled.element
      }

      // 池中没有可用元素，创建新的
      const element = creator()
      const pooled: PooledElement = {
        element,
        type,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        useCount: 1,
      }

      this.inUseElements.set(element, pooled)

      return element
    }
    catch (error) {
      console.error('[DOMPool] Acquire element failed:', error)
      return creator()
    }
  }

  /**
   * 释放元素（归还到池中）
   * 
   * @param element - 要释放的元素
   * 
   * @description
   * 将元素归还到池中以供后续复用
   * 如果池已满，则直接销毁元素
   * 
   * @example
   * ```ts
   * pool.release(element)
   * ```
   */
  release(element: HTMLElement): void {
    if (!this.enabled) {
      this.destroyElement(element)
      return
    }

    try {
      const pooled = this.inUseElements.get(element)
      if (!pooled) {
        // 不是池化元素，直接销毁
        this.destroyElement(element)
        return
      }

      // 从使用中移除
      // Note: WeakMap 不支持 delete，元素被 GC 时会自动清理

      // 获取对应类型的池
      let pool = this.availablePool.get(pooled.type)
      if (!pool) {
        pool = []
        this.availablePool.set(pooled.type, pool)
      }

      // 检查池是否已满
      if (pool.length >= this.maxSize) {
        // 池已满，销毁最老的元素
        const oldest = pool.shift()
        if (oldest) {
          this.destroyElement(oldest.element)
        }
      }

      // 重置并加入池中
      this.resetElement(element)
      pool.push(pooled)
    }
    catch (error) {
      console.error('[DOMPool] Release element failed:', error)
      this.destroyElement(element)
    }
  }

  /**
   * 重置元素状态
   * 
   * @private
   * @param element - 要重置的元素
   * 
   * @description
   * 清除元素的所有样式、类名、属性和内容，使其回到初始状态
   */
  private resetElement(element: HTMLElement): void {
    try {
      // 清除内联样式
      element.removeAttribute('style')

      // 清除所有类名
      element.className = ''

      // 清除所有自定义属性
      const attributes = Array.from(element.attributes)
      for (const attr of attributes) {
        if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
          element.removeAttribute(attr.name)
        }
      }

      // 清除内容
      element.innerHTML = ''

      // 移除所有事件监听器（通过克隆节点）
      // Note: 这会移除所有事件监听器，但也会断开父子关系
      // 所以我们只清除内容，不克隆节点

      // 重置可见性
      element.style.display = ''
      element.style.opacity = ''
      element.style.transform = ''
      element.style.transition = ''

      // 从 DOM 中移除（如果还在 DOM 中）
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
    catch (error) {
      console.error('[DOMPool] Reset element failed:', error)
    }
  }

  /**
   * 销毁元素
   * 
   * @private
   * @param element - 要销毁的元素
   */
  private destroyElement(element: HTMLElement): void {
    try {
      // 从 DOM 中移除
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }

      // 清除引用
      element.innerHTML = ''

      // Note: 实际的 GC 由浏览器处理
    }
    catch (error) {
      console.error('[DOMPool] Destroy element failed:', error)
    }
  }

  /**
   * 预热池（预创建元素）
   * 
   * @param type - 通知类型
   * @param count - 预创建数量
   * @param creator - 创建元素的函数
   * 
   * @description
   * 预先创建指定数量的元素放入池中，减少首次使用时的延迟
   * 
   * @example
   * ```ts
   * pool.warm('toast', 5, () => {
   *   return document.createElement('div')
   * })
   * ```
   */
  warm(
    type: NotificationItem['type'],
    count: number,
    creator: () => HTMLElement
  ): void {
    if (!this.enabled) {
      return
    }

    try {
      let pool = this.availablePool.get(type)
      if (!pool) {
        pool = []
        this.availablePool.set(type, pool)
      }

      const neededCount = Math.min(count, this.maxSize - pool.length)
      for (let i = 0; i < neededCount; i++) {
        const element = creator()
        const pooled: PooledElement = {
          element,
          type,
          createdAt: Date.now(),
          lastUsedAt: Date.now(),
          useCount: 0,
        }
        pool.push(pooled)
      }
    }
    catch (error) {
      console.error('[DOMPool] Warm pool failed:', error)
    }
  }

  /**
   * 清理过期元素
   * 
   * @private
   * @description
   * 移除长时间未使用的元素，释放内存
   */
  private cleanup(): void {
    try {
      const now = Date.now()
      const expiryTime = DOM_POOL.CLEANUP_DELAY

      for (const [type, pool] of this.availablePool) {
        // 过滤掉过期的元素
        const activeElements = pool.filter((pooled) => {
          const isExpired = now - pooled.lastUsedAt > expiryTime
          if (isExpired) {
            this.destroyElement(pooled.element)
            return false
          }
          return true
        })

        if (activeElements.length > 0) {
          this.availablePool.set(type, activeElements)
        }
        else {
          this.availablePool.delete(type)
        }
      }
    }
    catch (error) {
      console.error('[DOMPool] Cleanup failed:', error)
    }
  }

  /**
   * 启动清理定时器
   * 
   * @private
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      return
    }

    this.cleanupTimer = window.setInterval(() => {
      this.cleanup()
    }, DOM_POOL.CLEANUP_DELAY)
  }

  /**
   * 停止清理定时器
   * 
   * @private
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 清空池
   * 
   * @param type - 可选的类型，不传则清空所有类型
   * 
   * @description
   * 销毁池中的所有元素
   */
  clear(type?: NotificationItem['type']): void {
    try {
      if (type) {
        // 清空指定类型
        const pool = this.availablePool.get(type)
        if (pool) {
          for (const pooled of pool) {
            this.destroyElement(pooled.element)
          }
          this.availablePool.delete(type)
        }
      }
      else {
        // 清空所有类型
        for (const [, pool] of this.availablePool) {
          for (const pooled of pool) {
            this.destroyElement(pooled.element)
          }
        }
        this.availablePool.clear()
      }
    }
    catch (error) {
      console.error('[DOMPool] Clear pool failed:', error)
    }
  }

  /**
   * 获取池统计信息
   * 
   * @returns 统计信息对象
   * 
   * @description
   * 返回池的当前状态，用于调试和监控
   */
  getStats(): {
    enabled: boolean
    maxSize: number
    pools: Record<string, {
      available: number
      totalUseCount: number
      avgUseCount: number
      oldestAge: number
    }>
    totalAvailable: number
  } {
    const pools: Record<string, {
      available: number
      totalUseCount: number
      avgUseCount: number
      oldestAge: number
    }> = {}

    let totalAvailable = 0
    const now = Date.now()

    for (const [type, pool] of this.availablePool) {
      const totalUseCount = pool.reduce((sum, p) => sum + p.useCount, 0)
      const avgUseCount = pool.length > 0 ? totalUseCount / pool.length : 0
      const oldestAge = pool.length > 0
        ? Math.max(...pool.map(p => now - p.createdAt))
        : 0

      pools[type] = {
        available: pool.length,
        totalUseCount,
        avgUseCount: Math.round(avgUseCount * 100) / 100,
        oldestAge: Math.round(oldestAge / 1000), // 转换为秒
      }

      totalAvailable += pool.length
    }

    return {
      enabled: this.enabled,
      maxSize: this.maxSize,
      pools,
      totalAvailable,
    }
  }

  /**
   * 启用池化
   */
  enable(): void {
    this.enabled = true
    this.startCleanupTimer()
  }

  /**
   * 禁用池化
   * 
   * @description
   * 禁用后，acquire 会直接创建新元素，release 会直接销毁元素
   */
  disable(): void {
    this.enabled = false
    this.stopCleanupTimer()
    this.clear()
  }

  /**
   * 设置最大池大小
   * 
   * @param size - 新的最大大小
   */
  setMaxSize(size: number): void {
    this.maxSize = Math.max(1, size)

    // 清理超出大小的元素
    for (const [type, pool] of this.availablePool) {
      while (pool.length > this.maxSize) {
        const pooled = pool.shift()
        if (pooled) {
          this.destroyElement(pooled.element)
        }
      }
    }
  }

  /**
   * 销毁池
   * 
   * @description
   * 清理所有资源
   */
  destroy(): void {
    this.stopCleanupTimer()
    this.clear()
  }
}

/**
 * 导出全局单例
 */
export const domPool = new DOMPool()



