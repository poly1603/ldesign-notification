<script setup lang="ts">
import type { DrawerItem, DrawerManager, DrawerPlacement } from '@ldesign/notification-core'
import type { Component, CSSProperties } from 'vue'
import { getDrawerSizeStyle } from '@ldesign/notification-core'
/**
 * LDrawer 组件
 * @description Drawer 抽屉组件，支持声明式和命令式两种使用方式
 * 支持四个方向滑入滑出、拖动调整大小、最小/最大尺寸限制
 * @author LDesign Team
 *
 * 声明式用法（v-model）：
 * ```vue
 * <LDrawer v-model:visible="show" title="抽屉标题" placement="right" resizable>
 *   <p>抽屉内容</p>
 * </LDrawer>
 * ```
 *
 * 命令式用法（API）：
 * ```ts
 * const drawer = useDrawer()
 * drawer.open({ title: '标题', content: '内容' })
 * ```
 */
import { computed, h, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { getGlobalDrawerManager } from '../composables/useDrawer'

defineOptions({
  name: 'LDrawer',
})

const props = withDefaults(defineProps<{
  /** 是否可见（声明式模式） */
  visible?: boolean
  /** 抽屉标题 */
  title?: string
  /** 抽屉位置 */
  placement?: DrawerPlacementType
  /** 抽屉宽度（左右方向） */
  width?: number | string
  /** 抽屉高度（上下方向） */
  height?: number | string
  /** 是否显示遮罩 */
  mask?: boolean
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
  /** 最小宽度（左右方向） */
  minWidth?: number
  /** 最大宽度（左右方向） */
  maxWidth?: number
  /** 最小高度（上下方向） */
  minHeight?: number
  /** 最大高度（上下方向） */
  maxHeight?: number
  /** Drawer 管理器实例（命令式模式） */
  manager?: DrawerManager
}>(), {
  visible: undefined,
  title: '',
  placement: 'right',
  width: 378,
  height: 378,
  mask: true,
  maskClosable: true,
  closable: true,
  resizable: false,
  minWidth: 200,
  maxWidth: 800,
  minHeight: 200,
  maxHeight: 600,
  manager: undefined,
})

const emit = defineEmits<{
  /** 可见状态变化 */
  'update:visible': [value: boolean]
}>()

type DrawerPlacementType = 'left' | 'right' | 'top' | 'bottom'

/** 是否为声明式模式 */
const isDeclarativeMode = computed(() => props.visible !== undefined)

/** 获取管理器：优先使用 props 传入的，否则使用全局共享管理器 */
const manager = props.manager ?? getGlobalDrawerManager()
const items = ref<DrawerItem[]>([])

/** 调整大小状态 */
const resizeState = reactive({
  isResizing: false,
  startPos: 0,
  startSize: 0,
  currentSize: 0,
})

/**
 * 调整大小移动
 * @param e - 鼠标事件
 */
const handleResizeMove = (e: MouseEvent): void => {
  if (!resizeState.isResizing) return

  const isHorizontal = props.placement === 'left' || props.placement === 'right'
  const currentPos = isHorizontal ? e.clientX : e.clientY
  let delta = currentPos - resizeState.startPos

  // 根据方向调整 delta 符号
  if (props.placement === 'right' || props.placement === 'bottom') {
    delta = -delta
  }

  let newSize = resizeState.startSize + delta

  // 应用最小/最大限制
  if (isHorizontal) {
    newSize = Math.max(props.minWidth, Math.min(props.maxWidth, newSize))
  }
  else {
    newSize = Math.max(props.minHeight, Math.min(props.maxHeight, newSize))
  }

  resizeState.currentSize = newSize
}

/** 结束调整大小 */
const handleResizeEnd = (): void => {
  resizeState.isResizing = false
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
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
})

/** 重置调整大小状态 */
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resizeState.currentSize = 0
  }
})

/** 处理遮罩点击（命令式模式） */
const handleMaskClick = (item: DrawerItem): void => {
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
 * 开始调整大小
 * @param e - 鼠标事件
 */
const handleResizeStart = (e: MouseEvent): void => {
  if (!props.resizable) return
  e.preventDefault()
  e.stopPropagation()
  resizeState.isResizing = true

  // 根据方向获取起始位置
  const isHorizontal = props.placement === 'left' || props.placement === 'right'
  resizeState.startPos = isHorizontal ? e.clientX : e.clientY

  // 获取当前大小
  const defaultSize = isHorizontal
    ? (typeof props.width === 'number' ? props.width : 378)
    : (typeof props.height === 'number' ? props.height : 378)
  resizeState.startSize = resizeState.currentSize || defaultSize

  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
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

/** 获取抽屉样式（命令式模式） */
const getDrawerStyle = (item: DrawerItem): Record<string, string> => {
  const placement = item.config.placement || 'right'
  const size = placement === 'left' || placement === 'right'
    ? item.config.width || 378
    : item.config.height || 378

  return {
    zIndex: String(item.zIndex),
    ...getDrawerSizeStyle(placement, size),
  }
}

/** 获取声明式抽屉样式 */
const declarativeDrawerStyle = computed<CSSProperties>(() => {
  const isHorizontal = props.placement === 'left' || props.placement === 'right'

  // 使用调整后的大小或默认大小
  let size: number | string
  if (resizeState.currentSize > 0) {
    size = resizeState.currentSize
  }
  else {
    size = isHorizontal ? props.width : props.height
  }

  return {
    zIndex: 1000,
    ...getDrawerSizeStyle(props.placement as DrawerPlacement, size as number),
  }
})

/**
 * 获取调整大小手柄的位置类名
 * @returns 位置类名
 */
const getResizeHandleClass = computed(() => {
  return `l-drawer__resize-handle--${props.placement}`
})

/** 可见的 Drawer 列表（命令式模式） */
const visibleItems = computed(() => {
  return items.value.filter(item => item.visible || item.opening || item.closing)
})
</script>

<template>
  <Teleport to="body">
    <!-- 声明式模式 -->
    <template v-if="isDeclarativeMode">
      <!-- 遮罩 -->
      <Transition name="l-drawer-mask">
        <div
          v-if="mask && visible" class="l-drawer__mask" :style="{ zIndex: 1000 }"
          @click="handleDeclarativeMaskClick"
        />
      </Transition>

      <!-- 抽屉内容 -->
      <Transition :name="`l-drawer-${placement}`">
        <div
          v-if="visible" class="l-drawer" :class="[
            `l-drawer--${placement}`,
            { 'l-drawer--resizable': resizable },
            { 'l-drawer--resizing': resizeState.isResizing },
          ]" :style="declarativeDrawerStyle" role="dialog" aria-modal="true"
        >
          <!-- 调整大小手柄 -->
          <div
            v-if="resizable" class="l-drawer__resize-handle" :class="getResizeHandleClass"
            @mousedown="handleResizeStart"
          />

          <!-- 头部 -->
          <div class="l-drawer__header">
            <div class="l-drawer__title">
              {{ title }}
            </div>
            <button v-if="closable" class="l-drawer__close" aria-label="关闭" @click="handleDeclarativeClose">
              <component :is="getCloseIcon()" />
            </button>
          </div>

          <!-- 内容 -->
          <div class="l-drawer__body">
            <slot />
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="l-drawer__footer">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </template>

    <!-- 命令式模式 -->
    <template v-else>
      <template v-for="item in visibleItems" :key="item.id">
        <!-- 遮罩 -->
        <Transition name="l-drawer-mask">
          <div
            v-if="item.config.mask !== false && item.visible" class="l-drawer__mask" :style="{ zIndex: item.zIndex }"
            @click="handleMaskClick(item)"
          />
        </Transition>

        <!-- 抽屉内容 -->
        <Transition :name="`l-drawer-${item.config.placement || 'right'}`">
          <div
            v-if="item.visible" class="l-drawer" :class="[
              `l-drawer--${item.config.placement || 'right'}`,
              item.config.className,
            ]" :style="{ ...getDrawerStyle(item), ...item.config.style }" role="dialog" aria-modal="true"
          >
            <!-- 头部 -->
            <div v-if="item.config.showHeader !== false" class="l-drawer__header">
              <div class="l-drawer__title">
                {{ typeof item.config.title === 'string' ? item.config.title : '' }}
              </div>
              <button
                v-if="item.config.closable !== false" class="l-drawer__close" aria-label="关闭"
                @click="item.close()"
              >
                <component :is="getCloseIcon()" />
              </button>
            </div>

            <!-- 内容 -->
            <div class="l-drawer__body">
              <slot :item="item">
                {{ typeof item.config.content === 'string' ? item.config.content : '' }}
              </slot>
            </div>

            <!-- 底部 -->
            <div v-if="item.config.footer !== null && item.config.footer !== undefined" class="l-drawer__footer">
              <slot name="footer" :item="item">
                {{ typeof item.config.footer === 'string' ? item.config.footer : '' }}
              </slot>
            </div>
          </div>
        </Transition>
      </template>
    </template>
  </Teleport>
</template>
