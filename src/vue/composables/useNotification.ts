/**
 * Vue 3 - useNotification Composable
 */

import type {
  AlertAPI,
  MessageAPI,
  NotificationAPIType,
  NotificationItem,
  NotificationManagerConfig,
  ToastAPI,
} from '../../types'
import { inject, onUnmounted, provide, ref } from 'vue'
import { NotificationManager } from '../../core/manager'

const NOTIFICATION_MANAGER_KEY = Symbol('notification-manager')

/**
 * 提供 Notification Manager
 */
export function provideNotificationManager(config?: NotificationManagerConfig) {
  const manager = new NotificationManager(config)
  provide(NOTIFICATION_MANAGER_KEY, manager)

  onUnmounted(() => {
    manager.destroy()
  })

  return manager
}

/**
 * 注入 Notification Manager
 */
export function injectNotificationManager(): NotificationManager | undefined {
  return inject<NotificationManager>(NOTIFICATION_MANAGER_KEY, undefined)
}

/**
 * useNotification Composable
 */
export function useNotification() {
  const manager = injectNotificationManager()

  if (!manager) {
    console.warn('[useNotification] NotificationManager not provided, using global instance')
  }

  // 使用注入的 manager 或全局单例
  const notificationManager = manager || new NotificationManager()

  // 响应式的通知列表
  const notifications = ref<NotificationItem[]>([])

  // 同步通知列表
  const syncNotifications = () => {
    notifications.value = notificationManager.getAll()
  }

  // 监听通知变化
  const unsubscribeCreated = notificationManager.on('created', syncNotifications)
  const unsubscribeUpdated = notificationManager.on('updated', syncNotifications)
  const unsubscribeDismissed = notificationManager.on('dismissed', syncNotifications)
  const unsubscribeDestroyed = notificationManager.on('destroyed', syncNotifications)

  onUnmounted(() => {
    unsubscribeCreated()
    unsubscribeUpdated()
    unsubscribeDismissed()
    unsubscribeDestroyed()
  })

  return {
    // API
    toast: notificationManager.toast,
    message: notificationManager.message,
    notification: notificationManager.notification,
    alert: notificationManager.alert,

    // 状态
    notifications,

    // 方法
    dismiss: notificationManager.dismiss.bind(notificationManager),
    dismissAll: notificationManager.dismissAll.bind(notificationManager),
    setTheme: notificationManager.setTheme.bind(notificationManager),
    setStackStrategy: notificationManager.setStackStrategy.bind(notificationManager),
    on: notificationManager.on.bind(notificationManager),
    off: notificationManager.off.bind(notificationManager),
  }
}

/**
 * useToast Composable
 */
export function useToast(): ToastAPI {
  const { toast } = useNotification()
  return toast
}

/**
 * useMessage Composable
 */
export function useMessage(): MessageAPI {
  const { message } = useNotification()
  return message
}

/**
 * useAlert Composable
 */
export function useAlert(): AlertAPI {
  const { alert } = useNotification()
  return alert
}



