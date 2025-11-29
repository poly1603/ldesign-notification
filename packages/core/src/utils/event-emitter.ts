/**
 * 事件发射器
 * @description 提供类型安全的事件订阅和发布功能
 */

/**
 * 事件处理器类型
 */
type EventHandler<T extends unknown[]> = (...args: T) => void

/**
 * 事件映射类型
 */
type EventMap = Record<string, unknown[]>

/**
 * 事件发射器类
 * @template T - 事件映射类型
 */
export class EventEmitter<T extends EventMap = EventMap> {
  /** 事件处理器映射 */
  private handlers: Map<keyof T, Set<EventHandler<unknown[]>>> = new Map()

  /**
   * 订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   * @returns 取消订阅函数
   */
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown[]>)

    return () => this.off(event, handler)
  }

  /**
   * 订阅一次性事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const onceHandler = ((...args: T[K]) => {
      this.off(event, onceHandler as EventHandler<T[K]>)
      handler(...args)
    }) as EventHandler<T[K]>

    this.on(event, onceHandler)
  }

  /**
   * 取消订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(handler as EventHandler<unknown[]>)
      if (handlers.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  /**
   * 发射事件
   * @param event - 事件名称
   * @param args - 事件参数
   */
  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args)
        }
        catch (error) {
          console.error(`Error in event handler for "${String(event)}":`, error)
        }
      })
    }
  }

  /**
   * 移除指定事件的所有处理器
   * @param event - 事件名称
   */
  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.handlers.delete(event)
    }
    else {
      this.handlers.clear()
    }
  }

  /**
   * 获取指定事件的处理器数量
   * @param event - 事件名称
   * @returns 处理器数量
   */
  listenerCount<K extends keyof T>(event: K): number {
    return this.handlers.get(event)?.size ?? 0
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): (keyof T)[] {
    return Array.from(this.handlers.keys())
  }
}

/**
 * 创建事件发射器
 * @template T - 事件映射类型
 * @returns 事件发射器实例
 */
export function createEventEmitter<T extends EventMap>(): EventEmitter<T> {
  return new EventEmitter<T>()
}

