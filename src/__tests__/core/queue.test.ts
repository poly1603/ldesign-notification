/**
 * NotificationQueue 单元测试
 * 
 * @description
 * 测试队列的核心功能：
 * - O(1) 查找性能
 * - 索引一致性
 * - 优先级排序
 * - 边界条件处理
 */

import { describe, expect, it, beforeEach } from 'vitest'
import { NotificationQueue } from '../../core/queue'
import type { NotificationItem } from '../../types'

/**
 * 创建模拟通知项
 */
function createMockItem(override?: Partial<NotificationItem>): NotificationItem {
  return {
    id: override?.id || `test-${Math.random()}`,
    type: override?.type || 'toast',
    variant: override?.variant || 'default',
    message: override?.message || 'Test message',
    position: override?.position || 'top-right',
    duration: override?.duration !== undefined ? override.duration : 3000,
    className: override?.className || '',
    style: override?.style || {},
    dismissible: override?.dismissible !== undefined ? override.dismissible : true,
    pauseOnHover: override?.pauseOnHover !== undefined ? override.pauseOnHover : true,
    pauseOnFocusLoss: override?.pauseOnFocusLoss !== undefined ? override.pauseOnFocusLoss : false,
    enterAnimation: override?.enterAnimation || 'fadeIn',
    exitAnimation: override?.exitAnimation || 'fadeOut',
    animationDuration: override?.animationDuration || 300,
    priority: override?.priority || 'normal',
    onClick: override?.onClick || (() => { }),
    onClose: override?.onClose || (() => { }),
    onDestroy: override?.onDestroy || (() => { }),
    createdAt: override?.createdAt || Date.now(),
    updatedAt: override?.updatedAt || Date.now(),
    status: override?.status || 'entering',
    read: override?.read !== undefined ? override.read : false,
    paused: override?.paused !== undefined ? override.paused : false,
    remainingTime: override?.remainingTime || 3000,
    data: override?.data || {},
    ...override,
  }
}

describe('NotificationQueue', () => {
  let queue: NotificationQueue

  beforeEach(() => {
    queue = new NotificationQueue()
  })

  describe('基础操作', () => {
    it('应该能够入队通知', () => {
      const item = createMockItem({ id: 'test-1' })
      const result = queue.enqueue(item)

      expect(result).toBe(true)
      expect(queue.size).toBe(1)
      expect(queue.get('test-1')).toBe(item)
    })

    it('应该能够出队通知', () => {
      const item1 = createMockItem({ id: 'test-1' })
      const item2 = createMockItem({ id: 'test-2' })

      queue.enqueue(item1)
      queue.enqueue(item2)

      const dequeued = queue.dequeue()

      expect(dequeued).toBe(item1)
      expect(queue.size).toBe(1)
    })

    it('应该能够根据 ID 移除通知', () => {
      const item = createMockItem({ id: 'test-1' })
      queue.enqueue(item)

      const result = queue.remove('test-1')

      expect(result).toBe(true)
      expect(queue.size).toBe(0)
      expect(queue.get('test-1')).toBeUndefined()
    })

    it('应该能够更新通知', () => {
      const item = createMockItem({ id: 'test-1', message: 'Original' })
      queue.enqueue(item)

      const result = queue.update('test-1', { message: 'Updated' })

      expect(result).toBe(true)
      expect(queue.get('test-1')?.message).toBe('Updated')
    })
  })

  describe('性能测试', () => {
    it('get() 操作应该是 O(1) 复杂度', () => {
      // 添加 1000 个通知
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(createMockItem({ id: `test-${i}` }))
      }

      // 测试查找性能
      const start = performance.now()
      queue.get('test-500')
      const end = performance.now()

      // 应该在 0.1ms 内完成
      expect(end - start).toBeLessThan(0.1)
    })

    it('remove() 操作应该是 O(1) 复杂度', () => {
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(createMockItem({ id: `test-${i}` }))
      }

      const start = performance.now()
      queue.remove('test-500')
      const end = performance.now()

      expect(end - start).toBeLessThan(0.1)
    })

    it('getByPosition() 应该使用索引快速查找', () => {
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(createMockItem({
          id: `test-${i}`,
          position: i % 2 === 0 ? 'top-right' : 'bottom-left'
        }))
      }

      const start = performance.now()
      const items = queue.getByPosition('top-right')
      const end = performance.now()

      expect(items.length).toBe(500)
      expect(end - start).toBeLessThan(1)
    })
  })

  describe('索引一致性', () => {
    it('位置索引应该保持一致', () => {
      const item1 = createMockItem({ id: 'test-1', position: 'top-right' })
      const item2 = createMockItem({ id: 'test-2', position: 'top-right' })
      const item3 = createMockItem({ id: 'test-3', position: 'bottom-left' })

      queue.enqueue(item1)
      queue.enqueue(item2)
      queue.enqueue(item3)

      const topRight = queue.getByPosition('top-right')
      const bottomLeft = queue.getByPosition('bottom-left')

      expect(topRight.length).toBe(2)
      expect(bottomLeft.length).toBe(1)
      expect(topRight).toContain(item1)
      expect(topRight).toContain(item2)
      expect(bottomLeft).toContain(item3)
    })

    it('类型索引应该保持一致', () => {
      const item1 = createMockItem({ id: 'test-1', type: 'toast' })
      const item2 = createMockItem({ id: 'test-2', type: 'message' })
      const item3 = createMockItem({ id: 'test-3', type: 'toast' })

      queue.enqueue(item1)
      queue.enqueue(item2)
      queue.enqueue(item3)

      const toasts = queue.getByType('toast')
      const messages = queue.getByType('message')

      expect(toasts.length).toBe(2)
      expect(messages.length).toBe(1)
    })

    it('更新位置时应该更新索引', () => {
      const item = createMockItem({ id: 'test-1', position: 'top-right' })
      queue.enqueue(item)

      queue.update('test-1', { position: 'bottom-left' })

      const topRight = queue.getByPosition('top-right')
      const bottomLeft = queue.getByPosition('bottom-left')

      expect(topRight.length).toBe(0)
      expect(bottomLeft.length).toBe(1)
    })
  })

  describe('优先级排序', () => {
    it('应该按优先级排序', () => {
      const low = createMockItem({ id: 'low', priority: 'low' })
      const normal = createMockItem({ id: 'normal', priority: 'normal' })
      const high = createMockItem({ id: 'high', priority: 'high' })

      queue.enqueue(low)
      queue.enqueue(normal)
      queue.enqueue(high)

      const all = queue.getAll()

      expect(all[0].id).toBe('high')
      expect(all[1].id).toBe('normal')
      expect(all[2].id).toBe('low')
    })
  })

  describe('最大大小限制', () => {
    it('应该限制队列大小', () => {
      const limitedQueue = new NotificationQueue(3)

      for (let i = 0; i < 5; i++) {
        limitedQueue.enqueue(createMockItem({ id: `test-${i}` }))
      }

      expect(limitedQueue.size).toBe(3)
      expect(limitedQueue.get('test-0')).toBeUndefined() // 被移除
      expect(limitedQueue.get('test-1')).toBeUndefined() // 被移除
      expect(limitedQueue.get('test-4')).toBeDefined()
    })

    it('应该能够动态调整最大大小', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue(createMockItem({ id: `test-${i}` }))
      }

      queue.setMaxSize(5)

      expect(queue.size).toBe(5)
    })
  })

  describe('边界条件', () => {
    it('空队列应该正确处理', () => {
      expect(queue.size).toBe(0)
      expect(queue.isEmpty).toBe(true)
      expect(queue.getAll()).toEqual([])
      expect(queue.dequeue()).toBeUndefined()
      expect(queue.remove('nonexistent')).toBe(false)
    })

    it('移除不存在的项应该返回 false', () => {
      expect(queue.remove('nonexistent')).toBe(false)
    })

    it('更新不存在的项应该返回 false', () => {
      expect(queue.update('nonexistent', { message: 'test' })).toBe(false)
    })

    it('clear() 应该清空所有内容', () => {
      for (let i = 0; i < 10; i++) {
        queue.enqueue(createMockItem({ id: `test-${i}` }))
      }

      queue.clear()

      expect(queue.size).toBe(0)
      expect(queue.isEmpty).toBe(true)

      const debug = queue.getDebugInfo()
      expect(Object.keys(debug.positions).length).toBe(0)
      expect(Object.keys(debug.types).length).toBe(0)
    })
  })

  describe('调试信息', () => {
    it('应该返回正确的调试信息', () => {
      queue.enqueue(createMockItem({ id: 'test-1', position: 'top-right', type: 'toast' }))
      queue.enqueue(createMockItem({ id: 'test-2', position: 'top-right', type: 'message' }))
      queue.enqueue(createMockItem({ id: 'test-3', position: 'bottom-left', type: 'toast' }))

      const debug = queue.getDebugInfo()

      expect(debug.size).toBe(3)
      expect(debug.positions['top-right']).toBe(2)
      expect(debug.positions['bottom-left']).toBe(1)
      expect(debug.types.toast).toBe(2)
      expect(debug.types.message).toBe(1)
    })
  })
})


