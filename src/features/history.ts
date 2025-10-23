/**
 * 通知历史记录
 */

import type { NotificationItem } from '../types'
import { isBrowser, safeJsonParse, safeJsonStringify } from '../utils/helpers'

/**
 * 历史记录配置
 */
export interface HistoryConfig {
  /** 最大历史数量 */
  maxItems?: number
  /** 存储键名 */
  storageKey?: string
  /** 使用 IndexedDB */
  useIndexedDB?: boolean
  /** 自动清理（天数） */
  autoCleanDays?: number
}

/**
 * 历史项
 */
export interface HistoryItem extends NotificationItem {
  /** 是否已读 */
  read: boolean
  /** 关闭时间 */
  closedAt?: number
}

/**
 * 存储接口
 */
interface Storage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

/**
 * LocalStorage 适配器
 */
class LocalStorageAdapter implements Storage {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}

/**
 * IndexedDB 适配器
 */
class IndexedDBAdapter implements Storage {
  private dbName = 'ldesign-notification'
  private storeName = 'history'
  private db?: IDBDatabase

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.db)
      await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.db)
      await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async removeItem(key: string): Promise<void> {
    if (!this.db)
      await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

/**
 * 历史管理器
 */
export class HistoryManager {
  private config: Required<HistoryConfig>
  private storage: Storage
  private items: HistoryItem[] = []

  constructor(config: HistoryConfig = {}) {
    this.config = {
      maxItems: config.maxItems || 100,
      storageKey: config.storageKey || 'ldesign-notification-history',
      useIndexedDB: config.useIndexedDB || false,
      autoCleanDays: config.autoCleanDays || 7,
    }

    // 选择存储方式
    this.storage = this.config.useIndexedDB && isBrowser && 'indexedDB' in window
      ? new IndexedDBAdapter()
      : new LocalStorageAdapter()

    // 加载历史
    this.load()

    // 自动清理
    this.autoClean()
  }

  /**
   * 添加历史记录
   */
  async add(item: NotificationItem): Promise<void> {
    const historyItem: HistoryItem = {
      ...item,
      read: false,
      closedAt: Date.now(),
    }

    this.items.unshift(historyItem)

    // 限制数量
    if (this.items.length > this.config.maxItems) {
      this.items = this.items.slice(0, this.config.maxItems)
    }

    await this.save()
  }

  /**
   * 获取所有历史
   */
  getAll(): HistoryItem[] {
    return [...this.items]
  }

  /**
   * 获取未读数量
   */
  getUnreadCount(): number {
    return this.items.filter(item => !item.read).length
  }

  /**
   * 标记为已读
   */
  async markAsRead(id: string): Promise<void> {
    const item = this.items.find(i => i.id === id)
    if (item) {
      item.read = true
      await this.save()
    }
  }

  /**
   * 标记所有为已读
   */
  async markAllAsRead(): Promise<void> {
    this.items.forEach(item => {
      item.read = true
    })
    await this.save()
  }

  /**
   * 删除历史记录
   */
  async remove(id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id)
    await this.save()
  }

  /**
   * 清空历史
   */
  async clear(): Promise<void> {
    this.items = []
    await this.save()
  }

  /**
   * 搜索历史
   */
  search(query: string): HistoryItem[] {
    const lowerQuery = query.toLowerCase()
    return this.items.filter(
      item =>
        item.message.toLowerCase().includes(lowerQuery)
        || item.title?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 按类型过滤
   */
  filterByType(type: NotificationItem['type']): HistoryItem[] {
    return this.items.filter(item => item.type === type)
  }

  /**
   * 按变体过滤
   */
  filterByVariant(variant: NotificationItem['variant']): HistoryItem[] {
    return this.items.filter(item => item.variant === variant)
  }

  /**
   * 按日期范围过滤
   */
  filterByDateRange(startDate: number, endDate: number): HistoryItem[] {
    return this.items.filter(item => item.createdAt >= startDate && item.createdAt <= endDate)
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const total = this.items.length
    const unread = this.getUnreadCount()
    const byType = this.items.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const byVariant = this.items.reduce(
      (acc, item) => {
        acc[item.variant] = (acc[item.variant] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total,
      unread,
      read: total - unread,
      byType,
      byVariant,
    }
  }

  /**
   * 加载历史
   */
  private async load(): Promise<void> {
    try {
      const data = await this.storage.getItem(this.config.storageKey)
      if (data) {
        this.items = safeJsonParse<HistoryItem[]>(data, [])
      }
    }
    catch (error) {
      console.error('[HistoryManager] Load failed:', error)
    }
  }

  /**
   * 保存历史
   */
  private async save(): Promise<void> {
    try {
      await this.storage.setItem(this.config.storageKey, safeJsonStringify(this.items))
    }
    catch (error) {
      console.error('[HistoryManager] Save failed:', error)
    }
  }

  /**
   * 自动清理过期记录
   */
  private async autoClean(): Promise<void> {
    if (this.config.autoCleanDays <= 0)
      return

    const cutoffTime = Date.now() - this.config.autoCleanDays * 24 * 60 * 60 * 1000
    const before = this.items.length
    this.items = this.items.filter(item => (item.closedAt || item.createdAt) > cutoffTime)

    if (this.items.length < before) {
      await this.save()
      console.log(`[HistoryManager] Auto cleaned ${before - this.items.length} old items`)
    }
  }
}

// 导出单例
export const historyManager = new HistoryManager()



