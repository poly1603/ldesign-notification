/**
 * Modal/Dialog 类型定义
 * @description 模态弹窗和对话框组件的类型定义
 */

import type { ContentType, IconType, NotificationType } from './common'

/**
 * Modal 配置
 */
export interface ModalConfig {
  /** 唯一标识 */
  id?: string
  /** 弹窗标题 */
  title?: ContentType
  /** 弹窗内容 */
  content?: ContentType
  /** 底部内容 */
  footer?: ContentType | null
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: Record<string, string | number>
  /** 弹窗宽度 */
  width?: number | string
  /** 是否显示遮罩 */
  mask?: boolean
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
  /** 按 ESC 是否关闭 */
  keyboard?: boolean
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 自定义关闭图标 */
  closeIcon?: IconType
  /** 是否锁定页面滚动 */
  lockScroll?: boolean
  /** 是否居中显示 */
  centered?: boolean
  /** 层级 */
  zIndex?: number
  /** 打开前回调 */
  beforeOpen?: () => boolean | Promise<boolean>
  /** 打开后回调 */
  onOpen?: () => void
  /** 关闭前回调 */
  beforeClose?: () => boolean | Promise<boolean>
  /** 关闭后回调 */
  onClose?: () => void
}

/**
 * Confirm 对话框配置
 */
export interface ConfirmConfig extends Omit<ModalConfig, 'footer'> {
  /** 对话框类型 */
  type?: NotificationType
  /** 是否显示图标 */
  showIcon?: boolean
  /** 自定义图标 */
  icon?: IconType
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮类型 */
  confirmType?: 'primary' | 'danger'
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 确认回调 */
  onConfirm?: () => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
}

/**
 * Alert 对话框配置
 */
export interface AlertConfig extends Omit<ConfirmConfig, 'showCancel' | 'cancelText' | 'onCancel'> {
  /** 按钮文本 */
  buttonText?: string
}

/**
 * Prompt 对话框配置
 */
export interface PromptConfig extends ConfirmConfig {
  /** 输入框占位符 */
  placeholder?: string
  /** 默认值 */
  defaultValue?: string
  /** 输入类型 */
  inputType?: 'text' | 'password' | 'textarea'
  /** 最大长度 */
  maxLength?: number
  /** 是否必填 */
  required?: boolean
  /** 验证函数 */
  validator?: (value: string) => boolean | string | Promise<boolean | string>
  /** 确认回调（带输入值） */
  onConfirm?: (value: string) => void | Promise<void>
}

/**
 * Modal 状态
 */
export interface ModalState {
  /** 是否可见 */
  visible: boolean
  /** 是否正在打开 */
  opening: boolean
  /** 是否正在关闭 */
  closing: boolean
  /** 是否已完全打开 */
  opened: boolean
  /** 当前层级 */
  zIndex: number
  /** 加载状态 */
  loading: boolean
}

/**
 * Modal 项
 */
export interface ModalItem extends ModalState {
  /** 唯一标识 */
  id: string
  /** 配置 */
  config: ModalConfig
  /** 创建时间 */
  createdAt: number
  /** 关闭函数 */
  close: () => void
}

/**
 * Modal API
 */
export interface ModalAPI {
  /** 打开模态框 */
  open: (config: ModalConfig) => string
  /** 关闭模态框 */
  close: (id: string) => void
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
  /** 获取所有模态框 */
  getAll: () => ModalItem[]
}

