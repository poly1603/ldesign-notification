/**
 * useDrawer Composable
 * @description Vue 3 Drawer 组合式函数
 */

import { onMounted, onUnmounted, reactive, readonly } from 'vue'
import type { DrawerConfig, DrawerItem } from '@ldesign/notification-core'
import { DrawerManager } from '@ldesign/notification-core'

/** 全局 Drawer 管理器实例 */
let globalDrawerManager: DrawerManager | null = null

/**
 * 获取全局 Drawer 管理器
 * @returns 全局 Drawer 管理器实例
 */
export function getGlobalDrawerManager(): DrawerManager {
  if (!globalDrawerManager) {
    globalDrawerManager = new DrawerManager()
  }
  return globalDrawerManager
}

/**
 * 获取全局 Drawer 管理器（内部使用）
 * @deprecated 请使用 getGlobalDrawerManager
 */
function getDrawerManager(): DrawerManager {
  return getGlobalDrawerManager()
}

/**
 * Drawer 状态
 */
interface DrawerState {
  /** Drawer 列表 */
  items: DrawerItem[]
  /** 当前最顶层 Drawer */
  topDrawer: DrawerItem | undefined
}

/**
 * useDrawer 返回类型
 */
export interface UseDrawerReturn {
  /** Drawer 状态 */
  state: Readonly<DrawerState>
  /** 打开抽屉 */
  open: (config: DrawerConfig) => Promise<string>
  /** 关闭抽屉 */
  close: (id: string) => Promise<void>
  /** 关闭所有抽屉 */
  closeAll: () => void
  /** 更新抽屉配置 */
  update: (id: string, config: Partial<DrawerConfig>) => void
}

/**
 * useDrawer 组合式函数
 * @returns Drawer API
 * @example
 * ```ts
 * const drawer = useDrawer()
 *
 * // 打开抽屉
 * const id = await drawer.open({
 *   title: '设置',
 *   placement: 'right',
 *   width: 400,
 * })
 *
 * // 关闭抽屉
 * await drawer.close(id)
 * ```
 */
export function useDrawer(): UseDrawerReturn {
  const manager = getDrawerManager()

  // 响应式状态
  const state = reactive<DrawerState>({
    items: [],
    topDrawer: undefined,
  })

  /**
   * 同步状态
   */
  const syncState = (): void => {
    state.items = [...manager.items]
    state.topDrawer = manager.topDrawer
  }

  // 订阅事件
  const unsubOpen = manager.on('open', syncState)
  const unsubClose = manager.on('close', syncState)
  const unsubUpdate = manager.on('update', syncState)
  const unsubClear = manager.on('clear', syncState)

  /**
   * 处理键盘事件
   */
  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      manager.handleEscape()
    }
  }

  // 挂载时添加键盘监听
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  // 组件卸载时取消订阅
  onUnmounted(() => {
    unsubOpen()
    unsubClose()
    unsubUpdate()
    unsubClear()
    document.removeEventListener('keydown', handleKeydown)
  })

  // 初始同步
  syncState()

  return {
    state: readonly(state) as Readonly<DrawerState>,
    open: (config: DrawerConfig) => manager.open(config),
    close: (id: string) => manager.close(id),
    closeAll: () => manager.closeAll(),
    update: (id: string, config: Partial<DrawerConfig>) => manager.update(id, config),
  }
}

/**
 * 创建独立的 Drawer 实例
 */
export function createDrawer(): DrawerManager {
  return new DrawerManager()
}

/**
 * 全局 Drawer API（便捷方法）
 */
export const drawer = {
  open: (config: DrawerConfig) => getDrawerManager().open(config),
  close: (id: string) => getDrawerManager().close(id),
  closeAll: () => getDrawerManager().closeAll(),
  update: (id: string, config: Partial<DrawerConfig>) => getDrawerManager().update(id, config),
}

