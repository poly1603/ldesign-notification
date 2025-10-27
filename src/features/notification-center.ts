/**
 * 通知中心 UI
 * 
 * @description
 * 侧边栏通知中心，提供：
 * - 历史通知展示
 * - 搜索和过滤
 * - 批量操作（全部已读、清空）
 * - 分组展示（今天、昨天、更早）
 * - 虚拟滚动支持
 * 
 * @example
 * ```ts
 * const center = new NotificationCenter(manager, {
 *   position: 'right',
 *   width: 400
 * })
 * 
 * center.open()
 * center.close()
 * ```
 */

import type { NotificationManager } from '../core/manager'
import type { NotificationItem } from '../types'
import { VirtualScroller } from '../core/virtual-scroller'
import { historyManager } from './history'

/**
 * 通知中心配置接口
 */
export interface NotificationCenterConfig {
  /** 位置（left/right） */
  position?: 'left' | 'right'
  /** 宽度（像素） */
  width?: number
  /** 是否启用虚拟滚动 */
  enableVirtualScroll?: boolean
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 是否显示过滤器 */
  showFilters?: boolean
  /** 最大历史记录数 */
  maxHistory?: number
}

/**
 * 过滤选项接口
 */
export interface FilterOptions {
  /** 通知类型 */
  type?: NotificationItem['type'][]
  /** 通知变体 */
  variant?: NotificationItem['variant'][]
  /** 是否只显示未读 */
  unreadOnly?: boolean
  /** 日期范围 */
  dateRange?: {
    start: Date
    end: Date
  }
}

/**
 * 通知分组
 */
interface NotificationGroup {
  /** 分组标题 */
  title: string
  /** 分组通知 */
  items: NotificationItem[]
  /** 是否展开 */
  expanded: boolean
}

/**
 * 通知中心类
 * 
 * @class NotificationCenter
 * @description 提供完整的通知中心 UI 和功能
 */
export class NotificationCenter {
  /** 通知管理器引用 */
  private manager: NotificationManager

  /** 配置 */
  private config: Required<NotificationCenterConfig>

  /** 容器元素 */
  private container: HTMLElement | null = null

  /** 遮罩层元素 */
  private overlay: HTMLElement | null = null

  /** 虚拟滚动器 */
  private virtualScroller: VirtualScroller | null = null

  /** 是否打开 */
  private isOpen = false

  /** 搜索关键词 */
  private searchKeyword = ''

  /** 过滤选项 */
  private filters: FilterOptions = {}

  /** 历史通知列表 */
  private historyItems: NotificationItem[] = []

  /**
   * 构造函数
   * 
   * @param manager - 通知管理器实例
   * @param config - 通知中心配置
   */
  constructor(manager: NotificationManager, config?: NotificationCenterConfig) {
    this.manager = manager
    this.config = {
      position: config?.position || 'right',
      width: config?.width || 400,
      enableVirtualScroll: config?.enableVirtualScroll !== undefined ? config.enableVirtualScroll : true,
      showSearch: config?.showSearch !== undefined ? config.showSearch : true,
      showFilters: config?.showFilters !== undefined ? config.showFilters : true,
      maxHistory: config?.maxHistory || 100,
    }
  }

  /**
   * 打开通知中心
   * 
   * @description
   * 显示通知中心侧边栏
   */
  async open(): Promise<void> {
    if (this.isOpen) {
      return
    }

    try {
      // 创建 UI
      this.createUI()

      // 加载历史记录
      await this.loadHistory()

      // 渲染通知列表
      this.renderNotifications()

      // 显示容器
      this.show()

      this.isOpen = true
    }
    catch (error) {
      console.error('[NotificationCenter] Open failed:', error)
    }
  }

  /**
   * 关闭通知中心
   * 
   * @description
   * 隐藏通知中心侧边栏
   */
  close(): void {
    if (!this.isOpen) {
      return
    }

    try {
      this.hide()
      this.isOpen = false
    }
    catch (error) {
      console.error('[NotificationCenter] Close failed:', error)
    }
  }

  /**
   * 切换打开/关闭状态
   * 
   * @returns 当前是否打开
   */
  async toggle(): Promise<boolean> {
    if (this.isOpen) {
      this.close()
      return false
    }
    else {
      await this.open()
      return true
    }
  }

  /**
   * 创建 UI
   * 
   * @private
   */
  private createUI(): void {
    // 创建遮罩层
    this.overlay = document.createElement('div')
    this.overlay.className = 'ldesign-notification-center-overlay'
    this.overlay.onclick = () => this.close()

    // 创建容器
    this.container = document.createElement('div')
    this.container.className = `ldesign-notification-center ldesign-notification-center--${this.config.position}`
    this.container.style.width = `${this.config.width}px`

    // 创建头部
    const header = this.createHeader()
    this.container.appendChild(header)

    // 创建搜索栏（可选）
    if (this.config.showSearch) {
      const search = this.createSearch()
      this.container.appendChild(search)
    }

    // 创建过滤器（可选）
    if (this.config.showFilters) {
      const filters = this.createFilters()
      this.container.appendChild(filters)
    }

    // 创建通知列表容器
    const listContainer = document.createElement('div')
    listContainer.className = 'ldesign-notification-center-list'
    this.container.appendChild(listContainer)

    // 如果启用虚拟滚动
    if (this.config.enableVirtualScroll) {
      this.virtualScroller = new VirtualScroller(listContainer, {
        threshold: 10,
        bufferSize: 5,
      })
    }

    // 创建底部操作栏
    const footer = this.createFooter()
    this.container.appendChild(footer)

    // 添加到 DOM
    document.body.appendChild(this.overlay)
    document.body.appendChild(this.container)
  }

  /**
   * 创建头部
   * 
   * @private
   * @returns 头部元素
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div')
    header.className = 'ldesign-notification-center-header'
    header.innerHTML = `
      <h3 class="ldesign-notification-center-title">通知中心</h3>
      <button class="ldesign-notification-center-close" aria-label="关闭">×</button>
    `

    // 绑定关闭按钮
    const closeBtn = header.querySelector('.ldesign-notification-center-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close())
    }

    return header
  }

  /**
   * 创建搜索栏
   * 
   * @private
   * @returns 搜索栏元素
   */
  private createSearch(): HTMLElement {
    const search = document.createElement('div')
    search.className = 'ldesign-notification-center-search'
    search.innerHTML = `
      <input 
        type="text" 
        class="ldesign-notification-center-search-input"
        placeholder="搜索通知..."
        aria-label="搜索通知"
      />
    `

    // 绑定搜索事件
    const input = search.querySelector('input')
    if (input) {
      input.addEventListener('input', (e) => {
        this.searchKeyword = (e.target as HTMLInputElement).value
        this.renderNotifications()
      })
    }

    return search
  }

  /**
   * 创建过滤器
   * 
   * @private
   * @returns 过滤器元素
   */
  private createFilters(): HTMLElement {
    const filters = document.createElement('div')
    filters.className = 'ldesign-notification-center-filters'
    filters.innerHTML = `
      <div class="ldesign-notification-center-filter-group">
        <button class="ldesign-filter-btn active" data-filter="all">全部</button>
        <button class="ldesign-filter-btn" data-filter="unread">未读</button>
        <button class="ldesign-filter-btn" data-filter="toast">Toast</button>
        <button class="ldesign-filter-btn" data-filter="message">Message</button>
        <button class="ldesign-filter-btn" data-filter="notification">Notification</button>
      </div>
    `

    // 绑定过滤按钮
    const buttons = filters.querySelectorAll('.ldesign-filter-btn')
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const filter = target.getAttribute('data-filter')

        // 更新激活状态
        buttons.forEach(b => b.classList.remove('active'))
        target.classList.add('active')

        // 应用过滤
        this.applyFilter(filter || 'all')
      })
    })

    return filters
  }

  /**
   * 创建底部操作栏
   * 
   * @private
   * @returns 底部元素
   */
  private createFooter(): HTMLElement {
    const footer = document.createElement('div')
    footer.className = 'ldesign-notification-center-footer'
    footer.innerHTML = `
      <button class="ldesign-btn ldesign-btn-text" data-action="mark-all-read">
        <span>全部已读</span>
      </button>
      <button class="ldesign-btn ldesign-btn-text" data-action="clear">
        <span>清空</span>
      </button>
    `

    // 绑定操作按钮
    const markAllReadBtn = footer.querySelector('[data-action="mark-all-read"]')
    const clearBtn = footer.querySelector('[data-action="clear"]')

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => this.markAllRead())
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAll())
    }

    return footer
  }

  /**
   * 加载历史记录
   * 
   * @private
   */
  private async loadHistory(): Promise<void> {
    try {
      // 从历史管理器加载
      const history = await historyManager.getAll()

      // 合并当前通知和历史通知
      const current = this.manager.getAll()

      // 去重并按时间排序
      const combined = [...current, ...history]
      const uniqueMap = new Map<string, NotificationItem>()

      for (const item of combined) {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item)
        }
      }

      this.historyItems = Array.from(uniqueMap.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, this.config.maxHistory)
    }
    catch (error) {
      console.error('[NotificationCenter] Load history failed:', error)
      this.historyItems = this.manager.getAll()
    }
  }

  /**
   * 渲染通知列表
   * 
   * @private
   */
  private renderNotifications(): void {
    if (!this.container) {
      return
    }

    try {
      const listContainer = this.container.querySelector('.ldesign-notification-center-list')
      if (!listContainer) {
        return
      }

      // 过滤通知
      const filtered = this.filterNotifications()

      // 分组通知
      const groups = this.groupNotifications(filtered)

      // 清空容器
      listContainer.innerHTML = ''

      // 如果没有通知
      if (filtered.length === 0) {
        const empty = this.createEmptyState()
        listContainer.appendChild(empty)
        return
      }

      // 渲染分组
      for (const group of groups) {
        const groupElement = this.createGroup(group)
        listContainer.appendChild(groupElement)
      }

      // 如果启用虚拟滚动
      if (this.virtualScroller && filtered.length >= 10) {
        this.virtualScroller.setItems(filtered)
      }
    }
    catch (error) {
      console.error('[NotificationCenter] Render notifications failed:', error)
    }
  }

  /**
   * 过滤通知
   * 
   * @private
   * @returns 过滤后的通知列表
   */
  private filterNotifications(): NotificationItem[] {
    let result = [...this.historyItems]

    // 搜索关键词过滤
    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase()
      result = result.filter(item =>
        item.message.toLowerCase().includes(keyword) ||
        item.title?.toLowerCase().includes(keyword)
      )
    }

    // 应用过滤器
    if (this.filters.type && this.filters.type.length > 0) {
      result = result.filter(item => this.filters.type!.includes(item.type))
    }

    if (this.filters.variant && this.filters.variant.length > 0) {
      result = result.filter(item => this.filters.variant!.includes(item.variant))
    }

    if (this.filters.unreadOnly) {
      result = result.filter(item => !item.read)
    }

    if (this.filters.dateRange) {
      result = result.filter(item =>
        item.createdAt >= this.filters.dateRange!.start.getTime() &&
        item.createdAt <= this.filters.dateRange!.end.getTime()
      )
    }

    return result
  }

  /**
   * 分组通知
   * 
   * @private
   * @param items - 通知列表
   * @returns 分组后的通知
   */
  private groupNotifications(items: NotificationItem[]): NotificationGroup[] {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const groups: NotificationGroup[] = [
      { title: '今天', items: [], expanded: true },
      { title: '昨天', items: [], expanded: true },
      { title: '更早', items: [], expanded: false },
    ]

    for (const item of items) {
      const itemDate = new Date(item.createdAt)

      if (itemDate >= today) {
        groups[0].items.push(item)
      }
      else if (itemDate >= yesterday) {
        groups[1].items.push(item)
      }
      else {
        groups[2].items.push(item)
      }
    }

    // 移除空分组
    return groups.filter(group => group.items.length > 0)
  }

  /**
   * 创建分组元素
   * 
   * @private
   * @param group - 通知分组
   * @returns 分组元素
   */
  private createGroup(group: NotificationGroup): HTMLElement {
    const groupElement = document.createElement('div')
    groupElement.className = 'ldesign-notification-group'

    // 创建分组标题
    const title = document.createElement('div')
    title.className = 'ldesign-notification-group-title'
    title.innerHTML = `
      <h4>${group.title} (${group.items.length})</h4>
      <button class="ldesign-toggle-btn" aria-label="${group.expanded ? '收起' : '展开'}">
        ${group.expanded ? '▼' : '▶'}
      </button>
    `

    // 绑定展开/收起
    const toggleBtn = title.querySelector('.ldesign-toggle-btn')
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        group.expanded = !group.expanded
        content.style.display = group.expanded ? 'block' : 'none'
        toggleBtn.textContent = group.expanded ? '▼' : '▶'
      })
    }

    groupElement.appendChild(title)

    // 创建分组内容
    const content = document.createElement('div')
    content.className = 'ldesign-notification-group-content'
    content.style.display = group.expanded ? 'block' : 'none'

    for (const item of group.items) {
      const itemElement = this.createNotificationItem(item)
      content.appendChild(itemElement)
    }

    groupElement.appendChild(content)

    return groupElement
  }

  /**
   * 创建通知项元素
   * 
   * @private
   * @param item - 通知项
   * @returns 通知元素
   */
  private createNotificationItem(item: NotificationItem): HTMLElement {
    const element = document.createElement('div')
    element.className = `ldesign-notification-center-item ldesign-notification-center-item--${item.variant}`
    element.setAttribute('data-id', item.id)

    if (!item.read) {
      element.classList.add('unread')
    }

    // 时间格式化
    const timeStr = this.formatTime(item.createdAt)

    element.innerHTML = `
      <div class="ldesign-notification-center-item-content">
        <div class="ldesign-notification-center-item-header">
          <span class="ldesign-notification-center-item-type">${item.type}</span>
          <span class="ldesign-notification-center-item-time">${timeStr}</span>
        </div>
        ${item.title ? `<div class="ldesign-notification-center-item-title">${item.title}</div>` : ''}
        <div class="ldesign-notification-center-item-message">${item.message}</div>
      </div>
      <div class="ldesign-notification-center-item-actions">
        <button class="ldesign-icon-btn" data-action="delete" aria-label="删除">🗑️</button>
      </div>
    `

    // 绑定事件
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const action = target.getAttribute('data-action')

      if (action === 'delete') {
        e.stopPropagation()
        this.deleteNotification(item.id)
      }
      else {
        this.markAsRead(item.id)
        if (item.onClick) {
          item.onClick(item.id)
        }
      }
    })

    return element
  }

  /**
   * 创建空状态
   * 
   * @private
   * @returns 空状态元素
   */
  private createEmptyState(): HTMLElement {
    const empty = document.createElement('div')
    empty.className = 'ldesign-notification-center-empty'
    empty.innerHTML = `
      <div class="ldesign-empty-icon">📭</div>
      <div class="ldesign-empty-text">暂无通知</div>
    `
    return empty
  }

  /**
   * 格式化时间
   * 
   * @private
   * @param timestamp - 时间戳
   * @returns 格式化的时间字符串
   */
  private formatTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp

    // 少于 1 分钟
    if (diff < 60 * 1000) {
      return '刚刚'
    }

    // 少于 1 小时
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} 分钟前`
    }

    // 少于 24 小时
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      return `${hours} 小时前`
    }

    // 显示具体日期
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  /**
   * 应用过滤
   * 
   * @private
   * @param filter - 过滤类型
   */
  private applyFilter(filter: string): void {
    this.filters = {}

    switch (filter) {
      case 'unread':
        this.filters.unreadOnly = true
        break
      case 'toast':
        this.filters.type = ['toast']
        break
      case 'message':
        this.filters.type = ['message']
        break
      case 'notification':
        this.filters.type = ['notification']
        break
      case 'all':
      default:
        // 不过滤
        break
    }

    this.renderNotifications()
  }

  /**
   * 标记为已读
   * 
   * @private
   * @param id - 通知 ID
   */
  private markAsRead(id: string): void {
    const item = this.historyItems.find(i => i.id === id)
    if (item && !item.read) {
      item.read = true
      historyManager.update(id, { read: true })
      this.renderNotifications()
    }
  }

  /**
   * 全部已读
   * 
   * @private
   */
  private markAllRead(): void {
    for (const item of this.historyItems) {
      if (!item.read) {
        item.read = true
        historyManager.update(item.id, { read: true })
      }
    }
    this.renderNotifications()
  }

  /**
   * 删除通知
   * 
   * @private
   * @param id - 通知 ID
   */
  private deleteNotification(id: string): void {
    const index = this.historyItems.findIndex(i => i.id === id)
    if (index !== -1) {
      this.historyItems.splice(index, 1)
      historyManager.remove(id)
      this.renderNotifications()
    }
  }

  /**
   * 清空所有通知
   * 
   * @private
   */
  private clearAll(): void {
    if (confirm('确定要清空所有通知吗？')) {
      this.historyItems = []
      historyManager.clear()
      this.renderNotifications()
    }
  }

  /**
   * 显示
   * 
   * @private
   */
  private show(): void {
    if (this.overlay && this.container) {
      requestAnimationFrame(() => {
        this.overlay!.classList.add('visible')
        this.container!.classList.add('visible')
      })
    }
  }

  /**
   * 隐藏
   * 
   * @private
   */
  private hide(): void {
    if (this.overlay && this.container) {
      this.overlay.classList.remove('visible')
      this.container.classList.remove('visible')

      // 动画完成后清理
      setTimeout(() => {
        if (!this.isOpen) {
          this.cleanup()
        }
      }, 300)
    }
  }

  /**
   * 清理 UI
   * 
   * @private
   */
  private cleanup(): void {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }

    if (this.container) {
      this.container.remove()
      this.container = null
    }

    if (this.virtualScroller) {
      this.virtualScroller.destroy()
      this.virtualScroller = null
    }
  }

  /**
   * 销毁通知中心
   * 
   * @description
   * 清理所有资源
   */
  destroy(): void {
    this.close()
    this.cleanup()
    this.historyItems = []
  }
}


