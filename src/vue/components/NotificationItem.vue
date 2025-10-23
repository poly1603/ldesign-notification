<template>
  <div
    :class="classList"
    :data-id="item.id"
    :style="item.style"
    @click="handleClick"
  >
    <div class="ldesign-notification-header">
      <span v-if="showIcon" class="ldesign-notification-icon">
        {{ iconText }}
      </span>
      <div class="ldesign-notification-header-content">
        <div v-if="item.title" class="ldesign-notification-title">
          {{ item.title }}
        </div>
        <div class="ldesign-notification-message">
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
    </div>
    <div v-if="actions && actions.length" class="ldesign-notification-actions">
      <button
        v-for="(action, index) in actions"
        :key="index"
        :class="getActionClass(action)"
        @click.stop="handleAction(action)"
      >
        {{ action.text }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationAction, NotificationItem as NotificationItemType } from '../../types'
import { computed } from 'vue'

interface Props {
  item: NotificationItemType
}

interface Emits {
  (e: 'dismiss', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const classList = computed(() => [
  'ldesign-notification',
  `ldesign-notification--${props.item.variant}`,
  props.item.className,
])

const showIcon = computed(() => props.item.icon !== false)

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

const actions = computed(() => props.item.data?.actions as NotificationAction[] | undefined)

function getActionClass(action: NotificationAction) {
  return [
    'ldesign-notification-button',
    action.type && `ldesign-notification-button--${action.type}`,
  ]
}

function handleClick() {
  props.item.onClick(props.item.id)
}

function handleClose() {
  emit('dismiss', props.item.id)
}

function handleAction(action: NotificationAction) {
  action.onClick(props.item.id)
  if (action.closeOnClick !== false) {
    emit('dismiss', props.item.id)
  }
}
</script>



