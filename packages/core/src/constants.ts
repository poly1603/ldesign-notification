/**
 * 常量定义
 * @description 通知系统的所有魔法数字和常量配置
 * @module @ldesign/notification-core/constants
 */

// ==================== 动画时长 ====================

/** 快速动画时长（毫秒） */
export const ANIMATION_DURATION_FAST = 200

/** 标准动画时长（毫秒） */
export const ANIMATION_DURATION_NORMAL = 300

/** 慢速动画时长（毫秒） */
export const ANIMATION_DURATION_SLOW = 450

// ==================== Z-Index 层级 ====================

/** Toast 基础层级 */
export const Z_INDEX_TOAST = 9999

/** Message 基础层级 */
export const Z_INDEX_MESSAGE = 9998

/** Notification 基础层级 */
export const Z_INDEX_NOTIFICATION = 9997

/** Modal 基础层级 */
export const Z_INDEX_MODAL = 1000

/** Drawer 基础层级 */
export const Z_INDEX_DRAWER = 1000

// ==================== 默认配置 ====================

/** 默认显示时长（毫秒） */
export const DEFAULT_DURATION = 3000

/** 通知默认显示时长（毫秒） */
export const DEFAULT_NOTIFICATION_DURATION = 4500

/** 最大通知数量 */
export const DEFAULT_MAX_COUNT = 5

/** 默认间距（像素） */
export const DEFAULT_GAP = 16

/** 默认偏移量（像素） */
export const DEFAULT_OFFSET = 20

/** 通知默认偏移量（像素） */
export const DEFAULT_NOTIFICATION_OFFSET = 24

/** 默认通知宽度（像素） */
export const DEFAULT_NOTIFICATION_WIDTH = 320

/** 默认 Modal 宽度（像素） */
export const DEFAULT_MODAL_WIDTH = 520

/** 默认 Drawer 宽度（像素） */
export const DEFAULT_DRAWER_WIDTH = 378

// ==================== 尺寸限制 ====================

/** Modal 最小宽度（像素） */
export const MODAL_MIN_WIDTH = 300

/** Modal 最小高度（像素） */
export const MODAL_MIN_HEIGHT = 200

/** Drawer 最小宽度（像素） */
export const DRAWER_MIN_WIDTH = 200

/** Drawer 最小高度（像素） */
export const DRAWER_MIN_HEIGHT = 200

/** Drawer 最大宽度（像素） */
export const DRAWER_MAX_WIDTH = 800

/** Drawer 最大高度（像素） */
export const DRAWER_MAX_HEIGHT = 600

// ==================== 缓动函数 ====================

/** 标准缓动函数 */
export const EASING_STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)'

/** 减速缓动函数 */
export const EASING_DECELERATE = 'cubic-bezier(0.0, 0, 0.2, 1)'

/** 加速缓动函数 */
export const EASING_ACCELERATE = 'cubic-bezier(0.4, 0, 1, 1)'

/** 弹性缓动函数 */
export const EASING_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

/** 平滑缓动函数 */
export const EASING_SMOOTH = 'cubic-bezier(0.22, 1, 0.36, 1)'

// ==================== 进度条 ====================

/** 进度条更新间隔（毫秒） */
export const PROGRESS_UPDATE_INTERVAL = 50

// ==================== 触摸手势 ====================

/** 滑动关闭阈值（像素） */
export const SWIPE_THRESHOLD = 100

/** 滑动速度阈值（像素/毫秒） */
export const SWIPE_VELOCITY_THRESHOLD = 0.5

// ==================== 防抖/节流 ====================

/** 默认防抖延迟（毫秒） */
export const DEFAULT_DEBOUNCE_DELAY = 100

/** 默认节流间隔（毫秒） */
export const DEFAULT_THROTTLE_INTERVAL = 100

// ==================== 容器 ID ====================

/** Toast 容器 ID 前缀 */
export const TOAST_CONTAINER_ID = 'l-toast-container'

/** Message 容器 ID 前缀 */
export const MESSAGE_CONTAINER_ID = 'l-message-container'

/** Notification 容器 ID 前缀 */
export const NOTIFICATION_CONTAINER_ID = 'l-notification-container'

/** Modal 容器 ID 前缀 */
export const MODAL_CONTAINER_ID = 'l-modal-container'

/** Drawer 容器 ID 前缀 */
export const DRAWER_CONTAINER_ID = 'l-drawer-container'

// ==================== 类型常量 ====================

/** 通知类型列表 */
export const NOTIFICATION_TYPES = ['success', 'error', 'warning', 'info', 'loading'] as const

/** 通知位置列表 */
export const NOTIFICATION_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'center',
] as const

/** 抽屉方向列表 */
export const DRAWER_PLACEMENTS = ['top', 'right', 'bottom', 'left'] as const

/** Modal 动画模式列表 */
export const MODAL_ANIMATIONS = [
  'fade',
  'scale',
  'slide-top',
  'slide-bottom',
  'slide-left',
  'slide-right',
  'bounce',
  'zoom',
] as const

