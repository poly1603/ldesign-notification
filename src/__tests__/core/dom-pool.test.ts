/**
 * DOMPool 单元测试
 * 
 * @description
 * 测试 DOM 复用池的功能：
 * - 元素复用
 * - 池大小限制
 * - 自动清理
 * - 统计信息
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { DOMPool } from '../../core/dom-pool'

describe('DOMPool', () => {
  let pool: DOMPool

  beforeEach(() => {
    pool = new DOMPool(5) // 最大缓存 5 个
  })

  afterEach(() => {
    pool.destroy()
  })

  describe('基础功能', () => {
    it('应该能够获取元素', () => {
      const creator = vi.fn(() => document.createElement('div'))
      const element = pool.acquire('toast', creator)

      expect(element).toBeInstanceOf(HTMLElement)
      expect(creator).toHaveBeenCalledTimes(1)
    })

    it('应该能够释放元素', () => {
      const element = pool.acquire('toast', () => document.createElement('div'))

      pool.release(element)

      const stats = pool.getStats()
      expect(stats.pools.toast?.available).toBe(1)
    })

    it('应该复用已释放的元素', () => {
      const creator = vi.fn(() => document.createElement('div'))

      // 第一次获取
      const element1 = pool.acquire('toast', creator)
      pool.release(element1)

      // 第二次获取应该复用
      const element2 = pool.acquire('toast', creator)

      expect(creator).toHaveBeenCalledTimes(1) // 只创建一次
      expect(element2).toBe(element1) // 是同一个元素
    })

    it('池空时应该创建新元素', () => {
      const creator = vi.fn(() => document.createElement('div'))

      const element1 = pool.acquire('toast', creator)
      const element2 = pool.acquire('toast', creator)

      expect(creator).toHaveBeenCalledTimes(2) // 创建两次
      expect(element1).not.toBe(element2)
    })
  })

  describe('池大小限制', () => {
    it('应该限制池大小', () => {
      const elements = []

      // 创建并释放 10 个元素
      for (let i = 0; i < 10; i++) {
        const el = pool.acquire('toast', () => document.createElement('div'))
        elements.push(el)
      }

      for (const el of elements) {
        pool.release(el)
      }

      const stats = pool.getStats()

      // 最大 5 个，所以应该只有 5 个
      expect(stats.pools.toast?.available).toBe(5)
    })

    it('超出大小时应该移除最老的元素', () => {
      const elements = []

      for (let i = 0; i < 10; i++) {
        const el = pool.acquire('toast', () => {
          const div = document.createElement('div')
          div.setAttribute('data-index', String(i))
          return div
        })
        elements.push(el)
        pool.release(el)
      }

      const stats = pool.getStats()
      expect(stats.pools.toast?.available).toBe(5)
    })
  })

  describe('按类型分组', () => {
    it('应该按类型分别管理', () => {
      const toast1 = pool.acquire('toast', () => document.createElement('div'))
      const message1 = pool.acquire('message', () => document.createElement('div'))
      const toast2 = pool.acquire('toast', () => document.createElement('div'))

      pool.release(toast1)
      pool.release(message1)
      pool.release(toast2)

      const stats = pool.getStats()

      expect(stats.pools.toast?.available).toBe(2)
      expect(stats.pools.message?.available).toBe(1)
      expect(stats.totalAvailable).toBe(3)
    })
  })

  describe('元素重置', () => {
    it('释放时应该重置元素状态', () => {
      const element = pool.acquire('toast', () => document.createElement('div'))

      // 修改元素状态
      element.className = 'test-class'
      element.style.opacity = '0.5'
      element.setAttribute('data-test', 'value')
      element.innerHTML = '<span>Test</span>'

      pool.release(element)

      // 重新获取，应该是重置后的状态
      const reused = pool.acquire('toast', () => document.createElement('div'))

      expect(reused.className).toBe('')
      expect(reused.style.opacity).toBe('')
      expect(reused.getAttribute('data-test')).toBeNull()
      expect(reused.innerHTML).toBe('')
    })
  })

  describe('池预热', () => {
    it('应该能够预创建元素', () => {
      const creator = vi.fn(() => document.createElement('div'))

      pool.warm('toast', 3, creator)

      expect(creator).toHaveBeenCalledTimes(3)

      const stats = pool.getStats()
      expect(stats.pools.toast?.available).toBe(3)
    })

    it('预热不应该超过最大大小', () => {
      const creator = vi.fn(() => document.createElement('div'))

      pool.warm('toast', 10, creator)

      // 最大 5 个
      expect(creator).toHaveBeenCalledTimes(5)
    })
  })

  describe('禁用池化', () => {
    it('禁用后应该直接创建元素', () => {
      pool.disable()

      const creator = vi.fn(() => document.createElement('div'))

      const el1 = pool.acquire('toast', creator)
      pool.release(el1)
      const el2 = pool.acquire('toast', creator)

      expect(creator).toHaveBeenCalledTimes(2) // 没有复用
      expect(el1).not.toBe(el2)
    })

    it('禁用后再启用应该恢复功能', () => {
      pool.disable()
      pool.enable()

      const creator = vi.fn(() => document.createElement('div'))

      const el1 = pool.acquire('toast', creator)
      pool.release(el1)
      const el2 = pool.acquire('toast', creator)

      expect(creator).toHaveBeenCalledTimes(1) // 复用
      expect(el1).toBe(el2)
    })
  })

  describe('统计信息', () => {
    it('应该返回正确的统计信息', () => {
      for (let i = 0; i < 3; i++) {
        const el = pool.acquire('toast', () => document.createElement('div'))
        pool.release(el)
      }

      const stats = pool.getStats()

      expect(stats.enabled).toBe(true)
      expect(stats.maxSize).toBe(5)
      expect(stats.pools.toast?.available).toBe(3)
      expect(stats.pools.toast?.avgUseCount).toBeGreaterThan(0)
      expect(stats.totalAvailable).toBe(3)
    })
  })

  describe('清理', () => {
    it('应该能够清空指定类型的池', () => {
      const toast = pool.acquire('toast', () => document.createElement('div'))
      const message = pool.acquire('message', () => document.createElement('div'))

      pool.release(toast)
      pool.release(message)

      pool.clear('toast')

      const stats = pool.getStats()
      expect(stats.pools.toast).toBeUndefined()
      expect(stats.pools.message?.available).toBe(1)
    })

    it('应该能够清空所有池', () => {
      const toast = pool.acquire('toast', () => document.createElement('div'))
      const message = pool.acquire('message', () => document.createElement('div'))

      pool.release(toast)
      pool.release(message)

      pool.clear()

      const stats = pool.getStats()
      expect(stats.totalAvailable).toBe(0)
    })
  })

  describe('内存管理', () => {
    it('destroy() 应该清理所有资源', () => {
      for (let i = 0; i < 5; i++) {
        const el = pool.acquire('toast', () => document.createElement('div'))
        pool.release(el)
      }

      pool.destroy()

      const stats = pool.getStats()
      expect(stats.totalAvailable).toBe(0)
    })
  })
})


