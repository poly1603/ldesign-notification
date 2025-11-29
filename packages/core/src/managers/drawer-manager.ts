/**
 * Drawer 管理器
 * @description 管理 Drawer 抽屉组件的核心类
 */

import type { DrawerConfig, DrawerItem } from '../types'
import { DEFAULT_DRAWER_CONFIG } from '../types/drawer'
import { isBrowser, lockBodyScroll } from '../utils/dom'
import { EventEmitter } from '../utils/event-emitter'
import { generateId } from '../utils/id'

/**
 * Drawer 事件类型
 */
export interface DrawerEvents {
  open: [item: DrawerItem]
  close: [id: string]
  update: [item: DrawerItem]
  clear: []
}

/** 当前 z-index */
let currentZIndex = 1000

/**
 * Drawer 管理器类
 */
export class DrawerManager extends EventEmitter<DrawerEvents> {
  /** Drawer 列表 */
  private _items: Map<string, DrawerItem> = new Map()

  /** 滚动锁定解锁函数 */
  private _unlockScroll: (() => void) | null = null

  /** Drawer 栈 */
  private _stack: string[] = []

  /**
   * 获取所有 Drawer
   */
  get items(): DrawerItem[] {
    return Array.from(this._items.values())
  }

  /**
   * 获取当前最顶层 Drawer
   */
  get topDrawer(): DrawerItem | undefined {
    const topId = this._stack[this._stack.length - 1]
    return topId ? this._items.get(topId) : undefined
  }

  /**
   * 打开 Drawer
   * @param config - Drawer 配置
   * @returns Drawer ID
   */
  async open(config: DrawerConfig): Promise<string> {
    const id = config.id || generateId('drawer')

    // 执行打开前回调
    if (config.beforeOpen) {
      const canOpen = await config.beforeOpen()
      if (!canOpen)
        return ''
    }

    const zIndex = config.zIndex ?? ++currentZIndex

    const mergedConfig: DrawerConfig = {
      ...DEFAULT_DRAWER_CONFIG,
      ...config,
    }

    const item: DrawerItem = {
      id,
      config: mergedConfig,
      visible: false,
      opening: true,
      closing: false,
      opened: false,
      zIndex,
      createdAt: Date.now(),
      close: () => this.close(id),
    }

    this._items.set(id, item)
    this._stack.push(id)

    // 锁定滚动
    if (mergedConfig.lockScroll !== false && isBrowser && !this._unlockScroll) {
      this._unlockScroll = lockBodyScroll()
    }

    // 先发出事件，让 Vue 组件先渲染 visible: false 的状态
    this.emit('open', item)

    // 然后在下一帧触发打开动画
    setTimeout(() => {
      item.visible = true
      item.opening = false
      item.opened = true
      mergedConfig.onOpen?.()
      this.emit('update', item)
    }, 16) // 使用 16ms 确保 Vue 有时间渲染初始状态

    return id
  }

  /**
   * 关闭 Drawer
   */
  async close(id: string): Promise<void> {
    const item = this._items.get(id)
    if (!item || item.closing)
      return

    // 执行关闭前回调
    if (item.config.beforeClose) {
      const canClose = await item.config.beforeClose()
      if (!canClose)
        return
    }

    item.closing = true
    item.visible = false

    // 立即发射 update 事件，触发关闭动画
    this.emit('update', item)

    // 等待动画完成后再删除
    setTimeout(() => {
      item.config.onClose?.()
      this._items.delete(id)
      this._stack = this._stack.filter(stackId => stackId !== id)

      // 如果没有更多 Drawer，解锁滚动
      if (this._stack.length === 0 && this._unlockScroll) {
        this._unlockScroll()
        this._unlockScroll = null
      }

      this.emit('close', id)
    }, 350) // 与 CSS 动画时间一致
  }

  /**
   * 关闭所有 Drawer
   */
  closeAll(): void {
    this._items.forEach((_, id) => this.close(id))
    this.emit('clear')
  }

  /**
   * 更新 Drawer 配置
   */
  update(id: string, config: Partial<DrawerConfig>): void {
    const item = this._items.get(id)
    if (!item)
      return

    Object.assign(item.config, config)
    this.emit('update', item)
  }

  /**
   * 处理 ESC 键
   */
  handleEscape(): void {
    const topDrawer = this.topDrawer
    if (topDrawer && topDrawer.config.keyboard !== false) {
      this.close(topDrawer.id)
    }
  }
}

