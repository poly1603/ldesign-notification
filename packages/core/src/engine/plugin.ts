/**
 * @ldesign/notification Engine 插件
 */
import type { NotificationEnginePluginOptions } from './types'
import { NotificationManager } from '../managers/notification-manager'
import { ToastManager } from '../managers/toast-manager'
import { MessageManager } from '../managers/message-manager'

export const notificationStateKeys = {
  NOTIFICATION: 'notification:manager' as const,
  TOAST: 'notification:toast' as const,
  MESSAGE: 'notification:message' as const,
} as const

export const notificationEventKeys = {
  INSTALLED: 'notification:installed' as const,
  UNINSTALLED: 'notification:uninstalled' as const,
  NOTIFY: 'notification:notify' as const,
} as const

export function createNotificationEnginePlugin(options: NotificationEnginePluginOptions = {}) {
  let notificationMgr: NotificationManager | null = null
  let toastMgr: ToastManager | null = null
  let messageMgr: MessageManager | null = null
  return {
    name: 'notification',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      notificationMgr = new NotificationManager()
      toastMgr = new ToastManager()
      messageMgr = new MessageManager()
      engine.state?.set(notificationStateKeys.NOTIFICATION, notificationMgr)
      engine.state?.set(notificationStateKeys.TOAST, toastMgr)
      engine.state?.set(notificationStateKeys.MESSAGE, messageMgr)
      engine.events?.emit(notificationEventKeys.INSTALLED, { name: 'notification' })
      engine.logger?.info('[Notification Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      notificationMgr?.destroy(); toastMgr?.destroy(); messageMgr?.destroy()
      notificationMgr = null; toastMgr = null; messageMgr = null
      engine.state?.delete(notificationStateKeys.NOTIFICATION)
      engine.state?.delete(notificationStateKeys.TOAST)
      engine.state?.delete(notificationStateKeys.MESSAGE)
      engine.events?.emit(notificationEventKeys.UNINSTALLED, {})
      engine.logger?.info('[Notification Plugin] uninstalled')
    },
  }
}
