<script setup lang="ts">
import type { ToastItem, ToastManager } from '@ldesign/notification-core'
import type { Component } from 'vue'
/**
 * LToast 组件
 * @description Toast 轻提示组件，深色简洁风格，适合移动端
 * @author LDesign Team
 */
import { h, onMounted, onUnmounted, ref } from 'vue'
import { getGlobalToastManager } from '../composables/useToast'

defineOptions({
  name: 'LToast',
})

const props = withDefaults(defineProps<{
  /** Toast 管理器实例（可选，默认使用全局管理器） */
  manager?: ToastManager
}>(), {
  manager: undefined,
})

/** 获取管理器：优先使用 props 传入的，否则使用全局共享管理器 */
const manager = props.manager ?? getGlobalToastManager()
const items = ref<ToastItem[]>([])

/** 同步状态 */
const syncState = (): void => {
  items.value = [...manager.items]
}

// 订阅事件
const unsubShow = manager.on('show', syncState)
const unsubClose = manager.on('close', syncState)
const unsubUpdate = manager.on('update', syncState)
const unsubClear = manager.on('clear', syncState)

onMounted(() => {
  syncState()
})

onUnmounted(() => {
  unsubShow()
  unsubClose()
  unsubUpdate()
  unsubClear()
})

/** 按位置分组 */
/** 所有可能的位置（固定容器，确保最后一个元素离开时动画正常） */
const allPositions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'center',
] as const

/**
 * 根据位置获取对应的 items
 * @param position - 位置
 * @returns 该位置的 items 数组
 */
const getItemsByPosition = (position: string): ToastItem[] => {
  return items.value.filter(item => item.position === position)
}

/** 获取位置样式 */
const getPositionStyle = (position: string): Record<string, string> => {
  const styles: Record<string, string> = {
    position: 'fixed',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
    left: '0',
    right: '0',
  }

  if (position.includes('top')) {
    styles.top = '20px'
  }
  else if (position.includes('bottom')) {
    styles.bottom = '20px'
  }
  else {
    styles.top = '50%'
    styles.transform = 'translateY(-50%)'
  }

  return styles
}

/**
 * 获取 toast 包装器样式（用于独立居中每个 toast）
 * @param position - 位置
 * @returns 样式对象
 */
const getWrapperStyle = (position: string): Record<string, string> => {
  const styles: Record<string, string> = {
    display: 'flex',
    width: '100%',
  }

  if (position.includes('left')) {
    styles.justifyContent = 'flex-start'
    styles.paddingLeft = '20px'
  }
  else if (position.includes('right')) {
    styles.justifyContent = 'flex-end'
    styles.paddingRight = '20px'
  }
  else {
    styles.justifyContent = 'center'
  }

  return styles
}

/**
 * 获取图标 SVG 路径
 * @param type - 消息类型
 * @returns SVG 路径元素
 */
const getIconSvg = (type: string): Component => {
  const icons: Record<string, () => ReturnType<typeof h>> = {
    success: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
      h('path', { d: 'M22 4 12 14.01l-3-3' }),
    ]),
    error: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('path', { d: 'm15 9-6 6' }),
      h('path', { d: 'm9 9 6 6' }),
    ]),
    warning: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
      h('path', { d: 'M12 9v4' }),
      h('path', { d: 'M12 17h.01' }),
    ]),
    info: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('path', { d: 'M12 16v-4' }),
      h('path', { d: 'M12 8h.01' }),
    ]),
    loading: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '18',
      height: '18',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: 'l-toast__icon--spin',
    }, [
      h('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }),
    ]),
  }
  return icons[type]?.() ?? icons.info()
}

/** 关闭 Toast */
const handleClose = (id: string): void => {
  manager.close(id)
}

/**
 * 暂停 Toast 计时器（鼠标悬停时）
 * @param item - Toast 项
 */
const handleMouseEnter = (item: ToastItem): void => {
  if (item.pauseOnHover && item.duration > 0) {
    manager.pause(item.id)
  }
}

/**
 * 恢复 Toast 计时器（鼠标移出时）
 * @param item - Toast 项
 */
const handleMouseLeave = (item: ToastItem): void => {
  if (item.pauseOnHover && item.duration > 0) {
    manager.resume(item.id)
  }
}

/**
 * 获取动画方向
 * @param position - 位置
 * @returns 动画类名后缀
 */
const getAnimationDirection = (position: string): string => {
  if (position.includes('top')) return 'top'
  if (position.includes('bottom')) return 'bottom'
  return 'top'
}
</script>

<template>
  <Teleport to="body">
    <!-- 预定义所有位置容器，确保最后一个元素离开时动画正常 -->
    <div
      v-for="position in allPositions"
      :key="position"
      class="l-toast-container"
      :style="getPositionStyle(position)"
    >
      <TransitionGroup
        :name="`l-toast-${getAnimationDirection(position)}`"
        appear
        tag="div"
        class="l-toast-list"
      >
        <!-- 包装器：让每个 toast 独立居中，避免互相影响 -->
        <div
          v-for="item in getItemsByPosition(position)"
          :key="item.id"
          class="l-toast-wrapper"
          :style="getWrapperStyle(position)"
        >
          <div
            class="l-toast"
            :class="[
              `l-toast--${item.type}`,
              `l-toast--${item.status}`,
              item.className,
            ]"
            :style="item.style"
            @click="item.onClick?.()"
            @mouseenter="handleMouseEnter(item)"
            @mouseleave="handleMouseLeave(item)"
          >
            <span v-if="item.showIcon" class="l-toast__icon">
              <component :is="getIconSvg(item.type)" />
            </span>
            <div class="l-toast__content">
              <div v-if="item.title" class="l-toast__title">
                {{ item.title }}
              </div>
              <div class="l-toast__message">
                {{ typeof item.message === 'string' ? item.message : '' }}
              </div>
            </div>
            <button
              v-if="item.closable"
              class="l-toast__close"
              aria-label="关闭"
              @click.stop="handleClose(item.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

