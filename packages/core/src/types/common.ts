/**
 * 通用类型定义
 * @description 通知系统的公共类型定义
 * @module @ldesign/notification-core/types/common
 */

import {
  DRAWER_PLACEMENTS,
  NOTIFICATION_POSITIONS,
  NOTIFICATION_TYPES,
} from '../constants'

// ==================== 基础类型定义 ====================

/**
 * 通知类型
 * @description 支持的通知类型：成功、错误、警告、信息、加载中
 */
export type NotificationType = typeof NOTIFICATION_TYPES[number]

/**
 * 通知位置
 * @description 支持 7 种位置：顶部三个、底部三个、居中
 */
export type NotificationPosition = typeof NOTIFICATION_POSITIONS[number]

/**
 * 抽屉方向
 * @description 支持四个方向：上、右、下、左
 */
export type DrawerPlacement = typeof DRAWER_PLACEMENTS[number]

/**
 * 通知状态
 * @description 通知生命周期状态
 */
export type NotificationStatus = 'pending' | 'entering' | 'visible' | 'leaving' | 'removed'

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 按钮类型
 */
export type ButtonType = 'primary' | 'secondary' | 'text' | 'danger'

// ==================== 类型守卫 ====================

/**
 * 检查是否为有效的通知类型
 * @param value - 要检查的值
 * @returns 是否为有效的通知类型
 * @example
 * ```ts
 * if (isNotificationType(value)) {
 *   // value 被推断为 NotificationType
 * }
 * ```
 */
export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && NOTIFICATION_TYPES.includes(value as NotificationType)
}

/**
 * 检查是否为有效的通知位置
 * @param value - 要检查的值
 * @returns 是否为有效的通知位置
 */
export function isNotificationPosition(value: unknown): value is NotificationPosition {
  return typeof value === 'string' && NOTIFICATION_POSITIONS.includes(value as NotificationPosition)
}

/**
 * 检查是否为有效的抽屉方向
 * @param value - 要检查的值
 * @returns 是否为有效的抽屉方向
 */
export function isDrawerPlacement(value: unknown): value is DrawerPlacement {
  return typeof value === 'string' && DRAWER_PLACEMENTS.includes(value as DrawerPlacement)
}

/**
 * 检查是否为渲染函数
 * @param value - 要检查的值
 * @returns 是否为渲染函数
 */
export function isRenderFunction(value: unknown): value is RenderFunction {
  return typeof value === 'function'
}

/**
 * 检查是否为有效的通知状态
 * @param value - 要检查的值
 * @returns 是否为有效的通知状态
 */
export function isNotificationStatus(value: unknown): value is NotificationStatus {
  const statuses: NotificationStatus[] = ['pending', 'entering', 'visible', 'leaving', 'removed']
  return typeof value === 'string' && statuses.includes(value as NotificationStatus)
}

// ==================== 配置接口 ====================

/**
 * 动画配置
 * @description 控制通知进入和离开动画
 */
export interface AnimationConfig {
  /** 进入动画持续时间（毫秒） */
  readonly enterDuration?: number
  /** 离开动画持续时间（毫秒） */
  readonly leaveDuration?: number
  /** 动画缓动函数 */
  readonly easing?: string
}

/**
 * 必需的动画配置（内部使用）
 */
export interface RequiredAnimationConfig {
  readonly enterDuration: number
  readonly leaveDuration: number
  readonly easing: string
}

/**
 * 主题配置
 * @description 自定义通知系统的主题样式
 */
export interface ThemeConfig {
  /** 主题模式 */
  readonly mode?: ThemeMode
  /** 主色调 */
  readonly primaryColor?: string
  /** 成功色 */
  readonly successColor?: string
  /** 错误色 */
  readonly errorColor?: string
  /** 警告色 */
  readonly warningColor?: string
  /** 信息色 */
  readonly infoColor?: string
  /** 圆角大小 */
  readonly borderRadius?: string
  /** 阴影 */
  readonly boxShadow?: string
}

/**
 * 基础通知配置
 * @description 所有通知类型的通用配置选项
 */
export interface BaseNotificationConfig {
  /** 唯一标识（可选，自动生成） */
  readonly id?: string
  /** 通知类型 */
  readonly type?: NotificationType
  /** 持续时间（毫秒），0 表示不自动关闭 */
  readonly duration?: number
  /** 是否可关闭 */
  readonly closable?: boolean
  /** 自定义类名 */
  readonly className?: string
  /** 自定义样式 */
  readonly style?: Readonly<Record<string, string | number>>
  /** 动画配置 */
  readonly animation?: AnimationConfig
  /** 关闭前回调，返回 false 可阻止关闭 */
  readonly onBeforeClose?: () => boolean | Promise<boolean>
  /** 关闭回调 */
  readonly onClose?: () => void
  /** 点击回调 */
  readonly onClick?: () => void
}

/**
 * 基础通知项
 * @description 通知实例的完整数据结构
 */
export interface BaseNotificationItem extends Required<Omit<BaseNotificationConfig, 'onBeforeClose' | 'onClose' | 'onClick' | 'animation' | 'style'>> {
  /** 创建时间戳 */
  readonly createdAt: number
  /** 当前状态 */
  status: NotificationStatus
  /** 动画配置 */
  readonly animation: RequiredAnimationConfig
  /** 自定义样式 */
  readonly style: Readonly<Record<string, string | number>>
  /** 关闭前回调 */
  readonly onBeforeClose?: () => boolean | Promise<boolean>
  /** 关闭回调 */
  readonly onClose?: () => void
  /** 点击回调 */
  readonly onClick?: () => void
}

// ==================== 内容类型 ====================

/**
 * 渲染函数类型
 * @description 用于自定义渲染的函数
 */
export type RenderFunction<T = unknown> = () => T

/**
 * 内容类型
 * @description 支持字符串或渲染函数
 */
export type ContentType = string | RenderFunction

/**
 * 图标类型
 * @description 支持字符串（图标名/emoji）或渲染函数
 */
export type IconType = string | RenderFunction

// ==================== 按钮配置 ====================

/**
 * 按钮配置
 * @description 通知操作按钮的配置
 */
export interface ButtonConfig {
  /** 按钮文本 */
  readonly text: string
  /** 按钮类型 */
  readonly type?: ButtonType
  /** 点击回调 */
  readonly onClick?: () => void | Promise<void>
  /** 是否禁用 */
  readonly disabled?: boolean
  /** 是否加载中 */
  readonly loading?: boolean
}

// ==================== 事件系统 ====================

/**
 * 事件处理器类型
 */
export type EventHandler<T extends unknown[]> = (...args: T) => void

/**
 * 事件映射约束
 */
export type EventMap = Record<string, unknown[]>

/**
 * 事件发射器接口
 * @template T - 事件映射类型
 */
export interface IEventEmitter<T extends EventMap> {
  /**
   * 订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   * @returns 取消订阅函数
   */
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void

  /**
   * 订阅一次性事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void

  /**
   * 取消订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void

  /**
   * 发射事件
   * @param event - 事件名称
   * @param args - 事件参数
   */
  emit<K extends keyof T>(event: K, ...args: T[K]): void
}

/**
 * 通知事件类型
 * @description 通知管理器发出的事件
 */
export interface NotificationEvents {
  /** 显示通知 */
  show: [id: string]
  /** 关闭通知 */
  close: [id: string]
  /** 更新通知 */
  update: [id: string]
  /** 清空所有通知 */
  clear: []
}

// ==================== Promise API 类型 ====================

/**
 * Promise 通知消息配置
 * @template T - Promise 解析值类型
 */
export interface PromiseMessages<T = unknown> {
  /** 加载中消息 */
  readonly loading: ContentType
  /** 成功消息（可以是函数，接收 Promise 解析值） */
  readonly success: ContentType | ((data: T) => ContentType)
  /** 错误消息（可以是函数，接收错误对象） */
  readonly error: ContentType | ((error: unknown) => ContentType)
}

// ==================== 工具类型 ====================

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可选属性类型
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需属性类型
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 可空类型
 */
export type Nullable<T> = T | null

/**
 * 可能为空类型
 */
export type Maybe<T> = T | null | undefined

