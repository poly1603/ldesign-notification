/**
 * useToast Composable
 * @description Vue 3 Toast 组合式函数
 * @module @ldesign/notification-vue/composables/useToast
 */

import { computed, getCurrentInstance, onUnmounted, shallowReactive, shallowReadonly } from 'vue'
import type {
  ContentType,
  PromiseMessages,
  ToastConfig,
  ToastItem,
  ToastManagerConfig,
  ToastShortcutConfig,
} from '@ldesign/notification-core'
import { ToastManager } from '@ldesign/notification-core'

/** 全局 Toast 管理器实例 */
let globalToastManager: ToastManager | null = null

/** SSR 安全的 ID 计数器 */
let ssrIdCounter = 0

/**
 * 生成 SSR 安全的 ID
 * @param prefix - ID 前缀
 * @returns 唯一 ID
 */
function useSSRSafeId(prefix = 'toast'): string {
  const instance = getCurrentInstance()
  if (instance) {
    return `${prefix}-${instance.uid}`
  }
  return `${prefix}-ssr-${++ssrIdCounter}`
}

/**
 * 获取全局 Toast 管理器
 * @returns 全局 Toast 管理器实例
 * @example
 * ```ts
 * const manager = getGlobalToastManager()
 * manager.success('保存成功')
 * ```
 */
export function getGlobalToastManager(): ToastManager {
  if (!globalToastManager) {
    globalToastManager = new ToastManager()
  }
  return globalToastManager
}

/**
 * 重置全局 Toast 管理器
 * @description 用于测试或特殊场景
 */
export function resetGlobalToastManager(): void {
  if (globalToastManager) {
    globalToastManager.dispose()
    globalToastManager = null
  }
}

/**
 * Toast 状态
 */
export interface ToastState {
  /** Toast 列表 */
  readonly items: ToastItem[]
  /** Toast 数量 */
  readonly count: number
}

/**
 * useToast 返回类型
 */
export interface UseToastReturn {
  /** Toast 状态（只读） */
  readonly state: Readonly<ToastState>
  /** 显示 Toast */
  show: (config: ToastConfig) => string
  /** 成功提示 */
  success: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 错误提示 */
  error: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 警告提示 */
  warning: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 信息提示 */
  info: (message: ContentType, config?: ToastShortcutConfig) => string
  /** 加载提示 */
  loading: (message: ContentType, config?: ToastShortcutConfig) => string
  /** Promise 绑定 */
  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>, config?: ToastShortcutConfig) => Promise<T>
  /** 暂停计时器 */
  pause: (id: string) => void
  /** 恢复计时器 */
  resume: (id: string) => void
  /** 关闭指定 Toast */
  close: (id: string) => void
  /** 关闭所有 Toast */
  closeAll: () => void
  /** 更新 Toast */
  update: (id: string, config: Partial<ToastConfig>) => void
  /** 配置全局选项 */
  configure: (config: ToastManagerConfig) => void
  /** 按位置分组的 Toast */
  readonly groupedItems: Readonly<Record<string, ToastItem[]>>
  /** 获取指定 Toast */
  get: (id: string) => ToastItem | undefined
  /** 检查 Toast 是否存在 */
  has: (id: string) => boolean
}

/**
 * useToast 组合式函数
 * @param config - 初始配置
 * @returns Toast API
 * @example
 * ```ts
 * const toast = useToast()
 *
 * // 显示成功提示
 * toast.success('操作成功')
 *
 * // 显示错误提示
 * toast.error('操作失败')
 *
 * // 显示加载提示
 * const loadingId = toast.loading('加载中...')
 * // 完成后关闭
 * toast.close(loadingId)
 *
 * // Promise 绑定
 * await toast.promise(fetchData(), {
 *   loading: '加载中...',
 *   success: '加载成功',
 *   error: '加载失败'
 * })
 * ```
 */
export function useToast(config?: ToastManagerConfig): UseToastReturn {
  const manager = getGlobalToastManager()

  // 如果提供了配置，更新管理器配置
  if (config) {
    manager.configure(config)
  }

  // 使用 shallowReactive 优化性能（避免深度响应式）
  const state = shallowReactive<ToastState>({
    items: [],
    count: 0,
  })

  /**
   * 同步状态
   */
  const syncState = (): void => {
    state.items = [...manager.items]
    state.count = manager.count
  }

  // 订阅事件
  const unsubShow = manager.on('show', syncState)
  const unsubClose = manager.on('close', syncState)
  const unsubUpdate = manager.on('update', syncState)
  const unsubClear = manager.on('clear', syncState)

  // 组件卸载时取消订阅
  onUnmounted(() => {
    unsubShow()
    unsubClose()
    unsubUpdate()
    unsubClear()
  })

  // 初始同步
  syncState()

  /**
   * 按位置分组的 Toast
   */
  const groupedItems = computed(() => {
    const groups: Record<string, ToastItem[]> = {}
    state.items.forEach((item) => {
      if (!groups[item.position]) {
        groups[item.position] = []
      }
      groups[item.position].push(item)
    })
    return groups
  })

  return {
    state: shallowReadonly(state) as Readonly<ToastState>,
    show: (cfg: ToastConfig) => manager.show(cfg),
    success: (message: ContentType, cfg?: ToastShortcutConfig) => manager.success(message, cfg),
    error: (message: ContentType, cfg?: ToastShortcutConfig) => manager.error(message, cfg),
    warning: (message: ContentType, cfg?: ToastShortcutConfig) => manager.warning(message, cfg),
    info: (message: ContentType, cfg?: ToastShortcutConfig) => manager.info(message, cfg),
    loading: (message: ContentType, cfg?: ToastShortcutConfig) => manager.loading(message, cfg),
    promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>, cfg?: ToastShortcutConfig) =>
      manager.promise(promise, messages, cfg),
    pause: (id: string) => manager.pause(id),
    resume: (id: string) => manager.resume(id),
    close: (id: string) => manager.close(id),
    closeAll: () => manager.closeAll(),
    update: (id: string, cfg: Partial<ToastConfig>) => manager.update(id, cfg),
    configure: (cfg: ToastManagerConfig) => manager.configure(cfg),
    groupedItems: groupedItems.value,
    get: (id: string) => manager.get(id),
    has: (id: string) => manager.has(id),
  }
}

/**
 * 创建独立的 Toast 实例
 * @param config - 初始配置
 * @returns Toast 管理器
 */
export function createToast(config?: ToastManagerConfig): ToastManager {
  return new ToastManager(config)
}

/**
 * 全局 Toast API（便捷方法）
 * @description 无需组件上下文即可使用
 * @example
 * ```ts
 * import { toast } from '@ldesign/notification-vue'
 *
 * toast.success('保存成功')
 * toast.error('保存失败')
 * ```
 */
export const toast = {
  show: (config: ToastConfig) => getGlobalToastManager().show(config),
  success: (message: ContentType, config?: ToastShortcutConfig) => getGlobalToastManager().success(message, config),
  error: (message: ContentType, config?: ToastShortcutConfig) => getGlobalToastManager().error(message, config),
  warning: (message: ContentType, config?: ToastShortcutConfig) => getGlobalToastManager().warning(message, config),
  info: (message: ContentType, config?: ToastShortcutConfig) => getGlobalToastManager().info(message, config),
  loading: (message: ContentType, config?: ToastShortcutConfig) => getGlobalToastManager().loading(message, config),
  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>, config?: ToastShortcutConfig) =>
    getGlobalToastManager().promise(promise, messages, config),
  pause: (id: string) => getGlobalToastManager().pause(id),
  resume: (id: string) => getGlobalToastManager().resume(id),
  close: (id: string) => getGlobalToastManager().close(id),
  closeAll: () => getGlobalToastManager().closeAll(),
  update: (id: string, config: Partial<ToastConfig>) => getGlobalToastManager().update(id, config),
}

