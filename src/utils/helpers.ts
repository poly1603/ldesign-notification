/**
 * 辅助工具函数
 * 
 * @description 提供通知系统所需的各种工具函数
 */

/**
 * ID 计数器（用于生成唯一 ID）
 */
let idCounter = 0

/**
 * 随机种子（增强唯一性）
 */
const randomSeed = Math.random().toString(36).substring(2, 9)

/**
 * 生成唯一 ID
 * 
 * @param prefix - ID 前缀
 * @returns 唯一 ID 字符串
 * 
 * @description
 * 使用时间戳 + 计数器 + 随机种子的组合，确保高并发下的唯一性
 * 
 * @example
 * ```ts
 * const id = generateId('toast') // 'toast-1704067200000-1-abc123'
 * ```
 */
export function generateId(prefix = 'notification'): string {
  return `${prefix}-${Date.now()}-${++idCounter}-${randomSeed}`
}

/**
 * 防抖选项
 */
export interface DebounceOptions {
  /** 是否在延迟开始前调用函数 */
  leading?: boolean
  /** 是否在延迟结束后调用函数 */
  trailing?: boolean
  /** 最大等待时间 */
  maxWait?: number
}

/**
 * 防抖函数
 * 
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @param options - 防抖选项
 * @returns 防抖后的函数
 * 
 * @description
 * 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时
 * 
 * @example
 * ```ts
 * const search = debounce((keyword: string) => {
 *   console.log('Searching:', keyword)
 * }, 300)
 * 
 * search('hello') // 300ms 后才会执行
 * search('hello world') // 重新计时，300ms 后执行
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: DebounceOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true, maxWait } = options

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastCallTime = 0
  let lastInvokeTime = 0
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null

  function invokeFunc() {
    if (lastArgs && lastThis !== undefined) {
      lastInvokeTime = Date.now()
      fn.apply(lastThis, lastArgs)
      lastArgs = null
      lastThis = null
    }
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // 首次调用 或 超过延迟时间 或 超过最大等待时间
    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function leadingEdge() {
    lastInvokeTime = Date.now()
    if (leading) {
      invokeFunc()
    }
  }

  function trailingEdge() {
    timeoutId = null
    if (trailing && lastArgs) {
      invokeFunc()
    }
    lastArgs = null
    lastThis = null
  }

  function timerExpired() {
    const time = Date.now()

    if (shouldInvoke(time)) {
      trailingEdge()
    }
    else {
      // 重新设置定时器
      const timeSinceLastCall = time - lastCallTime
      const timeWaiting = delay - timeSinceLastCall
      timeoutId = setTimeout(timerExpired, timeWaiting)
    }
  }

  return function (this: any, ...args: Parameters<T>) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === null) {
        leadingEdge()
      }

      if (maxWait !== undefined) {
        // 处理 maxWait 的情况
        timeoutId = setTimeout(timerExpired, delay)
        if (leading) {
          invokeFunc()
        }
        return
      }
    }

    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay)
    }
  }
}

/**
 * 节流选项
 */
export interface ThrottleOptions {
  /** 是否在延迟开始前调用函数 */
  leading?: boolean
  /** 是否在延迟结束后调用函数 */
  trailing?: boolean
}

/**
 * 节流函数
 * 
 * @param fn - 要节流的函数
 * @param delay - 延迟时间（毫秒）
 * @param options - 节流选项
 * @returns 节流后的函数
 * 
 * @description
 * 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 * 
 * @example
 * ```ts
 * const handleScroll = throttle(() => {
 *   console.log('Scrolling...')
 * }, 200)
 * 
 * window.addEventListener('scroll', handleScroll)
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => any {
  const { leading = true, trailing = true } = options

  let lastCallTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null

  function invokeFunc() {
    if (lastArgs && lastThis !== undefined) {
      lastCallTime = Date.now()
      const result = fn.apply(lastThis, lastArgs)
      lastArgs = null
      lastThis = null
      return result
    }
  }

  function leadingEdge() {
    lastCallTime = Date.now()
    if (leading) {
      return invokeFunc()
    }
  }

  function trailingEdge() {
    timeoutId = null
    if (trailing && lastArgs) {
      return invokeFunc()
    }
  }

  function timerExpired() {
    const time = Date.now()
    const timeSinceLastCall = time - lastCallTime

    if (timeSinceLastCall >= delay) {
      trailingEdge()
    }
    else {
      timeoutId = setTimeout(timerExpired, delay - timeSinceLastCall)
    }
  }

  return function (this: any, ...args: Parameters<T>) {
    const time = Date.now()
    const timeSinceLastCall = time - lastCallTime

    lastArgs = args
    lastThis = this

    if (timeSinceLastCall >= delay) {
      // 如果超过延迟时间，立即执行
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      return leadingEdge()
    }
    else if (timeoutId === null && trailing) {
      // 设置延迟执行
      timeoutId = setTimeout(timerExpired, delay - timeSinceLastCall)
    }
  }
}

/**
 * 深度合并对象
 * 
 * @param target - 目标对象
 * @param sources - 源对象数组
 * @returns 合并后的对象
 * 
 * @description
 * 深度递归合并多个对象，后面的对象会覆盖前面的同名属性
 * 
 * @example
 * ```ts
 * const result = deepMerge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 } }
 * )
 * // { a: 1, b: { c: 2, d: 3 } }
 * ```
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) {
    return target
  }

  const source = sources.shift()
  if (!source) {
    return target
  }

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} })
          }
          deepMerge(target[key], source[key])
        }
        else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 检查是否为对象
 * 
 * @param item - 要检查的项
 * @returns 是否为纯对象
 * 
 * @description
 * 判断是否为纯对象（排除数组、null、Date 等）
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date)
}

/**
 * 检查是否为浏览器环境
 * 
 * @description
 * 用于判断代码是否运行在浏览器中（而非 Node.js 等环境）
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/**
 * 检查是否支持 Notification API
 * 
 * @returns 是否支持浏览器原生通知
 * 
 * @description
 * 检查浏览器是否支持原生的 Notification API
 */
export function isNotificationSupported(): boolean {
  return isBrowser && 'Notification' in window
}

/**
 * 检查是否支持 Service Worker
 * 
 * @returns 是否支持 Service Worker
 * 
 * @description
 * Service Worker 可用于实现后台通知等高级功能
 */
export function isServiceWorkerSupported(): boolean {
  return isBrowser && 'serviceWorker' in navigator
}

/**
 * 安全的 JSON 序列化
 * 
 * @param obj - 要序列化的对象
 * @returns JSON 字符串
 * 
 * @description
 * 捕获 JSON.stringify 的异常，失败时返回字符串形式
 * 
 * @example
 * ```ts
 * const json = safeJsonStringify({ name: 'test' })
 * const circular = {}
 * circular.self = circular
 * const safe = safeJsonStringify(circular) // 不会抛出异常
 * ```
 */
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj)
  }
  catch (error) {
    console.warn('[helpers] JSON stringify failed:', error)
    return String(obj)
  }
}

/**
 * 安全的 JSON 解析
 * 
 * @param str - JSON 字符串
 * @param fallback - 解析失败时的默认值
 * @returns 解析后的对象或默认值
 * 
 * @description
 * 捕获 JSON.parse 的异常，失败时返回提供的默认值
 * 
 * @example
 * ```ts
 * const obj = safeJsonParse('{"name":"test"}', {})
 * const invalid = safeJsonParse('invalid json', {}) // 返回 {}
 * ```
 */
export function safeJsonParse<T = any>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  }
  catch (error) {
    console.warn('[helpers] JSON parse failed:', error)
    return fallback
  }
}

/**
 * 获取元素的实际高度（包括 margin）
 * 
 * @param element - HTML 元素
 * @returns 元素高度（像素）
 * 
 * @description
 * 计算元素的完整高度，包括内容、padding、border 和 margin
 * 
 * @example
 * ```ts
 * const height = getElementHeight(document.querySelector('.notification'))
 * ```
 */
export function getElementHeight(element: HTMLElement): number {
  if (!isBrowser || !element) {
    return 0
  }

  try {
    const styles = window.getComputedStyle(element)
    const height = element.offsetHeight
    const marginTop = Number.parseFloat(styles.marginTop) || 0
    const marginBottom = Number.parseFloat(styles.marginBottom) || 0

    return height + marginTop + marginBottom
  }
  catch (error) {
    console.warn('[helpers] Get element height failed:', error)
    return 0
  }
}

/**
 * 判断两个消息是否相同（用于防重复）
 * 
 * @param msg1 - 消息1
 * @param msg2 - 消息2
 * @returns 是否相同
 * 
 * @description
 * 忽略大小写和首尾空格比较两个消息是否相同
 * 
 * @example
 * ```ts
 * isSameMessage('  Hello  ', 'hello') // true
 * isSameMessage('Hello', 'World') // false
 * ```
 */
export function isSameMessage(msg1: string, msg2: string): boolean {
  if (!msg1 || !msg2) {
    return false
  }
  return msg1.trim().toLowerCase() === msg2.trim().toLowerCase()
}

/**
 * 批量更新 DOM（使用 requestAnimationFrame）
 * 
 * @param callback - 更新回调函数
 * @returns Promise
 * 
 * @description
 * 在下一个动画帧执行 DOM 更新，避免布局抖动
 * 
 * @example
 * ```ts
 * await rafBatch(() => {
 *   element1.style.transform = 'translateX(100px)'
 *   element2.style.opacity = '0'
 * })
 * ```
 */
export function rafBatch(callback: () => void): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      try {
        callback()
        resolve()
      }
      catch (error) {
        console.error('[helpers] RAF batch failed:', error)
        resolve()
      }
    })
  })
}

/**
 * 等待指定时间
 * 
 * @param ms - 等待时间（毫秒）
 * @returns Promise
 * 
 * @description
 * 返回一个在指定时间后 resolve 的 Promise
 * 
 * @example
 * ```ts
 * await sleep(1000) // 等待 1 秒
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 限制数值范围
 * 
 * @param value - 值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 * 
 * @description
 * 将数值限制在指定范围内
 * 
 * @example
 * ```ts
 * clamp(150, 0, 100) // 100
 * clamp(-10, 0, 100) // 0
 * clamp(50, 0, 100) // 50
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}



