/**
 * 通知队列系统
 */

import type { NotificationItem, Position } from '../types'

/**
 * 通知队列类
 */
export class NotificationQueue {
  private items: NotificationItem[] = []
  private maxSize: number

  constructor(maxSize = 0) {
    this.maxSize = maxSize
  }

  /**
   * 入队
   */
  enqueue(item: NotificationItem): boolean {
    // 检查最大数量限制
    if (this.maxSize > 0 && this.items.length >= this.maxSize) {
      // 移除最早的通知
      this.items.shift()
    }

    // 按优先级插入
    const priorityOrder: Record<string, number> = {
      high: 3,
      normal: 2,
      low: 1,
    }

    const itemPriority = priorityOrder[item.priority]
    let insertIndex = this.items.length

    for (let i = 0; i < this.items.length; i++) {
      if (priorityOrder[this.items[i].priority] < itemPriority) {
        insertIndex = i
        break
      }
    }

    this.items.splice(insertIndex, 0, item)
    return true
  }

  /**
   * 出队
   */
  dequeue(): NotificationItem | undefined {
    return this.items.shift()
  }

  /**
   * 根据 ID 移除
   */
  remove(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id)
    if (index !== -1) {
      this.items.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 根据 ID 获取
   */
  get(id: string): NotificationItem | undefined {
    return this.items.find(item => item.id === id)
  }

  /**
   * 根据 ID 更新
   */
  update(id: string, updates: Partial<NotificationItem>): boolean {
    const item = this.get(id)
    if (item) {
      Object.assign(item, updates, { updatedAt: Date.now() })
      return true
    }
    return false
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = []
  }

  /**
   * 获取所有通知
   */
  getAll(): NotificationItem[] {
    return [...this.items]
  }

  /**
   * 根据位置获取通知
   */
  getByPosition(position: Position): NotificationItem[] {
    return this.items.filter(item => item.position === position)
  }

  /**
   * 根据类型获取通知
   */
  getByType(type: NotificationItem['type']): NotificationItem[] {
    return this.items.filter(item => item.type === type)
  }

  /**
   * 检查是否存在相同消息（防重复）
   */
  hasDuplicate(message: string, type?: NotificationItem['type']): boolean {
    return this.items.some(
      item => item.message === message && (type ? item.type === type : true)
    )
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
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize
    // 如果当前队列超过最大大小，移除多余的
    while (this.maxSize > 0 && this.items.length > this.maxSize) {
      this.items.shift()
    }
  }
}



