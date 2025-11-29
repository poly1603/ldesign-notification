/**
 * useMessage Composable
 * @description Vue 3 Message 组合式函数
 */

import { computed, onUnmounted, reactive, readonly } from 'vue'
import type {
  ContentType,
  MessageConfig,
  MessageItem,
  MessageManagerConfig,
  MessageShortcutConfig,
} from '@ldesign/notification-core'
import { MessageManager } from '@ldesign/notification-core'

/** 全局 Message 管理器实例 */
let globalMessageManager: MessageManager | null = null

/**
 * 获取全局 Message 管理器
 * @returns 全局 Message 管理器实例
 */
export function getGlobalMessageManager(): MessageManager {
  if (!globalMessageManager) {
    globalMessageManager = new MessageManager()
  }
  return globalMessageManager
}

/**
 * 获取全局 Message 管理器（内部使用）
 * @deprecated 请使用 getGlobalMessageManager
 */
function getMessageManager(): MessageManager {
  return getGlobalMessageManager()
}

/**
 * Message 状态
 */
interface MessageState {
  /** Message 列表 */
  items: MessageItem[]
}

/**
 * useMessage 返回类型
 */
export interface UseMessageReturn {
  /** Message 状态 */
  state: Readonly<MessageState>
  /** 显示消息 */
  show: (config: MessageConfig) => string
  /** 成功消息 */
  success: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 错误消息 */
  error: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 警告消息 */
  warning: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 信息消息 */
  info: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 加载消息 */
  loading: (content: ContentType, config?: MessageShortcutConfig) => string
  /** 关闭指定消息 */
  close: (id: string) => void
  /** 关闭所有消息 */
  closeAll: () => void
  /** 配置全局选项 */
  config: (config: MessageManagerConfig) => void
  /** 按位置分组的消息 */
  groupedItems: Record<string, MessageItem[]>
}

/**
 * useMessage 组合式函数
 * @param config - 初始配置
 * @returns Message API
 * @example
 * ```ts
 * const message = useMessage()
 *
 * // 显示成功消息
 * message.success('保存成功')
 *
 * // 显示错误消息
 * message.error('保存失败')
 * ```
 */
export function useMessage(config?: MessageManagerConfig): UseMessageReturn {
  const manager = getMessageManager()

  // 如果提供了配置，更新管理器配置
  if (config) {
    manager.configure(config)
  }

  // 响应式状态
  const state = reactive<MessageState>({
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
  const unsubClear = manager.on('clear', syncState)

  // 组件卸载时取消订阅
  onUnmounted(() => {
    unsubShow()
    unsubClose()
    unsubClear()
  })

  // 初始同步
  syncState()

  /**
   * 按位置分组的消息
   */
  const groupedItems = computed(() => {
    const groups: Record<string, MessageItem[]> = {}
    state.items.forEach((item) => {
      if (!groups[item.position]) {
        groups[item.position] = []
      }
      groups[item.position].push(item)
    })
    return groups
  })

  return {
    state: readonly(state) as Readonly<MessageState>,
    show: (cfg: MessageConfig) => manager.show(cfg),
    success: (content: ContentType, cfg?: MessageShortcutConfig) => manager.success(content, cfg),
    error: (content: ContentType, cfg?: MessageShortcutConfig) => manager.error(content, cfg),
    warning: (content: ContentType, cfg?: MessageShortcutConfig) => manager.warning(content, cfg),
    info: (content: ContentType, cfg?: MessageShortcutConfig) => manager.info(content, cfg),
    loading: (content: ContentType, cfg?: MessageShortcutConfig) => manager.loading(content, cfg),
    close: (id: string) => manager.close(id),
    closeAll: () => manager.closeAll(),
    config: (cfg: MessageManagerConfig) => manager.configure(cfg),
    groupedItems: groupedItems.value,
  }
}

/**
 * 创建独立的 Message 实例
 * @param config - 初始配置
 * @returns Message 管理器
 */
export function createMessage(config?: MessageManagerConfig): MessageManager {
  return new MessageManager(config)
}

/**
 * 全局 Message API（便捷方法）
 */
export const message = {
  show: (config: MessageConfig) => getMessageManager().show(config),
  success: (content: ContentType, config?: MessageShortcutConfig) => getMessageManager().success(content, config),
  error: (content: ContentType, config?: MessageShortcutConfig) => getMessageManager().error(content, config),
  warning: (content: ContentType, config?: MessageShortcutConfig) => getMessageManager().warning(content, config),
  info: (content: ContentType, config?: MessageShortcutConfig) => getMessageManager().info(content, config),
  loading: (content: ContentType, config?: MessageShortcutConfig) => getMessageManager().loading(content, config),
  close: (id: string) => getMessageManager().close(id),
  closeAll: () => getMessageManager().closeAll(),
}

