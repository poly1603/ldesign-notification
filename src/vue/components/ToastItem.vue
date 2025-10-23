<template>
  <div
    :class="classList"
    :data-id="item.id"
    :style="item.style"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="ldesign-toast-content">
      <span v-if="showIcon" class="ldesign-notification-icon" :class="iconClass">
        {{ iconText }}
      </span>
      <div class="ldesign-toast-message">
        {{ item.message }}
      </div>
    </div>
    <button
      v-if="item.dismissible"
      class="ldesign-notification-close"
      aria-label="Close"
      @click.stop="handleClose"
    >
      ×
    </button>
    <div v-if="showProgress" class="ldesign-notification-progress">
      <div class="ldesign-notification-progress-bar" :style="progressStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationItem } from '../../types'
import { computed } from 'vue'

interface Props {
  item: NotificationItem
}

interface Emits {
  (e: 'dismiss', id: string): void
  (e: 'pause', id: string): void
  (e: 'resume', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const classList = computed(() => [
  'ldesign-toast',
  `ldesign-toast--${props.item.variant}`,
  props.item.className,
])

const showIcon = computed(() => props.item.icon !== false)

const iconClass = computed(() => ({
  'ldesign-notification-loading': props.item.variant === 'loading',
}))

const iconText = computed(() => {
  if (typeof props.item.icon === 'string') {
    return props.item.icon
  }

  const defaultIcons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    loading: '⟳',
  }

  return defaultIcons[props.item.variant] || ''
})

const showProgress = computed(() => {
  return props.item.duration > 0 && props.item.variant !== 'loading'
})

const progressStyle = computed(() => ({
  animationDuration: `${props.item.duration}ms`,
}))

function handleClick() {
  props.item.onClick(props.item.id)
}

function handleClose() {
  emit('dismiss', props.item.id)
}

function handleMouseEnter() {
  if (props.item.pauseOnHover) {
    emit('pause', props.item.id)
  }
}

function handleMouseLeave() {
  if (props.item.pauseOnHover) {
    emit('resume', props.item.id)
  }
}
</script>



