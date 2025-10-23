<template>
  <div class="ldesign-alert-overlay" @click="handleOverlayClick">
    <div class="ldesign-alert" @click.stop>
      <div v-if="options.icon" :class="`ldesign-alert-icon ldesign-alert-icon--${options.icon}`">
        {{ iconText }}
      </div>

      <div v-if="item.title || options.title" class="ldesign-alert-title">
        {{ item.title || options.title }}
      </div>

      <div v-if="item.message || options.text" class="ldesign-alert-text">
        {{ item.message || options.text }}
      </div>

      <div v-if="options.input">
        <input
          ref="inputRef"
          v-model="inputValue"
          :type="options.input"
          :placeholder="options.inputPlaceholder"
          class="ldesign-alert-input"
          :class="{ 'ldesign-alert-input--error': validationError }"
        >
        <div v-if="validationError" class="ldesign-alert-validation">
          {{ validationError }}
        </div>
      </div>

      <div class="ldesign-alert-buttons">
        <button
          v-if="options.showCancelButton"
          class="ldesign-alert-button ldesign-alert-button--cancel"
          @click="handleCancel"
        >
          {{ options.cancelButtonText || 'Cancel' }}
        </button>

        <button
          v-if="options.showDenyButton"
          class="ldesign-alert-button ldesign-alert-button--deny"
          @click="handleDeny"
        >
          {{ options.denyButtonText || 'No' }}
        </button>

        <button
          v-if="options.showConfirmButton !== false"
          class="ldesign-alert-button ldesign-alert-button--confirm"
          @click="handleConfirm"
        >
          {{ options.confirmButtonText || 'OK' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AlertOptions, NotificationItem } from '../../types'
import { computed, onMounted, ref } from 'vue'

interface Props {
  item: NotificationItem
}

interface Emits {
  (e: 'dismiss', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const options = computed(() => props.item.data as AlertOptions)

const inputRef = ref<HTMLInputElement>()
const inputValue = ref(options.value.inputValue || '')
const validationError = ref('')

const iconText = computed(() => {
  const iconMap: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    question: '?',
  }
  return iconMap[options.value.icon || ''] || ''
})

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})

function handleOverlayClick() {
  if (options.value.allowOutsideClick !== false) {
    handleCancel()
  }
}

async function handleConfirm() {
  // 验证输入
  if (options.value.input && options.value.inputValidator) {
    const error = await options.value.inputValidator(inputValue.value)
    if (error) {
      validationError.value = error
      return
    }
  }

  // preConfirm 钩子
  if (options.value.preConfirm) {
    try {
      await options.value.preConfirm(inputValue.value)
    }
    catch (error) {
      console.error('preConfirm error:', error)
      return
    }
  }

  options.value.onConfirm?.()
  emit('dismiss', props.item.id)
}

function handleCancel() {
  options.value.onCancel?.()
  emit('dismiss', props.item.id)
}

function handleDeny() {
  options.value.onDeny?.()
  emit('dismiss', props.item.id)
}

// ESC 键关闭
onMounted(() => {
  if (options.value.allowEscapeKey !== false) {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }
})
</script>



