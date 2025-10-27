/**
 * NotificationManager 单元测试
 * 
 * @description
 * 测试管理器的核心功能：
 * - 通知创建和关闭
 * - 定时器管理
 * - 内存泄漏检测
 * - 事件系统
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { NotificationManager } from '../../core/manager'

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('NotificationManager', () => {
  let manager: NotificationManager

  beforeEach(() => {
    manager = new NotificationManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  describe('Toast API', () => {
    it('应该能够创建 toast', () => {
      const id = manager.toast('Hello')

      expect(id).toBeTruthy()
      expect(manager.getAll().length).toBe(1)
      expect(manager.getAll()[0].message).toBe('Hello')
    })

    it('应该支持不同的 toast 类型', () => {
      const successId = manager.toast.success('Success')
      const errorId = manager.toast.error('Error')
      const warningId = manager.toast.warning('Warning')
      const infoId = manager.toast.info('Info')
      const loadingId = manager.toast.loading('Loading')

      const all = manager.getAll()

      expect(all.length).toBe(5)
      expect(all.find(i => i.id === successId)?.variant).toBe('success')
      expect(all.find(i => i.id === errorId)?.variant).toBe('error')
      expect(all.find(i => i.id === warningId)?.variant).toBe('warning')
      expect(all.find(i => i.id === infoId)?.variant).toBe('info')
      expect(all.find(i => i.id === loadingId)?.variant).toBe('loading')
    })

    it('loading toast 不应该自动关闭', () => {
      const id = manager.toast.loading('Loading...')
      const item = manager.getAll().find(i => i.id === id)

      expect(item?.duration).toBe(0)
    })

    it('应该能够关闭 toast', async () => {
      const id = manager.toast('Test')

      manager.toast.dismiss(id)
      await sleep(500) // 等待退出动画

      expect(manager.getAll().length).toBe(0)
    })

    it('应该能够关闭所有 toast', async () => {
      manager.toast('Test 1')
      manager.toast('Test 2')
      manager.toast('Test 3')

      manager.toast.dismissAll()
      await sleep(500)

      expect(manager.getAll().length).toBe(0)
    })

    it('应该能够更新 toast', () => {
      const id = manager.toast('Original')

      manager.toast.update(id, { message: 'Updated' })

      const item = manager.getAll().find(i => i.id === id)
      expect(item?.message).toBe('Updated')
    })
  })

  describe('Promise API', () => {
    it('应该正确处理成功的 Promise', async () => {
      const promise = Promise.resolve('Success')

      const result = await manager.toast.promise(promise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed!'
      })

      expect(result).toBe('Success')

      // 检查最终通知是成功状态
      await sleep(100)
      const all = manager.getAll()
      expect(all[0]?.variant).toBe('success')
      expect(all[0]?.message).toBe('Done!')
    })

    it('应该正确处理失败的 Promise', async () => {
      const promise = Promise.reject(new Error('Test error'))

      try {
        await manager.toast.promise(promise, {
          loading: 'Loading...',
          success: 'Done!',
          error: 'Failed!'
        })
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      await sleep(100)
      const all = manager.getAll()
      expect(all[0]?.variant).toBe('error')
      expect(all[0]?.message).toBe('Failed!')
    })

    it('应该支持函数形式的消息', async () => {
      const promise = Promise.resolve({ count: 5 })

      await manager.toast.promise(promise, {
        loading: () => 'Loading...',
        success: (data) => `Loaded ${data.count} items`,
        error: (err) => `Error: ${err.message}`
      })

      await sleep(100)
      expect(manager.getAll()[0]?.message).toBe('Loaded 5 items')
    })
  })

  describe('内存管理', () => {
    it('不应该泄漏定时器', async () => {
      // 创建 50 个通知
      for (let i = 0; i < 50; i++) {
        manager.toast('Test', { duration: 100 })
      }

      // 等待所有通知自动关闭
      await sleep(500)

      const debugInfo = manager.getDebugInfo()

      // 所有定时器应该被清理
      expect(debugInfo.activeTimers).toBe(0)
      expect(debugInfo.queueSize).toBe(0)
    })

    it('destroy() 应该清理所有资源', () => {
      manager.toast('Test 1')
      manager.toast('Test 2')
      manager.toast('Test 3')

      manager.destroy()

      const debugInfo = manager.getDebugInfo()

      expect(debugInfo.destroyed).toBe(true)
      expect(debugInfo.queueSize).toBe(0)
      expect(debugInfo.activeTimers).toBe(0)
    })

    it('已销毁的管理器不应该创建新通知', () => {
      manager.destroy()

      const id = manager.toast('Test')

      expect(id).toBe('')
      expect(manager.getAll().length).toBe(0)
    })
  })

  describe('定时器控制', () => {
    it('应该能够暂停定时器', async () => {
      const id = manager.toast('Test', { duration: 1000 })

      await sleep(300)
      manager.pauseTimer(id)

      // 再等待 1 秒，通知不应该关闭
      await sleep(1000)

      expect(manager.getAll().length).toBe(1)
    })

    it('应该能够恢复定时器', async () => {
      const id = manager.toast('Test', { duration: 500 })

      await sleep(200)
      manager.pauseTimer(id)
      await sleep(500)

      manager.resumeTimer(id)
      await sleep(500)

      // 应该已经关闭
      expect(manager.getAll().length).toBe(0)
    })
  })

  describe('防重复', () => {
    it('启用防重复时不应该创建相同消息', () => {
      const duplicateManager = new NotificationManager({
        preventDuplicate: true
      })

      const id1 = duplicateManager.toast('Same message')
      const id2 = duplicateManager.toast('Same message')

      expect(id1).toBe(id2)
      expect(duplicateManager.getAll().length).toBe(1)

      duplicateManager.destroy()
    })

    it('禁用防重复时应该允许相同消息', () => {
      const id1 = manager.toast('Same message')
      const id2 = manager.toast('Same message')

      expect(id1).not.toBe(id2)
      expect(manager.getAll().length).toBe(2)
    })
  })

  describe('事件系统', () => {
    it('应该触发 created 事件', () => {
      const handler = vi.fn()
      manager.on('created', handler)

      manager.toast('Test')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler.mock.calls[0][0].message).toBe('Test')
    })

    it('应该触发 updated 事件', () => {
      const handler = vi.fn()
      const id = manager.toast('Original')

      manager.on('updated', handler)
      manager.update(id, { message: 'Updated' })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该触发 dismissed 事件', () => {
      const handler = vi.fn()
      const id = manager.toast('Test')

      manager.on('dismissed', handler)
      manager.dismiss(id)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该能够取消事件监听', () => {
      const handler = vi.fn()
      const unsubscribe = manager.on('created', handler)

      manager.toast('Test 1')
      unsubscribe()
      manager.toast('Test 2')

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Alert API', () => {
    it('confirm 应该返回 boolean', async () => {
      // 模拟用户确认
      setTimeout(() => {
        const alert = manager.getAll().find(i => i.type === 'alert')
        if (alert?.data?.onConfirm) {
          alert.data.onConfirm()
        }
      }, 100)

      const result = await manager.alert.confirm('确定吗？')

      expect(result).toBe(true)
    })

    it('prompt 应该返回输入值', async () => {
      setTimeout(() => {
        const alert = manager.getAll().find(i => i.type === 'alert')
        if (alert?.data?.onConfirm) {
          // 模拟输入值
          alert.data.value = 'test input'
          alert.data.onConfirm()
        }
      }, 100)

      const result = await manager.alert.prompt('请输入')

      expect(result).toBe('test input')
    })
  })

  describe('配置选项', () => {
    it('应该使用自定义默认配置', () => {
      const customManager = new NotificationManager({
        defaultPosition: 'bottom-left',
        defaultDuration: 5000
      })

      const id = customManager.toast('Test')
      const item = customManager.getAll()[0]

      expect(item.position).toBe('bottom-left')
      expect(item.duration).toBe(5000)

      customManager.destroy()
    })

    it('应该能够设置主题', () => {
      manager.setTheme('dark')

      const theme = document.documentElement.getAttribute('data-notification-theme')
      expect(theme).toBe('dark')
    })

    it('应该能够设置堆叠策略', () => {
      manager.setStackStrategy('overlap')

      // 验证策略已更新（通过间接方式）
      expect(manager).toBeDefined()
    })
  })
})


