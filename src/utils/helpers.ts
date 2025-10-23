/**
 * 辅助工具函数
 */

/**
 * 生成唯一 ID
 */
let idCounter = 0
export function generateId(prefix = 'notification'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length)
    return target

  const source = sources.shift()
  if (!source)
    return target

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key])
          Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      }
      else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 检查是否为对象
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 检查是否为浏览器环境
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * 检查是否支持 Notification API
 */
export function isNotificationSupported(): boolean {
  return isBrowser && 'Notification' in window
}

/**
 * 检查是否支持 Service Worker
 */
export function isServiceWorkerSupported(): boolean {
  return isBrowser && 'serviceWorker' in navigator
}

/**
 * 安全的 JSON 序列化
 */
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj)
  }
  catch {
    return String(obj)
  }
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T = any>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  }
  catch {
    return fallback
  }
}

/**
 * 获取元素的实际高度（包括 margin）
 */
export function getElementHeight(element: HTMLElement): number {
  if (!isBrowser)
    return 0

  const styles = window.getComputedStyle(element)
  const height = element.offsetHeight
  const marginTop = Number.parseFloat(styles.marginTop)
  const marginBottom = Number.parseFloat(styles.marginBottom)

  return height + marginTop + marginBottom
}

/**
 * 判断两个消息是否相同（用于防重复）
 */
export function isSameMessage(msg1: string, msg2: string): boolean {
  return msg1.trim().toLowerCase() === msg2.trim().toLowerCase()
}



