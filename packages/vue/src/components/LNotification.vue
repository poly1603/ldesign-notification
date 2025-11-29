<script setup lang="ts">
import type { NotificationItem, NotificationManager } from '@ldesign/notification-core'
import type { Component } from 'vue'
/**
 * LNotification 组件
 * @description Notification 通知提醒组件，支持流畅动画和现代化设计
 * @author LDesign Team
 */
import { h, onMounted, onUnmounted, ref } from 'vue'
import { getGlobalNotificationManager } from '../composables/useNotification'

defineOptions({
  name: 'LNotification',
})

const props = withDefaults(defineProps<{
  /** Notification 管理器实例（可选，默认使用全局管理器） */
  manager?: NotificationManager
}>(), {
  manager: undefined,
})

/** 获取管理器：优先使用 props 传入的，否则使用全局共享管理器 */
const manager = props.manager ?? getGlobalNotificationManager()
const items = ref<NotificationItem[]>([])

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

/** 所有可能的位置（固定容器，确保最后一个元素离开时动画正常） */
const allPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

/**
 * 根据位置获取对应的 items
 * @param position - 位置
 * @returns 该位置的 items 数组
 */
const getItemsByPosition = (position: string): NotificationItem[] => {
  return items.value.filter(item => item.position === position)
}

/** 获取位置样式 */
const getPositionStyle = (position: string): Record<string, string> => {
  const styles: Record<string, string> = {
    position: 'fixed',
    zIndex: '9997',
    pointerEvents: 'none',
  }

  if (position.includes('top')) {
    styles.top = '24px'
  }
  else {
    styles.bottom = '24px'
  }

  if (position.includes('left')) {
    styles.left = '24px'
  }
  else {
    styles.right = '24px'
  }

  return styles
}

/**
 * 获取图标 SVG 组件
 * @param type - 通知类型
 * @returns SVG 组件
 */
const getIconSvg = (type: string): Component => {
  const icons: Record<string, () => ReturnType<typeof h>> = {
    success: () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '20',
      height: '20',
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
      width: '20',
      height: '20',
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
      width: '20',
      height: '20',
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
      width: '20',
      height: '20',
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
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: 'l-notification__icon--spin',
    }, [
      h('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }),
    ]),
  }
  return icons[type]?.() ?? icons.info()
}

/** 关闭通知 */
const handleClose = (id: string): void => {
  manager.close(id)
}

/** 动画持续时间（毫秒） */
const ANIMATION_DURATION = 350

/**
 * 获取滑动方向的 translateX 值
 * @param position - 位置
 * @param isEnter - 是否是进入状态（false 表示初始/离开状态）
 */
const getTranslateX = (position: string, isEnter: boolean): string => {
  if (isEnter) return 'translateX(0)'
  // 左侧位置向左滑，右侧位置向右滑
  return position.includes('left') ? 'translateX(-50px)' : 'translateX(50px)'
}

/**
 * 创建动画钩子（根据位置）
 * @param position - 通知位置
 */
const createAnimationHooks = (position: string) => {
  const translateOut = getTranslateX(position, false)

  return {
    onBeforeEnter: (el: Element): void => {
      const htmlEl = el as HTMLElement
      htmlEl.style.opacity = '0'
      htmlEl.style.transform = translateOut
    },

    onEnter: (el: Element, done: () => void): void => {
      const htmlEl = el as HTMLElement
      void htmlEl.offsetHeight
      htmlEl.style.transition = `opacity ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
      htmlEl.style.opacity = '1'
      htmlEl.style.transform = 'translateX(0)'
      setTimeout(done, ANIMATION_DURATION)
    },

    onAfterEnter: (el: Element): void => {
      const htmlEl = el as HTMLElement
      htmlEl.style.transition = ''
      htmlEl.style.opacity = ''
      htmlEl.style.transform = ''
    },

    onBeforeLeave: (el: Element): void => {
      const htmlEl = el as HTMLElement
      const rect = htmlEl.getBoundingClientRect()
      htmlEl.style.height = `${rect.height}px`
      htmlEl.style.width = `${rect.width}px`
    },

    onLeave: (el: Element, done: () => void): void => {
      const htmlEl = el as HTMLElement
      void htmlEl.offsetHeight
      htmlEl.style.transition = `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
      htmlEl.style.overflow = 'hidden'

      requestAnimationFrame(() => {
        htmlEl.style.opacity = '0'
        htmlEl.style.transform = translateOut
        htmlEl.style.height = '0'
        htmlEl.style.marginTop = '0'
        htmlEl.style.marginBottom = '0'
        htmlEl.style.paddingTop = '0'
        htmlEl.style.paddingBottom = '0'
      })

      setTimeout(done, ANIMATION_DURATION)
    },

    onAfterLeave: (el: Element): void => {
      const htmlEl = el as HTMLElement
      htmlEl.style.transition = ''
      htmlEl.style.opacity = ''
      htmlEl.style.transform = ''
      htmlEl.style.height = ''
      htmlEl.style.width = ''
      htmlEl.style.overflow = ''
      htmlEl.style.marginTop = ''
      htmlEl.style.marginBottom = ''
      htmlEl.style.paddingTop = ''
      htmlEl.style.paddingBottom = ''
    },
  }
}

/** 缓存每个位置的动画钩子 */
const animationHooksMap = new Map<string, ReturnType<typeof createAnimationHooks>>()

/**
 * 获取指定位置的动画钩子
 */
const getAnimationHooks = (position: string): ReturnType<typeof createAnimationHooks> => {
  let hooks = animationHooksMap.get(position)
  if (!hooks) {
    hooks = createAnimationHooks(position)
    animationHooksMap.set(position, hooks)
  }
  return hooks
}
</script>

<template>
  <Teleport to="body">
    <!-- 预定义所有位置容器，确保最后一个元素离开时动画正常 -->
    <div
      v-for="position in allPositions" :key="position" class="l-notification-container"
      :style="getPositionStyle(position)"
    >
      <TransitionGroup
        :css="false" appear tag="div" class="l-notification-list"
        @before-enter="getAnimationHooks(position).onBeforeEnter" @enter="getAnimationHooks(position).onEnter"
        @after-enter="getAnimationHooks(position).onAfterEnter"
        @before-leave="getAnimationHooks(position).onBeforeLeave" @leave="getAnimationHooks(position).onLeave"
        @after-leave="getAnimationHooks(position).onAfterLeave"
      >
        <!-- 包装器：确保离开动画时 absolute 定位正确 -->
        <div v-for="item in getItemsByPosition(position)" :key="item.id" class="l-notification-wrapper">
          <div
            class="l-notification" :class="[
              `l-notification--${item.type}`,
              `l-notification--${item.status}`,
              item.className,
            ]" :style="{
              ...item.style,
              width: typeof item.width === 'number' ? `${item.width}px` : item.width,
            }" @click="item.onClick?.()"
          >
            <div class="l-notification__header">
              <span v-if="item.showIcon" class="l-notification__icon">
                <component :is="getIconSvg(item.type)" />
              </span>
              <div class="l-notification__title">
                {{ typeof item.title === 'string' ? item.title : '' }}
              </div>
              <button
                v-if="item.closable" class="l-notification__close" aria-label="关闭"
                @click.stop="handleClose(item.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div v-if="item.content" class="l-notification__content">
              {{ typeof item.content === 'string' ? item.content : '' }}
            </div>
            <div v-if="item.actions.length > 0" class="l-notification__actions">
              <button
                v-for="(action, actionIndex) in item.actions" :key="actionIndex" class="l-notification__action"
                :class="`l-notification__action--${action.type || 'secondary'}`"
                :disabled="action.disabled || action.loading" @click.stop="action.onClick?.()"
              >
                {{ action.text }}
              </button>
            </div>
            <div v-if="item.showProgress" class="l-notification__progress">
              <div class="l-notification__progress-bar" :style="{ width: `${item.progress}%` }" />
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
