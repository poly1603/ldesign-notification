/**
 * 通知队列系统
 * 
 * 使用 Map + 数组的混合结构实现高性能队列：
 * - Map 用于 O(1) 查找/更新/删除
 * - 数组用于维护插入顺序和优先级排序
 * - 索引缓存用于快速按位置/类型查询
 */

import type { NotificationItem, Position } from '../types'

/**
 * 优先级权重映射
 */
const PRIORITY_WEIGHTS: Record<string, number> = {
  high: 3,
  normal: 2,
  low: 1,
}

/**
 * 通知队列类
 * 
 * @class NotificationQueue
 * @description 高性能通知队列，支持优先级排序、位置索引、类型索引
 */
export class NotificationQueue {
  /** 通知项数组（维护顺序） */
  private items: NotificationItem[] = []

  /** 通知项 Map（快速查找） */
  private itemsMap: Map<string, NotificationItem> = new Map()

  /** 位置索引缓存 */
  private positionIndex: Map<Position, Set<string>> = new Map()

  /** 类型索引缓存 */
  private typeIndex: Map<NotificationItem['type'], Set<string>> = new Map()

  /** 最大队列大小 */
  private maxSize: number

  /** 索引是否需要重建 */
  private needsReindex = false

  /**
   * 构造函数
   * 
   * @param maxSize - 最大队列大小，0 表示无限制
   */
  constructor(maxSize = 0) {
    this.maxSize = maxSize
  }

  /**
   * 入队 - 添加通知到队列
   * 
   * @param item - 通知项
   * @returns 是否成功入队
   * 
   * @description
   * 1. 检查队列大小限制，超出时移除最早的通知
   * 2. 按优先级插入到正确位置
   * 3. 更新 Map 和索引缓存
   */
  enqueue(item: NotificationItem): boolean {
    try {
      // 检查最大数量限制
      if (this.maxSize > 0 && this.items.length >= this.maxSize) {
        // 移除最早的通知（FIFO）
        const removed = this.items.shift()
        if (removed) {
          this.removeFromIndexes(removed)
          this.itemsMap.delete(removed.id)
        }
      }

      // 按优先级查找插入位置（O(n)，但通常队列较短）
      const itemPriority = PRIORITY_WEIGHTS[item.priority] || PRIORITY_WEIGHTS.normal
      let insertIndex = this.items.length

      // 从后向前查找，找到第一个优先级 >= 当前项的位置
      for (let i = this.items.length - 1; i >= 0; i--) {
        const existingPriority = PRIORITY_WEIGHTS[this.items[i].priority] || PRIORITY_WEIGHTS.normal
        if (existingPriority >= itemPriority) {
          insertIndex = i + 1
          break
        }
        if (i === 0) {
          insertIndex = 0
        }
      }

      // 插入到数组
      this.items.splice(insertIndex, 0, item)

      // 添加到 Map
      this.itemsMap.set(item.id, item)

      // 更新索引
      this.addToIndexes(item)

      return true
    }
    catch (error) {
      console.error('[NotificationQueue] Enqueue failed:', error)
      return false
    }
  }

  /**
   * 出队 - 移除并返回队首元素
   * 
   * @returns 队首通知项，队列为空时返回 undefined
   */
  dequeue(): NotificationItem | undefined {
    try {
      const item = this.items.shift()
      if (item) {
        this.itemsMap.delete(item.id)
        this.removeFromIndexes(item)
      }
      return item
    }
    catch (error) {
      console.error('[NotificationQueue] Dequeue failed:', error)
      return undefined
    }
  }

  /**
   * 根据 ID 移除通知
   * 
   * @param id - 通知 ID
   * @returns 是否成功移除
   */
  remove(id: string): boolean {
    try {
      const item = this.itemsMap.get(id)
      if (!item) {
        return false
      }

      // 从数组移除
      const index = this.items.indexOf(item)
      if (index !== -1) {
        this.items.splice(index, 1)
      }

      // 从 Map 移除
      this.itemsMap.delete(id)

      // 从索引移除
      this.removeFromIndexes(item)

      return true
    }
    catch (error) {
      console.error('[NotificationQueue] Remove failed:', error)
      return false
    }
  }

  /**
   * 根据 ID 获取通知（O(1) 复杂度）
   * 
   * @param id - 通知 ID
   * @returns 通知项，不存在时返回 undefined
   */
  get(id: string): NotificationItem | undefined {
    return this.itemsMap.get(id)
  }

  /**
   * 根据 ID 更新通知
   * 
   * @param id - 通知 ID
   * @param updates - 更新的字段
   * @returns 是否成功更新
   */
  update(id: string, updates: Partial<NotificationItem>): boolean {
    try {
      const item = this.itemsMap.get(id)
      if (!item) {
        return false
      }

      // 如果更新了位置或类型，需要更新索引
      const positionChanged = updates.position && updates.position !== item.position
      const typeChanged = updates.type && updates.type !== item.type

      if (positionChanged || typeChanged) {
        this.removeFromIndexes(item)
      }

      // 更新项
      Object.assign(item, updates, { updatedAt: Date.now() })

      if (positionChanged || typeChanged) {
        this.addToIndexes(item)
      }

      return true
    }
    catch (error) {
      console.error('[NotificationQueue] Update failed:', error)
      return false
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = []
    this.itemsMap.clear()
    this.positionIndex.clear()
    this.typeIndex.clear()
    this.needsReindex = false
  }

  /**
   * 获取所有通知（返回副本）
   * 
   * @returns 所有通知项的数组副本
   */
  getAll(): NotificationItem[] {
    return [...this.items]
  }

  /**
   * 根据位置获取通知（使用索引，O(1) 查找）
   * 
   * @param position - 通知位置
   * @returns 该位置的所有通知
   */
  getByPosition(position: Position): NotificationItem[] {
    try {
      const ids = this.positionIndex.get(position)
      if (!ids || ids.size === 0) {
        return []
      }

      // 从 Map 获取项并保持原始顺序
      return this.items.filter(item => ids.has(item.id))
    }
    catch (error) {
      console.error('[NotificationQueue] GetByPosition failed:', error)
      return []
    }
  }

  /**
   * 根据类型获取通知（使用索引，O(1) 查找）
   * 
   * @param type - 通知类型
   * @returns 该类型的所有通知
   */
  getByType(type: NotificationItem['type']): NotificationItem[] {
    try {
      const ids = this.typeIndex.get(type)
      if (!ids || ids.size === 0) {
        return []
      }

      // 从 Map 获取项并保持原始顺序
      return this.items.filter(item => ids.has(item.id))
    }
    catch (error) {
      console.error('[NotificationQueue] GetByType failed:', error)
      return []
    }
  }

  /**
   * 检查是否存在相同消息（防重复）
   * 
   * @param message - 消息内容
   * @param type - 可选的通知类型
   * @returns 是否存在重复
   */
  hasDuplicate(message: string, type?: NotificationItem['type']): boolean {
    try {
      if (type) {
        const ids = this.typeIndex.get(type)
        if (!ids) return false

        for (const id of ids) {
          const item = this.itemsMap.get(id)
          if (item && item.message === message) {
            return true
          }
        }
        return false
      }

      // 如果没有指定类型，检查所有通知
      for (const item of this.itemsMap.values()) {
        if (item.message === message) {
          return true
        }
      }
      return false
    }
    catch (error) {
      console.error('[NotificationQueue] HasDuplicate failed:', error)
      return false
    }
  }

  /**
   * 获取队列大小
   */
  get size(): number {
    return this.items.length
  }

  /**
   * 检查队列是否为空
   */
  get isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 检查队列是否已满
   */
  get isFull(): boolean {
    return this.maxSize > 0 && this.items.length >= this.maxSize
  }

  /**
   * 设置最大大小
   * 
   * @param maxSize - 新的最大大小
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize

    // 如果当前队列超过最大大小，移除多余的（从队首移除）
    while (this.maxSize > 0 && this.items.length > this.maxSize) {
      const removed = this.items.shift()
      if (removed) {
        this.itemsMap.delete(removed.id)
        this.removeFromIndexes(removed)
      }
    }
  }

  /**
   * 添加到索引
   * 
   * @private
   * @param item - 通知项
   */
  private addToIndexes(item: NotificationItem): void {
    // 添加到位置索引
    if (!this.positionIndex.has(item.position)) {
      this.positionIndex.set(item.position, new Set())
    }
    this.positionIndex.get(item.position)!.add(item.id)

    // 添加到类型索引
    if (!this.typeIndex.has(item.type)) {
      this.typeIndex.set(item.type, new Set())
    }
    this.typeIndex.get(item.type)!.add(item.id)
  }

  /**
   * 从索引移除
   * 
   * @private
   * @param item - 通知项
   */
  private removeFromIndexes(item: NotificationItem): void {
    // 从位置索引移除
    const positionSet = this.positionIndex.get(item.position)
    if (positionSet) {
      positionSet.delete(item.id)
      if (positionSet.size === 0) {
        this.positionIndex.delete(item.position)
      }
    }

    // 从类型索引移除
    const typeSet = this.typeIndex.get(item.type)
    if (typeSet) {
      typeSet.delete(item.id)
      if (typeSet.size === 0) {
        this.typeIndex.delete(item.type)
      }
    }
  }

  /**
   * 重建索引（在索引损坏时使用）
   * 
   * @private
   */
  private rebuildIndexes(): void {
    this.positionIndex.clear()
    this.typeIndex.clear()

    for (const item of this.items) {
      this.addToIndexes(item)
    }

    this.needsReindex = false
  }

  /**
   * 获取调试信息
   * 
   * @returns 队列的调试信息
   */
  getDebugInfo(): {
    size: number
    maxSize: number
    positions: Record<string, number>
    types: Record<string, number>
  } {
    const positions: Record<string, number> = {}
    const types: Record<string, number> = {}

    for (const [position, ids] of this.positionIndex) {
      positions[position] = ids.size
    }

    for (const [type, ids] of this.typeIndex) {
      types[type] = ids.size
    }

    return {
      size: this.size,
      maxSize: this.maxSize,
      positions,
      types,
    }
  }
}



