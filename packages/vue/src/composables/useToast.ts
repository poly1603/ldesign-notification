/**
 * useToast Composable
 * @description Vue 3 Toast 组合式函数
 */

import { computed, onUnmounted, reactive, readonly } from 'vue'
import type {
  ContentType,
  ToastConfig,
  ToastItem,
  ToastManagerConfig,
  ToastShortcutConfig,
} from '@ldesign/notification-core'
import { ToastManager } from '@ldesign/notification-core'

/** 全局 Toast 管理器实例 */
let globalToastManager: ToastManager | null = null

/**
 * 获取全局 Toast 管理器
 * @returns 全局 Toast 管理器实例
 */
export function getGlobalToastManager(): ToastManager {
  if (!globalToastManager) {
    globalToastManager = new ToastManager()
  }
  return globalToastManager
}

/**
 * 获取全局 Toast 管理器（内部使用）
 * @deprecated 请使用 getGlobalToastManager
 */
function getToastManager(): ToastManager {
  return getGlobalToastManager()
}

/**
 * Toast 状态
 */
interface ToastState {
  /** Toast 列表 */
  items: ToastItem[]
}

/**
 * useToast 返回类型
 */
export interface UseToastReturn {
  /** Toast 状态 */
  state: Readonly<ToastState>
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
  /** 关闭指定 Toast */
  close: (id: string) => void
  /** 关闭所有 Toast */
  closeAll: () => void
  /** 更新 Toast */
  update: (id: string, config: Partial<ToastConfig>) => void
  /** 配置全局选项 */
  config: (config: ToastManagerConfig) => void
  /** 按位置分组的 Toast */
  groupedItems: Record<string, ToastItem[]>
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
 * ```
 */
export function useToast(config?: ToastManagerConfig): UseToastReturn {
  const manager = getToastManager()

  // 如果提供了配置，更新管理器配置
  if (config) {
    Object.assign(manager.config, config)
  }

  // 响应式状态
  const state = reactive<ToastState>({
    items: [],
  })

  /**
   * 同步状态
   */
  const syncState = (): void => {
    state.items = [...manager.items]
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
    state: readonly(state) as Readonly<ToastState>,
    show: (cfg: ToastConfig) => manager.show(cfg),
    success: (message: ContentType, cfg?: ToastShortcutConfig) => manager.success(message, cfg),
    error: (message: ContentType, cfg?: ToastShortcutConfig) => manager.error(message, cfg),
    warning: (message: ContentType, cfg?: ToastShortcutConfig) => manager.warning(message, cfg),
    info: (message: ContentType, cfg?: ToastShortcutConfig) => manager.info(message, cfg),
    loading: (message: ContentType, cfg?: ToastShortcutConfig) => manager.loading(message, cfg),
    close: (id: string) => manager.close(id),
    closeAll: () => manager.closeAll(),
    update: (id: string, cfg: Partial<ToastConfig>) => manager.update(id, cfg),
    config: (cfg: ToastManagerConfig) => Object.assign(manager.config, cfg),
    groupedItems: groupedItems.value,
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
 */
export const toast = {
  show: (config: ToastConfig) => getToastManager().show(config),
  success: (message: ContentType, config?: ToastShortcutConfig) => getToastManager().success(message, config),
  error: (message: ContentType, config?: ToastShortcutConfig) => getToastManager().error(message, config),
  warning: (message: ContentType, config?: ToastShortcutConfig) => getToastManager().warning(message, config),
  info: (message: ContentType, config?: ToastShortcutConfig) => getToastManager().info(message, config),
  loading: (message: ContentType, config?: ToastShortcutConfig) => getToastManager().loading(message, config),
  close: (id: string) => getToastManager().close(id),
  closeAll: () => getToastManager().closeAll(),
  update: (id: string, config: Partial<ToastConfig>) => getToastManager().update(id, config),
}

