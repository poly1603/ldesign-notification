/**
 * 通知系统常量定义
 * 
 * @description
 * 集中管理所有硬编码的常量值，便于维护和配置
 */

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  /** 默认通知持续时间（毫秒） */
  DURATION: 3000,

  /** 默认动画持续时间（毫秒） */
  ANIMATION_DURATION: 300,

  /** 默认位置 */
  POSITION: 'top-right' as const,

  /** 默认偏移量（像素） */
  OFFSET: 16,

  /** 默认堆叠策略 */
  STACK_STRATEGY: 'stack' as const,

  /** 默认主题 */
  THEME: 'light' as const,

  /** 默认最大通知数量（0 表示无限制） */
  MAX_NOTIFICATIONS: 0,

  /** 默认优先级 */
  PRIORITY: 'normal' as const,
} as const

/**
 * 动画常量
 */
export const ANIMATION = {
  /** 默认缓动函数 */
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',

  /** 快速动画时长（毫秒） */
  DURATION_FAST: 150,

  /** 普通动画时长（毫秒） */
  DURATION_NORMAL: 300,

  /** 慢速动画时长（毫秒） */
  DURATION_SLOW: 500,

  /** 性能监控帧数限制 */
  FPS_SAMPLE_SIZE: 60,
} as const

/**
 * 节流/防抖常量
 */
export const THROTTLE = {
  /** 创建通知的节流时间（毫秒） */
  CREATE_NOTIFICATION: 50,

  /** 滚动事件节流时间（毫秒） */
  SCROLL: 200,

  /** Resize 事件节流时间（毫秒） */
  RESIZE: 200,
} as const

/**
 * DOM 复用池常量
 */
export const DOM_POOL = {
  /** 每种类型最大缓存数量 */
  MAX_SIZE: 10,

  /** 缓存清理延迟（毫秒） */
  CLEANUP_DELAY: 5000,
} as const

/**
 * 虚拟滚动常量
 */
export const VIRTUAL_SCROLL = {
  /** 启用虚拟滚动的最小通知数 */
  MIN_ITEMS: 10,

  /** 缓冲区大小（上下各多渲染几个） */
  BUFFER_SIZE: 3,

  /** 默认项高度（像素） */
  ITEM_HEIGHT: 60,
} as const

/**
 * Z-index 常量
 */
export const Z_INDEX = {
  /** 通知容器 */
  NOTIFICATION: 9999,

  /** Alert 对话框 */
  ALERT: 10000,

  /** Alert 遮罩层 */
  ALERT_OVERLAY: 9999,
} as const

/**
 * CSS 类名前缀
 */
export const CSS_PREFIX = 'ldesign-notification'

/**
 * 事件名称常量
 */
export const EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DISMISSED: 'dismissed',
  DESTROYED: 'destroyed',
  QUEUE_CHANGED: 'queueChanged',
} as const

/**
 * 默认图标映射
 */
export const DEFAULT_ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  loading: '⟳',
  default: '',
} as const

/**
 * 堆叠策略配置
 */
export const STACK_CONFIG = {
  /** 折叠模式最大可见数量 */
  COLLAPSE_MAX_VISIBLE: 3,

  /** 重叠模式偏移量（像素） */
  OVERLAP_OFFSET: 10,

  /** 堆叠间距（像素） */
  STACK_GAP: 8,
} as const

/**
 * 手势识别常量
 */
export const GESTURE = {
  /** 滑动距离阈值（像素） */
  SWIPE_THRESHOLD: 100,

  /** 最小滑动距离（像素） */
  MIN_SWIPE_DISTANCE: 10,

  /** 滑动速度阈值（像素/毫秒） */
  SWIPE_VELOCITY: 0.3,
} as const

/**
 * 性能阈值
 */
export const PERFORMANCE = {
  /** 低帧率警告阈值 */
  LOW_FPS_THRESHOLD: 30,

  /** 内存警告阈值（MB） */
  MEMORY_WARNING: 50,

  /** 最大并发通知数（性能考虑） */
  MAX_CONCURRENT: 100,
} as const

/**
 * 调试选项
 */
export const DEBUG = {
  /** 是否启用调试日志 */
  ENABLED: false,

  /** 是否显示性能统计 */
  SHOW_STATS: false,

  /** 日志前缀 */
  LOG_PREFIX: '[NotificationManager]',
} as const

/**
 * 浏览器兼容性检测
 */
export const BROWSER_SUPPORT = {
  /** 是否支持 WAAPI */
  WAAPI: typeof window !== 'undefined' && 'animate' in HTMLElement.prototype,

  /** 是否支持 ResizeObserver */
  RESIZE_OBSERVER: typeof window !== 'undefined' && 'ResizeObserver' in window,

  /** 是否支持 IntersectionObserver */
  INTERSECTION_OBSERVER: typeof window !== 'undefined' && 'IntersectionObserver' in window,

  /** 是否支持 Notification API */
  NOTIFICATION_API: typeof window !== 'undefined' && 'Notification' in window,

  /** 是否支持 Service Worker */
  SERVICE_WORKER: typeof window !== 'undefined' && 'serviceWorker' in navigator,
} as const

/**
 * Toast 特定常量
 */
export const TOAST = {
  /** 最小宽度（像素） */
  MIN_WIDTH: 300,

  /** 最大宽度（像素） */
  MAX_WIDTH: 500,

  /** 默认 padding */
  PADDING: '12px 16px',
} as const

/**
 * Message 特定常量
 */
export const MESSAGE = {
  /** 默认 padding */
  PADDING: '8px 12px',

  /** 默认位置 */
  DEFAULT_POSITION: 'top' as const,
} as const

/**
 * Notification 特定常量
 */
export const NOTIFICATION = {
  /** 固定宽度（像素） */
  WIDTH: 384,

  /** 默认 padding */
  PADDING: '16px',

  /** 最大操作按钮数 */
  MAX_ACTIONS: 3,
} as const

/**
 * Alert 特定常量
 */
export const ALERT = {
  /** 固定宽度（像素） */
  WIDTH: 500,

  /** 默认 padding */
  PADDING: '24px',

  /** 遮罩层透明度 */
  OVERLAY_OPACITY: 0.45,
} as const

/**
 * 键盘快捷键
 */
export const KEYBOARD = {
  /** 关闭通知 */
  CLOSE: 'Escape',

  /** 确认 */
  CONFIRM: 'Enter',

  /** 取消 */
  CANCEL: 'Escape',

  /** 上一个 */
  PREVIOUS: 'ArrowUp',

  /** 下一个 */
  NEXT: 'ArrowDown',

  /** Tab */
  TAB: 'Tab',
} as const

/**
 * 可访问性（ARIA）常量
 */
export const ARIA = {
  /** 角色 */
  ROLE: 'alert',

  /** 实时区域 */
  LIVE: 'polite' as const,

  /** 原子性 */
  ATOMIC: 'true',

  /** 相关性 */
  RELEVANT: 'additions text',
} as const

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  /** 通知历史 */
  HISTORY: 'ldesign_notification_history',

  /** 用户偏好 */
  PREFERENCES: 'ldesign_notification_preferences',

  /** 勿扰模式状态 */
  DND_STATUS: 'ldesign_notification_dnd',
} as const

/**
 * 历史记录配置
 */
export const HISTORY = {
  /** 最大历史记录数 */
  MAX_SIZE: 100,

  /** 历史记录过期时间（毫秒，7天） */
  EXPIRY: 7 * 24 * 60 * 60 * 1000,
} as const

/**
 * 声音配置
 */
export const SOUND = {
  /** 默认音量 */
  DEFAULT_VOLUME: 0.5,

  /** 淡入时间（毫秒） */
  FADE_IN_DURATION: 200,

  /** 淡出时间（毫秒） */
  FADE_OUT_DURATION: 200,
} as const



