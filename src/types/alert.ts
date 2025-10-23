/**
 * Alert 相关类型定义
 */

/**
 * Alert 图标类型
 */
export type AlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

/**
 * Alert 输入类型
 */
export type AlertInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea'

/**
 * Alert 按钮配置
 */
export interface AlertButton {
  /** 按钮文本 */
  text: string
  /** 按钮值 */
  value?: any
  /** 按钮类型 */
  type?: 'confirm' | 'cancel' | 'deny'
  /** 按钮样式类 */
  className?: string
  /** 是否可见 */
  visible?: boolean
}

/**
 * Alert 基础配置
 */
export interface AlertOptions {
  /** 标题 */
  title?: string
  /** 内容文本 */
  text?: string
  /** HTML 内容 */
  html?: string
  /** 图标类型 */
  icon?: AlertIcon
  /** 自定义图标 */
  iconHtml?: string
  /** 是否显示确认按钮 */
  showConfirmButton?: boolean
  /** 确认按钮文本 */
  confirmButtonText?: string
  /** 确认按钮颜色 */
  confirmButtonColor?: string
  /** 是否显示取消按钮 */
  showCancelButton?: boolean
  /** 取消按钮文本 */
  cancelButtonText?: string
  /** 取消按钮颜色 */
  cancelButtonColor?: string
  /** 是否显示拒绝按钮 */
  showDenyButton?: boolean
  /** 拒绝按钮文本 */
  denyButtonText?: string
  /** 拒绝按钮颜色 */
  denyButtonColor?: string
  /** 按钮反转 */
  reverseButtons?: boolean
  /** 点击背景是否关闭 */
  allowOutsideClick?: boolean
  /** 按 ESC 是否关闭 */
  allowEscapeKey?: boolean
  /** 自动关闭定时器（毫秒） */
  timer?: number
  /** 是否显示定时器进度条 */
  timerProgressBar?: boolean
  /** 自定义类名 */
  customClass?: string | Record<string, string>
  /** 宽度 */
  width?: string | number
  /** 内边距 */
  padding?: string | number
  /** 背景色 */
  background?: string
  /** 是否允许 HTML */
  allowHtml?: boolean
  /** 打开前回调 */
  willOpen?: () => void
  /** 打开后回调 */
  didOpen?: () => void
  /** 关闭前回调 */
  willClose?: () => void
  /** 关闭后回调 */
  didClose?: () => void
}

/**
 * Prompt 配置选项
 */
export interface PromptOptions extends AlertOptions {
  /** 输入框类型 */
  input?: AlertInputType
  /** 输入框占位符 */
  inputPlaceholder?: string
  /** 输入框默认值 */
  inputValue?: string
  /** 输入框属性 */
  inputAttributes?: Record<string, string>
  /** 输入框验证器 */
  inputValidator?: (value: string) => string | null | Promise<string | null>
  /** 验证消息 */
  validationMessage?: string
  /** 确认前回调 */
  preConfirm?: (value: any) => any | Promise<any>
}

/**
 * Alert 结果
 */
export interface AlertResult {
  /** 是否已确认 */
  isConfirmed: boolean
  /** 是否已取消 */
  isDismissed: boolean
  /** 是否已拒绝 */
  isDenied: boolean
  /** 返回值 */
  value?: any
  /** 关闭原因 */
  dismiss?: 'cancel' | 'backdrop' | 'close' | 'esc' | 'timer'
}

/**
 * Alert API 接口
 */
export interface AlertAPI {
  /** 显示警告框 */
  (messageOrOptions: string | AlertOptions): Promise<AlertResult>

  /** 确认对话框 */
  confirm: (message: string, options?: AlertOptions) => Promise<boolean>

  /** 输入对话框 */
  prompt: (message: string, options?: PromptOptions) => Promise<string | null>

  /** 自定义 Alert */
  custom: (options: AlertOptions) => Promise<AlertResult>

  /** 关闭当前 Alert */
  close: () => void
}



