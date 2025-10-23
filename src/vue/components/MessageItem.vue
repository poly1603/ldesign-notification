<template>
  <div
    :class="classList"
    :data-id="item.id"
    :style="item.style"
    @click="handleClick"
  >
    <div class="ldesign-message-content">
      <span v-if="showIcon" class="ldesign-notification-icon">
        {{ iconText }}
      </span>
      <span class="ldesign-message-text">
        {{ item.message }}
      </span>
    </div>
    <button
      v-if="showClose"
      class="ldesign-notification-close"
      aria-label="Close"
      @click.stop="handleClose"
    >
      ×
    </button>
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
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const classList = computed(() => [
  'ldesign-message',
  `ldesign-message--${props.item.variant}`,
  props.item.className,
  { 'ldesign-message--center': props.item.data?.center },
])

const showIcon = computed(() => props.item.icon !== false)

const showClose = computed(() => props.item.data?.showClose === true)

const iconText = computed(() => {
  if (typeof props.item.icon === 'string') {
    return props.item.icon
  }

  const defaultIcons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return defaultIcons[props.item.variant] || ''
})

function handleClick() {
  props.item.onClick(props.item.id)
}

function handleClose() {
  emit('dismiss', props.item.id)
}
</script>



