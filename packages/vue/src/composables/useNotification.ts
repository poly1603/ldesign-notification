/**
 * useNotification Composable
 * @description Vue 3 Notification 组合式函数
 */

import { computed, onUnmounted, reactive, readonly } from 'vue'
import type {
  ContentType,
  NotificationConfig,
  NotificationItem,
  NotificationManagerConfig,
  NotificationShortcutConfig,
} from '@ldesign/notification-core'
import { NotificationManager } from '@ldesign/notification-core'

/** 全局 Notification 管理器实例 */
let globalNotificationManager: NotificationManager | null = null

/**
 * 获取全局 Notification 管理器
 * @returns 全局 Notification 管理器实例
 */
export function getGlobalNotificationManager(): NotificationManager {
  if (!globalNotificationManager) {
    globalNotificationManager = new NotificationManager()
  }
  return globalNotificationManager
}

/**
 * 获取全局 Notification 管理器（内部使用）
 * @deprecated 请使用 getGlobalNotificationManager
 */
function getNotificationManager(): NotificationManager {
  return getGlobalNotificationManager()
}

/**
 * Notification 状态
 */
interface NotificationState {
  /** Notification 列表 */
  items: NotificationItem[]
}

/**
 * useNotification 返回类型
 */
export interface UseNotificationReturn {
  /** Notification 状态 */
  state: Readonly<NotificationState>
  /** 显示通知 */
  show: (config: NotificationConfig) => string
  /** 成功通知 */
  success: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 错误通知 */
  error: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 警告通知 */
  warning: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 信息通知 */
  info: (title: ContentType, config?: NotificationShortcutConfig) => string
  /** 关闭指定通知 */
  close: (id: string) => void
  /** 关闭所有通知 */
  closeAll: () => void
  /** 更新通知 */
  update: (id: string, config: Partial<NotificationConfig>) => void
  /** 配置全局选项 */
  config: (config: NotificationManagerConfig) => void
  /** 按位置分组的通知 */
  groupedItems: Record<string, NotificationItem[]>
}

/**
 * useNotification 组合式函数
 * @param config - 初始配置
 * @returns Notification API
 * @example
 * ```ts
 * const notification = useNotification()
 *
 * // 显示成功通知
 * notification.success('操作成功', {
 *   content: '您的数据已保存',
 * })
 *
 * // 显示带操作按钮的通知
 * notification.info('新消息', {
 *   content: '您有一条新消息',
 *   actions: [
 *     { text: '查看', onClick: () => console.log('查看') },
 *   ],
 * })
 * ```
 */
export function useNotification(config?: NotificationManagerConfig): UseNotificationReturn {
  const manager = getNotificationManager()

  // 如果提供了配置，更新管理器配置
  if (config) {
    manager.configure(config)
  }

  // 响应式状态
  const state = reactive<NotificationState>({
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
   * 按位置分组的通知
   */
  const groupedItems = computed(() => {
    const groups: Record<string, NotificationItem[]> = {}
    state.items.forEach((item) => {
      if (!groups[item.position]) {
        groups[item.position] = []
      }
      groups[item.position].push(item)
    })
    return groups
  })

  return {
    state: readonly(state) as Readonly<NotificationState>,
    show: (cfg: NotificationConfig) => manager.show(cfg),
    success: (title: ContentType, cfg?: NotificationShortcutConfig) => manager.success(title, cfg),
    error: (title: ContentType, cfg?: NotificationShortcutConfig) => manager.error(title, cfg),
    warning: (title: ContentType, cfg?: NotificationShortcutConfig) => manager.warning(title, cfg),
    info: (title: ContentType, cfg?: NotificationShortcutConfig) => manager.info(title, cfg),
    close: (id: string) => manager.close(id),
    closeAll: () => manager.closeAll(),
    update: (id: string, cfg: Partial<NotificationConfig>) => manager.update(id, cfg),
    config: (cfg: NotificationManagerConfig) => manager.configure(cfg),
    groupedItems: groupedItems.value,
  }
}

/**
 * 创建独立的 Notification 实例
 */
export function createNotification(config?: NotificationManagerConfig): NotificationManager {
  return new NotificationManager(config)
}

/**
 * 全局 Notification API（便捷方法）
 */
export const notification = {
  show: (config: NotificationConfig) => getNotificationManager().show(config),
  success: (title: ContentType, config?: NotificationShortcutConfig) => getNotificationManager().success(title, config),
  error: (title: ContentType, config?: NotificationShortcutConfig) => getNotificationManager().error(title, config),
  warning: (title: ContentType, config?: NotificationShortcutConfig) => getNotificationManager().warning(title, config),
  info: (title: ContentType, config?: NotificationShortcutConfig) => getNotificationManager().info(title, config),
  close: (id: string) => getNotificationManager().close(id),
  closeAll: () => getNotificationManager().closeAll(),
  update: (id: string, config: Partial<NotificationConfig>) => getNotificationManager().update(id, config),
}

