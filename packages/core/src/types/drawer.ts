/**
 * Drawer 类型定义
 * @description 抽屉组件的类型定义
 */

import type { ContentType, DrawerPlacement, IconType } from './common'

/**
 * Drawer 配置
 */
export interface DrawerConfig {
  /** 唯一标识 */
  id?: string
  /** 抽屉标题 */
  title?: ContentType
  /** 抽屉内容 */
  content?: ContentType
  /** 底部内容 */
  footer?: ContentType | null
  /** 弹出方向 */
  placement?: DrawerPlacement
  /** 宽度（左右方向时有效） */
  width?: number | string
  /** 高度（上下方向时有效） */
  height?: number | string
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: Record<string, string | number>
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
  /** 层级 */
  zIndex?: number
  /** 是否显示头部 */
  showHeader?: boolean
  /** 打开前回调 */
  beforeOpen?: () => boolean | Promise<boolean>
  /** 打开后回调 */
  onOpen?: () => void
  /** 关闭前回调 */
  beforeClose?: () => boolean | Promise<boolean>
  /** 关闭后回调 */
  onClose?: () => void
  /** 是否销毁子组件 */
  destroyOnClose?: boolean
  /** 自定义头部 */
  header?: ContentType | null
}

/**
 * Drawer 状态
 */
export interface DrawerState {
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
}

/**
 * Drawer 项
 */
export interface DrawerItem extends DrawerState {
  /** 唯一标识 */
  id: string
  /** 配置 */
  config: DrawerConfig
  /** 创建时间 */
  createdAt: number
  /** 关闭函数 */
  close: () => void
}

/**
 * Drawer API
 */
export interface DrawerAPI {
  /** 打开抽屉 */
  open: (config: DrawerConfig) => string
  /** 关闭抽屉 */
  close: (id: string) => void
  /** 关闭所有抽屉 */
  closeAll: () => void
  /** 更新抽屉配置 */
  update: (id: string, config: Partial<DrawerConfig>) => void
  /** 获取所有抽屉 */
  getAll: () => DrawerItem[]
}

/**
 * 默认 Drawer 配置
 */
export const DEFAULT_DRAWER_CONFIG = {
  placement: 'right' as DrawerPlacement,
  width: 378,
  height: 378,
  className: '',
  mask: true,
  maskClosable: true,
  keyboard: true,
  closable: true,
  lockScroll: true,
  zIndex: 1000,
  showHeader: true,
  destroyOnClose: false,
} as const

/**
 * 获取抽屉尺寸样式
 * @param placement - 抽屉方向
 * @param size - 尺寸值
 */
export function getDrawerSizeStyle(
  placement: DrawerPlacement,
  size: number | string,
): Record<string, string> {
  const sizeValue = typeof size === 'number' ? `${size}px` : size

  if (placement === 'left' || placement === 'right') {
    return { width: sizeValue }
  }
  return { height: sizeValue }
}

/**
 * 获取抽屉动画变换值
 * @param placement - 抽屉方向
 */
export function getDrawerTransform(placement: DrawerPlacement): string {
  const transformMap: Record<DrawerPlacement, string> = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)',
  }
  return transformMap[placement]
}

