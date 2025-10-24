<template>
  <Teleport to="body">
    <div
      v-for="position in positions"
      :key="position"
      :class="getContainerClass(position)"
      :data-position="position"
    >
      <TransitionGroup :name="getTransitionName(position)">
        <component
          :is="getComponentForType(item.type)"
          v-for="item in getItemsByPosition(position)"
          :key="item.id"
          :item="item"
          @dismiss="handleDismiss"
          @pause="handlePause"
          @resume="handleResume"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { NotificationItem as NotificationItemType, Position } from '../../types'
import { computed } from 'vue'
import { useNotification } from '../composables/useNotification'
import ToastItem from './ToastItem.vue'
import MessageItem from './MessageItem.vue'
import NotificationItemComponent from './NotificationItem.vue'
import AlertDialog from './AlertDialog.vue'

const { notifications, dismiss } = useNotification()

// 获取所有使用的位置
const positions = computed<Position[]>(() => {
  const posSet = new Set<Position>()
  notifications.value.forEach(item => posSet.add(item.position))
  return Array.from(posSet)
})

// 根据位置获取通知
function getItemsByPosition(position: Position): NotificationItemType[] {
  return notifications.value.filter(item => item.position === position)
}

// 获取容器类名
function getContainerClass(position: Position): string {
  return `ldesign-notification-container ldesign-notification-container--${position}`
}

// 获取过渡动画名称
function getTransitionName(position: Position): string {
  if (position.includes('top')) {
    return 'slide-down'
  }
  if (position.includes('bottom')) {
    return 'slide-up'
  }
  return 'fade'
}

// 根据类型获取组件
function getComponentForType(type: NotificationItemType['type']) {
  const components = {
    toast: ToastItem,
    message: MessageItem,
    notification: NotificationItemComponent,
    alert: AlertDialog,
  }
  return components[type]
}

// 处理关闭
function handleDismiss(id: string) {
  dismiss(id)
}

// 处理暂停
function handlePause(id: string) {
  // 通过 manager 暂停计时器
  const manager = useNotification()
  // TODO: 暴露 pauseTimer 方法
}

// 处理恢复
function handleResume(id: string) {
  // 通过 manager 恢复计时器
  const manager = useNotification()
  // TODO: 暴露 resumeTimer 方法
}
</script>

<style scoped>
/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>



