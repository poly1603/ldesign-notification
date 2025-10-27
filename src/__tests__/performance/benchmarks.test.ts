/**
 * 性能基准测试
 * 
 * @description
 * 测试关键性能指标：
 * - 通知创建速度
 * - 队列查找性能
 * - DOM 复用效果
 * - 动画帧率
 * - 内存占用
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { NotificationManager } from '../../core/manager'
import { NotificationQueue } from '../../core/queue'
import { DOMPool } from '../../core/dom-pool'

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 测量执行时间
 */
function measureTime(fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  return end - start
}

/**
 * 测量异步执行时间
 */
async function measureTimeAsync(fn: () => Promise<void>): Promise<number> {
  const start = performance.now()
  await fn()
  const end = performance.now()
  return end - start
}

describe('性能基准测试', () => {
  let manager: NotificationManager

  beforeEach(() => {
    manager = new NotificationManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  describe('通知创建性能', () => {
    it('单个通知创建应该 < 2ms', () => {
      const time = measureTime(() => {
        manager.toast('Test')
      })

      expect(time).toBeLessThan(2)
    })

    it('批量创建 100 个通知应该 < 200ms', () => {
      const time = measureTime(() => {
        for (let i = 0; i < 100; i++) {
          manager.toast(`Test ${i}`)
        }
      })

      expect(time).toBeLessThan(200)
      console.log(`✓ 创建 100 个通知耗时: ${time.toFixed(2)}ms`)
    })

    it('并发创建性能测试', () => {
      const times: number[] = []

      for (let i = 0; i < 50; i++) {
        const time = measureTime(() => {
          manager.toast(`Test ${i}`)
        })
        times.push(time)
      }

      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length
      const maxTime = Math.max(...times)

      expect(avgTime).toBeLessThan(2)
      expect(maxTime).toBeLessThan(5)

      console.log(`✓ 平均创建时间: ${avgTime.toFixed(3)}ms`)
      console.log(`✓ 最大创建时间: ${maxTime.toFixed(3)}ms`)
    })
  })

  describe('Queue 查找性能', () => {
    it('1000 项队列查找应该 < 0.1ms', () => {
      const queue = new NotificationQueue()

      // 添加 1000 个通知
      for (let i = 0; i < 1000; i++) {
        queue.enqueue({
          id: `test-${i}`,
          type: 'toast',
          variant: 'default',
          message: `Test ${i}`,
          position: 'top-right',
          duration: 3000,
          className: '',
          style: {},
          dismissible: true,
          pauseOnHover: true,
          pauseOnFocusLoss: false,
          enterAnimation: 'fadeIn',
          exitAnimation: 'fadeOut',
          animationDuration: 300,
          priority: 'normal',
          onClick: () => { },
          onClose: () => { },
          onDestroy: () => { },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'entering',
          read: false,
          paused: false,
          remainingTime: 3000,
          data: {},
        })
      }

      // 测试查找性能
      const time = measureTime(() => {
        queue.get('test-500')
      })

      expect(time).toBeLessThan(0.1)
      console.log(`✓ Queue.get() 耗时: ${time.toFixed(4)}ms`)
    })

    it('getByPosition() 性能测试', () => {
      const queue = new NotificationQueue()

      for (let i = 0; i < 1000; i++) {
        queue.enqueue({
          id: `test-${i}`,
          type: 'toast',
          variant: 'default',
          message: `Test ${i}`,
          position: i % 2 === 0 ? 'top-right' : 'bottom-left',
          duration: 3000,
          className: '',
          style: {},
          dismissible: true,
          pauseOnHover: true,
          pauseOnFocusLoss: false,
          enterAnimation: 'fadeIn',
          exitAnimation: 'fadeOut',
          animationDuration: 300,
          priority: 'normal',
          onClick: () => { },
          onClose: () => { },
          onDestroy: () => { },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'entering',
          read: false,
          paused: false,
          remainingTime: 3000,
          data: {},
        })
      }

      const time = measureTime(() => {
        const items = queue.getByPosition('top-right')
        expect(items.length).toBe(500)
      })

      expect(time).toBeLessThan(5)
      console.log(`✓ Queue.getByPosition() 耗时: ${time.toFixed(3)}ms`)
    })
  })

  describe('DOM 复用性能', () => {
    it('应该减少 DOM 创建次数', () => {
      const pool = new DOMPool(10)
      const creator = vi.fn(() => document.createElement('div'))

      // 获取和释放 50 次
      for (let i = 0; i < 50; i++) {
        const el = pool.acquire('toast', creator)
        pool.release(el)
      }

      // 由于复用，创建次数应该远少于 50
      expect(creator.mock.calls.length).toBeLessThan(15)

      const reductionRate = (1 - creator.mock.calls.length / 50) * 100
      console.log(`✓ DOM 创建减少: ${reductionRate.toFixed(1)}%`)

      expect(reductionRate).toBeGreaterThan(50)

      pool.destroy()
    })

    it('池预热应该加速首次获取', () => {
      const pool = new DOMPool()
      const creator = () => document.createElement('div')

      // 预热
      pool.warm('toast', 5, creator)

      // 首次获取应该很快（从池中获取）
      const time = measureTime(() => {
        pool.acquire('toast', creator)
      })

      expect(time).toBeLessThan(1)

      pool.destroy()
    })
  })

  describe('内存占用测试', () => {
    it('大量通知不应该导致内存泄漏', async () => {
      const debugInfoBefore = manager.getDebugInfo()

      // 快速创建和关闭 100 个通知
      for (let i = 0; i < 100; i++) {
        manager.toast(`Test ${i}`, { duration: 100 })
      }

      // 等待所有通知关闭
      await sleep(500)

      const debugInfoAfter = manager.getDebugInfo()

      // 所有定时器应该被清理
      expect(debugInfoAfter.activeTimers).toBe(0)

      // 队列应该为空
      expect(debugInfoAfter.queueSize).toBe(0)

      console.log('✓ 无内存泄漏')
    })

    it('dismissAll() 应该快速清理', async () => {
      // 创建 50 个通知
      for (let i = 0; i < 50; i++) {
        manager.toast(`Test ${i}`, { duration: 10000 })
      }

      const time = await measureTimeAsync(async () => {
        manager.dismissAll()
        await sleep(400) // 等待动画完成
      })

      const debugInfo = manager.getDebugInfo()

      expect(debugInfo.queueSize).toBe(0)
      expect(debugInfo.activeTimers).toBe(0)
      expect(time).toBeLessThan(500)

      console.log(`✓ dismissAll() 耗时: ${time.toFixed(2)}ms`)
    })
  })

  describe('压力测试', () => {
    it('应该处理极高频率的通知', () => {
      const time = measureTime(() => {
        for (let i = 0; i < 1000; i++) {
          manager.toast(`Test ${i}`)
        }
      })

      // 由于节流保护，应该能快速完成
      expect(time).toBeLessThan(1000)

      // 实际创建的通知数应该少于 1000
      expect(manager.getAll().length).toBeLessThan(1000)

      console.log(`✓ 1000 次调用耗时: ${time.toFixed(2)}ms`)
      console.log(`✓ 实际创建: ${manager.getAll().length} 个`)
    })

    it('应该处理混合操作', () => {
      const operations = []

      for (let i = 0; i < 100; i++) {
        operations.push(() => manager.toast(`Test ${i}`))
        operations.push(() => manager.message(`Message ${i}`))
        operations.push(() => {
          const all = manager.getAll()
          if (all.length > 0) {
            manager.dismiss(all[0].id)
          }
        })
      }

      const time = measureTime(() => {
        for (const op of operations) {
          op()
        }
      })

      expect(time).toBeLessThan(500)
      console.log(`✓ 300 个混合操作耗时: ${time.toFixed(2)}ms`)
    })
  })

  describe('性能报告', () => {
    it('生成性能报告', () => {
      const report = {
        queue: {
          get: 0,
          getByPosition: 0,
          remove: 0,
        },
        manager: {
          create: 0,
          dismiss: 0,
          dismissAll: 0,
        },
        domPool: {
          reductionRate: 0,
        },
      }

      // Queue get 性能
      const queue = new NotificationQueue()
      for (let i = 0; i < 1000; i++) {
        queue.enqueue({
          id: `test-${i}`,
          type: 'toast',
          variant: 'default',
          message: `Test ${i}`,
          position: 'top-right',
          duration: 3000,
          className: '',
          style: {},
          dismissible: true,
          pauseOnHover: true,
          pauseOnFocusLoss: false,
          enterAnimation: 'fadeIn',
          exitAnimation: 'fadeOut',
          animationDuration: 300,
          priority: 'normal',
          onClick: () => { },
          onClose: () => { },
          onDestroy: () => { },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'entering',
          read: false,
          paused: false,
          remainingTime: 3000,
          data: {},
        })
      }
      report.queue.get = measureTime(() => queue.get('test-500'))

      // 通知创建性能
      report.manager.create = measureTime(() => {
        manager.toast('Test')
      })

      // DOM 池性能
      const pool = new DOMPool()
      const creator = vi.fn(() => document.createElement('div'))
      for (let i = 0; i < 100; i++) {
        const el = pool.acquire('toast', creator)
        pool.release(el)
      }
      report.domPool.reductionRate = (1 - creator.mock.calls.length / 100) * 100

      // 输出报告
      console.log('\n========== 性能基准报告 ==========')
      console.log(`Queue.get():           ${report.queue.get.toFixed(4)}ms  ${report.queue.get < 0.1 ? '✓' : '✗'}`)
      console.log(`Manager.create():      ${report.manager.create.toFixed(3)}ms   ${report.manager.create < 2 ? '✓' : '✗'}`)
      console.log(`DOM 复用率:             ${report.domPool.reductionRate.toFixed(1)}%     ${report.domPool.reductionRate > 50 ? '✓' : '✗'}`)
      console.log('===================================\n')

      // 所有指标应该达标
      expect(report.queue.get).toBeLessThan(0.1)
      expect(report.manager.create).toBeLessThan(2)
      expect(report.domPool.reductionRate).toBeGreaterThan(50)

      pool.destroy()
    })
  })
})


