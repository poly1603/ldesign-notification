/**
 * 定时器工具
 * @description 提供可暂停的定时器功能
 */

/**
 * 可暂停定时器接口
 */
export interface PausableTimer {
  /** 暂停定时器 */
  pause: () => void
  /** 恢复定时器 */
  resume: () => void
  /** 取消定时器 */
  cancel: () => void
  /** 获取剩余时间 */
  remaining: () => number
  /** 是否已暂停 */
  isPaused: () => boolean
  /** 是否已取消 */
  isCancelled: () => boolean
}

/**
 * 创建可暂停的定时器
 * @param callback - 回调函数
 * @param duration - 持续时间（毫秒）
 * @returns 可暂停定时器对象
 * @example
 * ```ts
 * const timer = createPausableTimer(() => {
 *   console.log('Timer fired!')
 * }, 3000)
 *
 * // 暂停
 * timer.pause()
 *
 * // 恢复
 * timer.resume()
 *
 * // 取消
 * timer.cancel()
 * ```
 */
export function createPausableTimer(
  callback: () => void,
  duration: number,
): PausableTimer {
  let timerId: ReturnType<typeof setTimeout> | null = null
  let startTime = Date.now()
  let remainingTime = duration
  let paused = false
  let cancelled = false

  /**
   * 启动定时器
   */
  const start = (): void => {
    if (cancelled || remainingTime <= 0)
      return

    startTime = Date.now()
    timerId = setTimeout(() => {
      if (!cancelled) {
        callback()
        cancelled = true
      }
    }, remainingTime)
  }

  /**
   * 暂停定时器
   */
  const pause = (): void => {
    if (paused || cancelled || timerId === null)
      return

    clearTimeout(timerId)
    timerId = null
    remainingTime -= Date.now() - startTime
    paused = true
  }

  /**
   * 恢复定时器
   */
  const resume = (): void => {
    if (!paused || cancelled)
      return

    paused = false
    start()
  }

  /**
   * 取消定时器
   */
  const cancel = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
    cancelled = true
    remainingTime = 0
  }

  /**
   * 获取剩余时间
   */
  const remaining = (): number => {
    if (cancelled)
      return 0
    if (paused)
      return remainingTime
    return Math.max(0, remainingTime - (Date.now() - startTime))
  }

  // 启动定时器
  start()

  return {
    pause,
    resume,
    cancel,
    remaining,
    isPaused: () => paused,
    isCancelled: () => cancelled,
  }
}

/**
 * 延迟执行
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建节流函数
 * @param fn - 原函数
 * @param wait - 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return (...args: Parameters<T>): void => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      fn(...args)
    }
  }
}

/**
 * 创建防抖函数
 * @param fn - 原函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>): void => {
    if (timerId !== null) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, wait)
  }
}

