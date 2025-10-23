/**
 * React - useNotification Hook
 */

import type { NotificationItem } from '../../types'
import { useEffect, useState } from 'react'
import { useNotificationContext } from '../context'

/**
 * useNotification Hook
 */
export function useNotification() {
  const { manager } = useNotificationContext()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    // 同步通知列表
    const syncNotifications = () => {
      setNotifications(manager.getAll())
    }

    // 监听通知变化
    const unsubscribeCreated = manager.on('created', syncNotifications)
    const unsubscribeUpdated = manager.on('updated', syncNotifications)
    const unsubscribeDismissed = manager.on('dismissed', syncNotifications)
    const unsubscribeDestroyed = manager.on('destroyed', syncNotifications)

    // 初始同步
    syncNotifications()

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDismissed()
      unsubscribeDestroyed()
    }
  }, [manager])

  return {
    // API
    toast: manager.toast,
    message: manager.message,
    notification: manager.notification,
    alert: manager.alert,

    // 状态
    notifications,

    // 方法
    dismiss: manager.dismiss.bind(manager),
    dismissAll: manager.dismissAll.bind(manager),
    setTheme: manager.setTheme.bind(manager),
    setStackStrategy: manager.setStackStrategy.bind(manager),
    on: manager.on.bind(manager),
    off: manager.off.bind(manager),
  }
}

/**
 * useToast Hook
 */
export function useToast() {
  const { toast } = useNotification()
  return toast
}

/**
 * useMessage Hook
 */
export function useMessage() {
  const { message } = useNotification()
  return message
}

/**
 * useAlert Hook
 */
export function useAlert() {
  const { alert } = useNotification()
  return alert
}



