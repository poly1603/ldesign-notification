/**
 * 工具函数单元测试
 * 
 * @description
 * 测试所有工具函数的正确性和边界情况
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  generateId,
  debounce,
  throttle,
  deepMerge,
  isSameMessage,
  getElementHeight,
  rafBatch,
  sleep,
  clamp,
} from '../../utils/helpers'

describe('generateId', () => {
  it('应该生成唯一的 ID', () => {
    const ids = new Set()

    for (let i = 0; i < 1000; i++) {
      ids.add(generateId())
    }

    // 所有 ID 应该都不同
    expect(ids.size).toBe(1000)
  })

  it('应该使用指定的前缀', () => {
    const id = generateId('toast')
    expect(id).toMatch(/^toast-/)
  })

  it('高并发下应该保持唯一性', () => {
    const ids = []

    for (let i = 0; i < 10000; i++) {
      ids.push(generateId())
    }

    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该延迟执行函数', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('多次调用应该重新计时', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200)

    debounced() // 重新计时
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该支持 leading 选项', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300, { leading: true, trailing: false })

    debounced()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该支持 maxWait 选项', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100, { maxWait: 300 })

    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()

    // 虽然不断调用，但 maxWait 后应该执行一次
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalled()
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该限制函数执行频率', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 300)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(300)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该支持 leading 选项', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 300, { leading: true, trailing: false })

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(200)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该支持 trailing 选项', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 300, { leading: false, trailing: true })

    throttled()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('deepMerge', () => {
  it('应该深度合并对象', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { d: 3 }, e: 4 }

    const result = deepMerge(target, source)

    expect(result).toEqual({
      a: 1,
      b: { c: 2, d: 3 },
      e: 4
    })
  })

  it('应该覆盖基本类型', () => {
    const target = { a: 1, b: 2 }
    const source = { a: 10 }

    const result = deepMerge(target, source)

    expect(result.a).toBe(10)
    expect(result.b).toBe(2)
  })

  it('应该处理多个源对象', () => {
    const target = { a: 1 }
    const source1 = { b: 2 }
    const source2 = { c: 3 }

    const result = deepMerge(target, source1, source2)

    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('应该处理 null 和 undefined', () => {
    const target = { a: 1 }
    const result = deepMerge(target, {})

    expect(result).toEqual({ a: 1 })
  })
})

describe('isSameMessage', () => {
  it('应该忽略大小写', () => {
    expect(isSameMessage('Hello', 'hello')).toBe(true)
    expect(isSameMessage('HELLO', 'hello')).toBe(true)
  })

  it('应该忽略首尾空格', () => {
    expect(isSameMessage('  Hello  ', 'Hello')).toBe(true)
    expect(isSameMessage('Hello', '  Hello  ')).toBe(true)
  })

  it('不同消息应该返回 false', () => {
    expect(isSameMessage('Hello', 'World')).toBe(false)
  })

  it('应该处理空字符串', () => {
    expect(isSameMessage('', '')).toBe(false)
    expect(isSameMessage('Hello', '')).toBe(false)
  })
})

describe('getElementHeight', () => {
  it('应该返回元素的完整高度', () => {
    const element = document.createElement('div')
    element.style.height = '100px'
    element.style.marginTop = '10px'
    element.style.marginBottom = '20px'
    document.body.appendChild(element)

    const height = getElementHeight(element)

    // 应该包括 height + marginTop + marginBottom
    expect(height).toBeGreaterThan(100)

    document.body.removeChild(element)
  })

  it('没有元素时应该返回 0', () => {
    expect(getElementHeight(null as any)).toBe(0)
  })
})

describe('rafBatch', () => {
  it('应该在下一帧执行回调', async () => {
    const fn = vi.fn()

    const promise = rafBatch(fn)
    expect(fn).not.toHaveBeenCalled()

    await promise
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该捕获回调中的错误', async () => {
    const fn = vi.fn(() => {
      throw new Error('Test error')
    })

    // 不应该抛出错误
    await expect(rafBatch(fn)).resolves.toBeUndefined()
  })
})

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该等待指定时间', async () => {
    const promise = sleep(1000)

    vi.advanceTimersByTime(999)
    await Promise.race([promise, Promise.resolve('pending')])
      .then(result => expect(result).toBe('pending'))

    vi.advanceTimersByTime(1)
    await promise
  })
})

describe('clamp', () => {
  it('应该限制数值在范围内', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('应该处理边界值', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('应该处理负数范围', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-15, -10, -1)).toBe(-10)
    expect(clamp(0, -10, -1)).toBe(-1)
  })
})


