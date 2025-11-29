<script setup lang="ts">
import type { ConfirmConfig, ModalItem, ModalManager } from '@ldesign/notification-core'
import type { Component, CSSProperties } from 'vue'
/**
 * LModal 组件
 * @description Modal 模态弹窗组件，支持声明式和命令式两种使用方式
 * 支持多种动画模式、拖拽移动、调整大小、最大化/最小化功能
 * @author LDesign Team
 *
 * 声明式用法（v-model）：
 * ```vue
 * <LModal v-model:visible="show" title="弹窗标题" width="500" draggable>
 *   <p>弹窗内容</p>
 * </LModal>
 * ```
 *
 * 命令式用法（API）：
 * ```ts
 * const modal = useModal()
 * modal.confirm({ title: '确认', content: '确定要删除吗？' })
 * ```
 */
import { computed, h, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { getGlobalModalManager } from '../composables/useModal'

defineOptions({
  name: 'LModal',
})

const props = withDefaults(defineProps<{
  /** 是否可见（声明式模式） */
  visible?: boolean
  /** 弹窗标题 */
  title?: string
  /** 弹窗宽度 */
  width?: number | string
  /** 是否居中显示 */
  centered?: boolean
  /** 是否显示遮罩 */
  mask?: boolean
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 动画模式 */
  animation?: AnimationMode
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
  /** 是否可最大化 */
  maximizable?: boolean
  /** Modal 管理器实例（命令式模式） */
  manager?: ModalManager
}>(), {
  visible: undefined,
  title: '',
  width: 520,
  centered: false,
  mask: true,
  maskClosable: true,
  closable: true,
  animation: 'scale',
  draggable: false,
  resizable: false,
  maximizable: false,
  manager: undefined,
})

const emit = defineEmits<{
  /** 可见状态变化 */
  'update:visible': [value: boolean]
}>()

/** 动画模式类型 */
type AnimationMode = 'fade' | 'scale' | 'slide-top' | 'slide-bottom' | 'slide-left' | 'slide-right' | 'bounce' | 'zoom'

/** 扩展的 Modal 配置类型（包含 confirm 相关属性） */
type ExtendedModalConfig = ConfirmConfig & {
  footer?: string | null
  animation?: AnimationMode
  draggable?: boolean
  resizable?: boolean
}

/** 是否为声明式模式 */
const isDeclarativeMode = computed(() => props.visible !== undefined)

/** 获取管理器：优先使用 props 传入的，否则使用全局共享管理器 */
const manager = props.manager ?? getGlobalModalManager()
const items = ref<ModalItem[]>([])

/** 拖拽状态 */
const dragState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
})

/** 调整大小状态 */
const resizeState = reactive({
  isResizing: false,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
  startLeft: 0,
  startTop: 0,
  centerX: 0,
  centerY: 0,
  currentWidth: 0,
  currentHeight: 0,
  currentLeft: 0,
  currentTop: 0,
})

/** 最大化状态 */
const isMaximized = ref(false)

/** 最大化前的尺寸和位置（用于恢复） */
const beforeMaximizeSize = reactive({
  width: 0,
  height: 0,
  top: 0,
  left: 0,
})

/** 是否需要使用 fixed 定位（可拖拽、可调整大小或可最大化时） */
const needsFixedPosition = computed(() => {
  return props.draggable || props.resizable || props.maximizable
})

/** Modal 的固定定位状态 */
const fixedPosition = reactive({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  initialized: false,
})

/** 是否禁用过渡动画（用于初始化时避免动画） */
const disableTransition = ref(false)

/**
 * 拖拽移动
 * @param e - 鼠标事件
 */
const handleDragMove = (e: MouseEvent): void => {
  if (!dragState.isDragging || !modalRef.value) return

  // 计算偏移量（允许鼠标移出屏幕）
  const newOffsetX = e.clientX - dragState.startX
  const newOffsetY = e.clientY - dragState.startY

  // 计算最终位置（基础位置 + 偏移）
  const finalLeft = fixedPosition.left + newOffsetX
  const finalTop = fixedPosition.top + newOffsetY

  // 获取 modal 元素的尺寸
  const modalWidth = fixedPosition.width
  const modalHeight = fixedPosition.height

  // 获取视口尺寸
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 计算边界限制（modal 不能超出屏幕）
  const minLeft = 0
  const maxLeft = viewportWidth - modalWidth
  const minTop = 0
  const maxTop = viewportHeight - modalHeight

  // 限制最终位置
  const constrainedLeft = Math.max(minLeft, Math.min(maxLeft, finalLeft))
  const constrainedTop = Math.max(minTop, Math.min(maxTop, finalTop))

  // 计算受限后的偏移量
  dragState.offsetX = constrainedLeft - fixedPosition.left
  dragState.offsetY = constrainedTop - fixedPosition.top
}

/** 结束拖拽 */
const handleDragEnd = (): void => {
  // 将拖拽偏移合并到 fixedPosition
  if (needsFixedPosition.value) {
    fixedPosition.left += dragState.offsetX
    fixedPosition.top += dragState.offsetY
    dragState.offsetX = 0
    dragState.offsetY = 0
  }

  dragState.isDragging = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

/**
 * 调整大小移动
 * @param e - 鼠标事件
 */
const handleResizeMove = (e: MouseEvent): void => {
  if (!resizeState.isResizing) return

  // 最小尺寸限制
  const minWidth = 300
  const minHeight = 200

  // 获取视口尺寸
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 计算 delta
  const deltaX = e.clientX - resizeState.startX
  const deltaY = e.clientY - resizeState.startY

  if (props.draggable) {
    // 可拖拽模式：以左上角为锚点，宽高变化 = 拖动距离

    // 计算最大允许的尺寸（不能超出屏幕右边和下边）
    const maxWidth = viewportWidth - resizeState.startLeft
    const maxHeight = viewportHeight - resizeState.startTop

    // 计算新尺寸
    let newWidth = resizeState.startWidth + deltaX
    let newHeight = resizeState.startHeight + deltaY

    // 应用尺寸限制（最小和最大）
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

    resizeState.currentWidth = newWidth
    resizeState.currentHeight = newHeight
    resizeState.currentLeft = 0
    resizeState.currentTop = 0
  }
  else {
    // 不可拖拽模式：以中心点为锚点，宽高变化 = 拖动距离 × 2

    // 先计算最大允许的尺寸（基于中心点，确保四边都不超出屏幕）
    const maxWidthLeft = resizeState.centerX * 2 // 左边不超出
    const maxWidthRight = (viewportWidth - resizeState.centerX) * 2 // 右边不超出
    const maxHeightTop = resizeState.centerY * 2 // 上边不超出
    const maxHeightBottom = (viewportHeight - resizeState.centerY) * 2 // 下边不超出

    // 取两个方向的最小值作为实际最大尺寸
    const maxWidth = Math.min(maxWidthLeft, maxWidthRight)
    const maxHeight = Math.min(maxHeightTop, maxHeightBottom)

    // 计算新尺寸
    let newWidth = resizeState.startWidth + deltaX * 2
    let newHeight = resizeState.startHeight + deltaY * 2

    // 应用尺寸限制（最小和最大）
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

    // 计算新位置，保持中心点不变
    const newLeft = resizeState.centerX - newWidth / 2
    const newTop = resizeState.centerY - newHeight / 2

    resizeState.currentWidth = newWidth
    resizeState.currentHeight = newHeight
    resizeState.currentLeft = newLeft
    resizeState.currentTop = newTop
  }
}

/** 结束调整大小 */
const handleResizeEnd = (): void => {
  // 更新 fixedPosition 的尺寸
  if (resizeState.currentWidth > 0) {
    fixedPosition.width = resizeState.currentWidth
  }
  if (resizeState.currentHeight > 0) {
    fixedPosition.height = resizeState.currentHeight
  }

  // 如果是不可拖拽模式，需要更新位置（使用标记而不是检查值是否为 0）
  if (!props.draggable && resizeState.isResizing) {
    fixedPosition.left = resizeState.currentLeft
    fixedPosition.top = resizeState.currentTop
    dragState.offsetX = 0
    dragState.offsetY = 0
  }

  // 清空调整大小状态
  resizeState.isResizing = false
  resizeState.currentWidth = 0
  resizeState.currentHeight = 0
  resizeState.currentLeft = 0
  resizeState.currentTop = 0

  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
}

/** 同步状态 */
const syncState = (): void => {
  items.value = [...manager.items]
}

// 订阅事件（命令式模式）
const unsubOpen = manager.on('open', syncState)
const unsubClose = manager.on('close', syncState)
const unsubUpdate = manager.on('update', syncState)
const unsubClear = manager.on('clear', syncState)

onMounted(() => {
  syncState()
})

onUnmounted(() => {
  unsubOpen()
  unsubClose()
  unsubUpdate()
  unsubClear()
  // 清理事件监听器
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
})

/**
 * 初始化 fixed 定位的位置（居中）
 */
const initializeFixedPosition = (): void => {
  if (!modalRef.value || !needsFixedPosition.value || fixedPosition.initialized) return

  // 禁用过渡动画
  disableTransition.value = true

  // 使用 scrollWidth 和 scrollHeight 获取实际内容尺寸
  // 因为在 scale 动画过程中，getBoundingClientRect() 返回的是动画中间状态的尺寸
  const scrollWidth = modalRef.value.scrollWidth
  const scrollHeight = modalRef.value.scrollHeight
  const width = scrollWidth || (typeof props.width === 'number' ? props.width : 520)
  const height = scrollHeight || 400

  // 计算居中位置
  if (props.centered) {
    fixedPosition.left = (window.innerWidth - width) / 2
    fixedPosition.top = (window.innerHeight - height) / 2
  }
  else {
    fixedPosition.left = (window.innerWidth - width) / 2
    fixedPosition.top = 80 // 默认距离顶部 80px
  }

  fixedPosition.width = width
  fixedPosition.height = height
  fixedPosition.initialized = true

  // 下一帧启用过渡动画
  requestAnimationFrame(() => {
    disableTransition.value = false
  })
}

/** 监听 visible 变化 */
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 打开时初始化位置
    if (needsFixedPosition.value) {
      // 等待 DOM 完全渲染后初始化
      nextTick(() => {
        requestAnimationFrame(() => {
          initializeFixedPosition()
        })
      })
    }
  }
  else {
    // 关闭时重置状态
    dragState.offsetX = 0
    dragState.offsetY = 0
    resizeState.currentWidth = 0
    resizeState.currentHeight = 0
    resizeState.currentLeft = 0
    resizeState.currentTop = 0
    isMaximized.value = false
    fixedPosition.initialized = false
  }
})

/** 处理遮罩点击（命令式模式） */
const handleMaskClick = (item: ModalItem): void => {
  if (item.config.maskClosable !== false) {
    item.close()
  }
}

/** 处理声明式遮罩点击 */
const handleDeclarativeMaskClick = (): void => {
  if (props.maskClosable) {
    emit('update:visible', false)
  }
}

/** 处理声明式关闭 */
const handleDeclarativeClose = (): void => {
  emit('update:visible', false)
}

/**
 * 开始拖拽
 * @param e - 鼠标事件
 */
const handleDragStart = (e: MouseEvent): void => {
  if (!props.draggable || isMaximized.value) return
  e.preventDefault()
  dragState.isDragging = true
  dragState.startX = e.clientX - dragState.offsetX
  dragState.startY = e.clientY - dragState.offsetY
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

/**
 * 开始调整大小
 * @param e - 鼠标事件
 * @param modalEl - Modal 元素
 */
const handleResizeStart = (e: MouseEvent, modalEl: HTMLElement | null): void => {
  if (!props.resizable || isMaximized.value || !modalEl) return
  e.preventDefault()
  e.stopPropagation()

  resizeState.isResizing = true
  resizeState.startX = e.clientX
  resizeState.startY = e.clientY

  // 使用 fixedPosition 的尺寸作为起始尺寸
  resizeState.startWidth = fixedPosition.width
  resizeState.startHeight = fixedPosition.height
  resizeState.startLeft = fixedPosition.left + dragState.offsetX
  resizeState.startTop = fixedPosition.top + dragState.offsetY

  // 计算中心点（用于不可拖拽模式）
  resizeState.centerX = resizeState.startLeft + resizeState.startWidth / 2
  resizeState.centerY = resizeState.startTop + resizeState.startHeight / 2

  // 初始化当前值
  resizeState.currentWidth = resizeState.startWidth
  resizeState.currentHeight = resizeState.startHeight
  // 对于不可拖拽模式，初始化为当前位置（避免 modal 跳到左上角）
  resizeState.currentLeft = props.draggable ? 0 : resizeState.startLeft
  resizeState.currentTop = props.draggable ? 0 : resizeState.startTop

  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
}

/** 切换最大化状态 */
const toggleMaximize = (): void => {
  if (!modalRef.value) return

  if (!isMaximized.value) {
    // ========== 最大化 ==========

    // 1. 记录当前位置和尺寸
    beforeMaximizeSize.width = fixedPosition.width
    beforeMaximizeSize.height = fixedPosition.height
    beforeMaximizeSize.top = fixedPosition.top + dragState.offsetY
    beforeMaximizeSize.left = fixedPosition.left + dragState.offsetX

    // 2. 过渡到全屏
    fixedPosition.width = window.innerWidth
    fixedPosition.height = window.innerHeight
    fixedPosition.top = 0
    fixedPosition.left = 0
    dragState.offsetX = 0
    dragState.offsetY = 0
    isMaximized.value = true
  }
  else {
    // ========== 恢复 ==========

    // 1. 恢复到记录的位置和尺寸
    fixedPosition.width = beforeMaximizeSize.width
    fixedPosition.height = beforeMaximizeSize.height
    fixedPosition.top = beforeMaximizeSize.top
    fixedPosition.left = beforeMaximizeSize.left
    isMaximized.value = false
  }
}

/** 获取弹窗样式（命令式模式） */
const getModalStyle = (item: ModalItem): Record<string, string> => {
  const styles: Record<string, string> = {
    zIndex: String(item.zIndex),
  }

  if (item.config.width) {
    styles.width = typeof item.config.width === 'number'
      ? `${item.config.width}px`
      : item.config.width
  }

  return styles
}

/** 声明式弹窗样式 */
const declarativeModalStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    zIndex: 1000,
  }

  // 如果需要 fixed 定位（可拖拽、可调整大小或可最大化）
  if (needsFixedPosition.value && fixedPosition.initialized) {
    styles.position = 'fixed'

    let finalTop = fixedPosition.top
    let finalLeft = fixedPosition.left
    let finalWidth = fixedPosition.width
    let finalHeight = fixedPosition.height

    // 如果正在调整大小
    if (resizeState.isResizing) {
      // 更新尺寸
      if (resizeState.currentWidth > 0) {
        finalWidth = resizeState.currentWidth
      }
      if (resizeState.currentHeight > 0) {
        finalHeight = resizeState.currentHeight
      }

      // 如果是不可拖拽模式，使用 resizeState 中的绝对位置
      if (!props.draggable) {
        // 使用 resizeState 中记录的位置（可能为 0，表示贴边）
        finalTop = resizeState.currentTop
        finalLeft = resizeState.currentLeft
      }
      else {
        // 可拖拽模式，应用拖拽偏移
        finalTop += dragState.offsetY
        finalLeft += dragState.offsetX
      }
    }
    else {
      // 不在调整大小时，应用拖拽偏移
      finalTop += dragState.offsetY
      finalLeft += dragState.offsetX
    }

    styles.top = `${finalTop}px`
    styles.left = `${finalLeft}px`
    styles.width = `${finalWidth}px`
    styles.height = `${finalHeight}px`
    styles.maxWidth = 'none'
    styles.maxHeight = 'none'
    styles.margin = '0'

    // 最大化时去掉圆角
    if (isMaximized.value) {
      styles.borderRadius = '0'
    }
  }
  else {
    // 普通模式：使用 flex 布局
    if (props.width) {
      styles.width = typeof props.width === 'number'
        ? `${props.width}px`
        : props.width
    }
  }

  return styles
})

/** 可见的 Modal 列表（命令式模式） */
const visibleItems = computed(() => {
  return items.value.filter(item => item.visible || item.opening || item.closing)
})

/**
 * 获取动画类名
 * @param animation - 动画模式
 * @returns 动画类名
 */
const getAnimationName = (animation: AnimationMode = 'scale'): string => {
  return `l-modal-${animation}`
}

/**
 * 获取关闭图标 SVG
 * @returns SVG 组件
 */
const getCloseIcon = (): Component => {
  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '16',
    height: '16',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }, [
    h('path', { d: 'M18 6 6 18' }),
    h('path', { d: 'm6 6 12 12' }),
  ])
}

/**
 * 获取最大化图标 SVG
 * @returns SVG 组件
 */
const getMaximizeIcon = (): Component => {
  if (isMaximized.value) {
    // 还原图标
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'M8 3H5a2 2 0 0 0-2 2v3' }),
      h('path', { d: 'M21 8V5a2 2 0 0 0-2-2h-3' }),
      h('path', { d: 'M3 16v3a2 2 0 0 0 2 2h3' }),
      h('path', { d: 'M16 21h3a2 2 0 0 0 2-2v-3' }),
    ])
  }
  // 最大化图标
  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '14',
    height: '14',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }, [
    h('path', { d: 'M8 3v3a2 2 0 0 1-2 2H3' }),
    h('path', { d: 'M21 8h-3a2 2 0 0 1-2-2V3' }),
    h('path', { d: 'M3 16h3a2 2 0 0 1 2 2v3' }),
    h('path', { d: 'M16 21v-3a2 2 0 0 1 2-2h3' }),
  ])
}

/**
 * 判断 Modal 是否是 confirm 类型（需要渲染按钮）
 * @param item - Modal 项
 * @returns 是否需要渲染按钮
 */
const isConfirmType = (item: ModalItem): boolean => {
  const config = item.config as ExtendedModalConfig
  return !!(config.confirmText || config.cancelText || config.onConfirm)
}

/**
 * 处理确认按钮点击
 * @param item - Modal 项
 */
const handleConfirm = async (item: ModalItem): Promise<void> => {
  const config = item.config as ExtendedModalConfig
  if (config.onConfirm) {
    await config.onConfirm()
  }
  item.close()
}

/**
 * 处理取消按钮点击
 * @param item - Modal 项
 */
const handleCancel = (item: ModalItem): void => {
  const config = item.config as ExtendedModalConfig
  if (config.onCancel) {
    config.onCancel()
  }
  item.close()
}

/**
 * 获取确认按钮类名
 * @param item - Modal 项
 * @returns 按钮类名
 */
const getConfirmButtonClass = (item: ModalItem): string => {
  const config = item.config as ExtendedModalConfig
  const baseClass = 'l-modal__btn l-modal__btn--confirm'
  if (config.confirmType === 'danger') {
    return `${baseClass} l-modal__btn--danger`
  }
  return `${baseClass} l-modal__btn--primary`
}

/** Modal 元素引用 */
const modalRef = ref<HTMLElement | null>(null)
</script>

<template>
  <Teleport to="body">
    <!-- 声明式模式 -->
    <template v-if="isDeclarativeMode">
      <!-- 遮罩 -->
      <Transition name="l-modal-mask">
        <div v-if="mask && visible" class="l-modal__mask" :style="{ zIndex: 1000 }"
          @click="handleDeclarativeMaskClick" />
      </Transition>

      <!-- 弹窗内容 -->
      <Transition :name="getAnimationName(animation)">
        <div v-if="visible" class="l-modal-wrapper" :class="{
          'l-modal-wrapper--centered': centered && !needsFixedPosition && !isMaximized,
          'l-modal-wrapper--maximized': isMaximized,
        }" :style="{ zIndex: 1001 }">
          <div ref="modalRef" class="l-modal" :class="{
            'l-modal--draggable': draggable,
            'l-modal--resizable': resizable,
            'l-modal--maximized': isMaximized,
            'l-modal--dragging': dragState.isDragging,
            'l-modal--resizing': resizeState.isResizing,
            'l-modal--no-transition': disableTransition,
          }" :style="declarativeModalStyle" role="dialog" aria-modal="true">
            <!-- 头部 -->
            <div v-if="title || closable || maximizable" class="l-modal__header"
              :class="{ 'l-modal__header--draggable': draggable }" @mousedown="handleDragStart">
              <div class="l-modal__title">
                {{ title }}
              </div>
              <div class="l-modal__header-actions">
                <button v-if="maximizable" class="l-modal__action-btn" aria-label="最大化" @click.stop="toggleMaximize">
                  <component :is="getMaximizeIcon()" />
                </button>
                <button v-if="closable" class="l-modal__close" aria-label="关闭" @click.stop="handleDeclarativeClose">
                  <component :is="getCloseIcon()" />
                </button>
              </div>
            </div>

            <!-- 内容 -->
            <div class="l-modal__body">
              <slot />
            </div>

            <!-- 底部 -->
            <div v-if="$slots.footer" class="l-modal__footer">
              <slot name="footer" />
            </div>

            <!-- 调整大小手柄 -->
            <div v-if="resizable && !isMaximized" class="l-modal__resize-handle"
              @mousedown="(e) => handleResizeStart(e, modalRef)" />
          </div>
        </div>
      </Transition>
    </template>

    <!-- 命令式模式 -->
    <template v-else>
      <template v-for="item in visibleItems" :key="item.id">
        <!-- 遮罩 -->
        <Transition name="l-modal-mask">
          <div v-if="item.config.mask !== false && item.visible" class="l-modal__mask" :style="{ zIndex: item.zIndex }"
            @click="handleMaskClick(item)" />
        </Transition>

        <!-- 弹窗内容 -->
        <Transition :name="getAnimationName((item.config as ExtendedModalConfig).animation)">
          <div v-if="item.visible" class="l-modal-wrapper"
            :class="{ 'l-modal-wrapper--centered': item.config.centered }" :style="{ zIndex: item.zIndex + 1 }">
            <div class="l-modal" :class="[item.config.className, { 'l-modal--loading': item.loading }]"
              :style="{ ...getModalStyle(item), ...item.config.style }" role="dialog" aria-modal="true">
              <!-- 头部 -->
              <div v-if="item.config.title" class="l-modal__header">
                <div class="l-modal__title">
                  {{ typeof item.config.title === 'string' ? item.config.title : '' }}
                </div>
                <button v-if="item.config.closable !== false" class="l-modal__close" aria-label="关闭"
                  @click="item.close()">
                  <component :is="getCloseIcon()" />
                </button>
              </div>

              <!-- 内容 -->
              <div class="l-modal__body">
                <slot :item="item">
                  {{ typeof item.config.content === 'string' ? item.config.content : '' }}
                </slot>
              </div>

              <!-- 底部 -->
              <div v-if="item.config.footer !== null || isConfirmType(item)" class="l-modal__footer">
                <slot name="footer" :item="item">
                  <!-- 如果是 confirm 类型，渲染确认/取消按钮 -->
                  <template v-if="isConfirmType(item)">
                    <button
                      v-if="(item.config as ExtendedModalConfig).showCancel !== false && (item.config as ExtendedModalConfig).cancelText"
                      class="l-modal__btn l-modal__btn--cancel" @click="handleCancel(item)">
                      {{ (item.config as ExtendedModalConfig).cancelText || '取消' }}
                    </button>
                    <button :class="getConfirmButtonClass(item)" :disabled="item.loading" @click="handleConfirm(item)">
                      {{ item.loading ? '加载中...' : ((item.config as ExtendedModalConfig).confirmText || '确定') }}
                    </button>
                  </template>
                  <!-- 否则显示 footer 字符串 -->
                  <template v-else>
                    {{ typeof item.config.footer === 'string' ? item.config.footer : '' }}
                  </template>
                </slot>
              </div>
            </div>
          </div>
        </Transition>
      </template>
    </template>
  </Teleport>
</template>
