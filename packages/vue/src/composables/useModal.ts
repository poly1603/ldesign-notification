/**
 * useModal Composable
 * @description Vue 3 Modal 组合式函数
 */

import { onMounted, onUnmounted, reactive, readonly } from 'vue'
import type {
  AlertConfig,
  ConfirmConfig,
  ModalConfig,
  ModalItem,
  PromptConfig,
} from '@ldesign/notification-core'
import { ModalManager } from '@ldesign/notification-core'

/** 全局 Modal 管理器实例 */
let globalModalManager: ModalManager | null = null

/**
 * 获取全局 Modal 管理器
 * @returns 全局 Modal 管理器实例
 */
export function getGlobalModalManager(): ModalManager {
  if (!globalModalManager) {
    globalModalManager = new ModalManager()
  }
  return globalModalManager
}

/**
 * 获取全局 Modal 管理器（内部使用）
 * @deprecated 请使用 getGlobalModalManager
 */
function getModalManager(): ModalManager {
  return getGlobalModalManager()
}

/**
 * Modal 状态
 */
interface ModalState {
  /** Modal 列表 */
  items: ModalItem[]
  /** 当前最顶层 Modal */
  topModal: ModalItem | undefined
}

/**
 * useModal 返回类型
 */
export interface UseModalReturn {
  /** Modal 状态 */
  state: Readonly<ModalState>
  /** 打开模态框 */
  open: (config: ModalConfig) => Promise<string>
  /** 关闭模态框 */
  close: (id: string) => Promise<void>
  /** 关闭所有模态框 */
  closeAll: () => void
  /** 确认对话框 */
  confirm: (config: ConfirmConfig) => Promise<boolean>
  /** 警告对话框 */
  alert: (config: AlertConfig) => Promise<void>
  /** 输入对话框 */
  prompt: (config: PromptConfig) => Promise<string | null>
  /** 信息确认框 */
  info: (config: Omit<ConfirmConfig, 'type'>) => Promise<boolean>
  /** 成功确认框 */
  success: (config: Omit<ConfirmConfig, 'type'>) => Promise<boolean>
  /** 错误确认框 */
  error: (config: Omit<ConfirmConfig, 'type'>) => Promise<boolean>
  /** 警告确认框 */
  warning: (config: Omit<ConfirmConfig, 'type'>) => Promise<boolean>
  /** 更新模态框配置 */
  update: (id: string, config: Partial<ModalConfig>) => void
  /** 设置加载状态 */
  setLoading: (id: string, loading: boolean) => void
}

/**
 * useModal 组合式函数
 * @returns Modal API
 * @example
 * ```ts
 * const modal = useModal()
 *
 * // 确认对话框
 * const confirmed = await modal.confirm({
 *   title: '确认删除',
 *   content: '确定要删除这条记录吗？',
 * })
 *
 * // 警告对话框
 * await modal.alert({
 *   title: '提示',
 *   content: '操作已完成',
 * })
 *
 * // 输入对话框
 * const value = await modal.prompt({
 *   title: '请输入',
 *   placeholder: '请输入内容',
 * })
 * ```
 */
export function useModal(): UseModalReturn {
  const manager = getModalManager()

  // 响应式状态
  const state = reactive<ModalState>({
    items: [],
    topModal: undefined,
  })

  /**
   * 同步状态
   */
  const syncState = (): void => {
    state.items = [...manager.items]
    state.topModal = manager.topModal
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
    state: readonly(state) as Readonly<ModalState>,
    open: (config: ModalConfig) => manager.open(config),
    close: (id: string) => manager.close(id),
    closeAll: () => manager.closeAll(),
    confirm: (config: ConfirmConfig) => manager.confirm(config),
    alert: (config: AlertConfig) => manager.alert(config),
    prompt: (config: PromptConfig) => manager.prompt(config),
    info: (config: Omit<ConfirmConfig, 'type'>) => manager.info(config),
    success: (config: Omit<ConfirmConfig, 'type'>) => manager.success(config),
    error: (config: Omit<ConfirmConfig, 'type'>) => manager.error(config),
    warning: (config: Omit<ConfirmConfig, 'type'>) => manager.warning(config),
    update: (id: string, config: Partial<ModalConfig>) => manager.update(id, config),
    setLoading: (id: string, loading: boolean) => manager.setLoading(id, loading),
  }
}

/**
 * 创建独立的 Modal 实例
 */
export function createModal(): ModalManager {
  return new ModalManager()
}

/**
 * 全局 Modal API（便捷方法）
 */
export const modal = {
  open: (config: ModalConfig) => getModalManager().open(config),
  close: (id: string) => getModalManager().close(id),
  closeAll: () => getModalManager().closeAll(),
  confirm: (config: ConfirmConfig) => getModalManager().confirm(config),
  alert: (config: AlertConfig) => getModalManager().alert(config),
  prompt: (config: PromptConfig) => getModalManager().prompt(config),
  info: (config: Omit<ConfirmConfig, 'type'>) => getModalManager().info(config),
  success: (config: Omit<ConfirmConfig, 'type'>) => getModalManager().success(config),
  error: (config: Omit<ConfirmConfig, 'type'>) => getModalManager().error(config),
  warning: (config: Omit<ConfirmConfig, 'type'>) => getModalManager().warning(config),
}

