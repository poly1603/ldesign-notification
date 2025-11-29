<script setup lang="ts">
import type { MessageItem, MessageManager } from '@ldesign/notification-core'
import type { Component } from 'vue'
/**
 * LMessage 组件
 * @description Message 消息通知组件，支持流畅动画和现代化设计
 * @author LDesign Team
 */
import { h, onMounted, onUnmounted, ref } from 'vue'
import { getGlobalMessageManager } from '../composables/useMessage'

defineOptions({
  name: 'LMessage',
})

const props = withDefaults(defineProps<{
  /** Message 管理器实例（可选，默认使用全局管理器） */
  manager?: MessageManager
}>(), {
  manager: undefined,
})

/** 获取管理器：优先使用 props 传入的，否则使用全局共享管理器 */
const manager = props.manager ?? getGlobalMessageManager()
const items = ref<MessageItem[]>([])

/** 同步状态 */
const syncState = (): void => {
  items.value = [...manager.items]
}

// 订阅事件
const unsubShow = manager.on('show', syncState)
const unsubClose = manager.on('close', syncState)
const unsubClear = manager.on('clear', syncState)

onMounted(() => {
  syncState()
})

onUnmounted(() => {
  unsubShow()
  unsubClose()
  unsubClear()
})

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
const getItemsByPosition = (position: string): MessageItem[] => {
  return items.value.filter(item => item.position === position)
}

/** 获取位置样式 */
const getPositionStyle = (position: string): Record<string, string> => {
  const styles: Record<string, string> = {
    position: 'fixed',
    zIndex: '9998',
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
    // center
    styles.top = '50%'
    styles.transform = 'translateY(-50%)'
  }

  return styles
}

/**
 * 获取图标 SVG 组件
 * @description 简洁白色图标，配合彩色圆形背景
 * @param type - 消息类型
 * @returns SVG 组件
 */
const getIconSvg = (type: string): Component => {
  const icons: Record<string, () => ReturnType<typeof h>> = {
    // 勾选图标
    success: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '3',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'M20 6 9 17l-5-5' }),
    ]),
    // 感叹号图标
    error: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '3',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'M12 8v5' }),
      h('circle', { cx: '12', cy: '16', r: '0.5', fill: 'currentColor' }),
    ]),
    // 感叹号图标（警告）
    warning: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '3',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'M12 8v5' }),
      h('circle', { cx: '12', cy: '16', r: '0.5', fill: 'currentColor' }),
    ]),
    // 问号图标
    info: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '3',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }, [
      h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
      h('circle', { cx: '12', cy: '17', r: '0.5', fill: 'currentColor' }),
    ]),
    // 加载旋转图标
    loading: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: 'l-message__icon--spin',
    }, [
      h('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }),
    ]),
  }
  return icons[type]?.() ?? icons.info()
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

/** 关闭消息 */
const handleClose = (id: string): void => {
  manager.close(id)
}
</script>

<template>
  <Teleport to="body">
    <!-- 预定义所有位置容器，确保最后一个元素离开时动画正常 -->
    <div
      v-for="position in allPositions"
      :key="position"
      class="l-message-container"
      :style="getPositionStyle(position)"
    >
      <TransitionGroup
        :name="`l-message-${getAnimationDirection(position)}`"
        appear
        tag="div"
        class="l-message-list"
      >
        <!-- 包装器：让每个 message 独立居中，避免互相影响 -->
        <div
          v-for="item in getItemsByPosition(position)"
          :key="item.id"
          class="l-message-wrapper"
        >
          <div
            class="l-message"
            :class="[
              `l-message--${item.type}`,
              `l-message--${item.status}`,
              { 'l-message--center': item.center },
              item.className,
            ]"
            :style="item.style"
            @click="item.onClick?.()"
          >
            <span v-if="item.showIcon" class="l-message__icon">
              <component :is="getIconSvg(item.type)" />
            </span>
            <div class="l-message__content">
              {{ typeof item.content === 'string' ? item.content : '' }}
            </div>
            <button
              v-if="item.showClose"
              class="l-message__close"
              aria-label="关闭"
              @click.stop="handleClose(item.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
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

