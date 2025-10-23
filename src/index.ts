/**
 * @ldesign/notification - 通知系统
 */

export interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export class NotificationManager {
  toast(message: string, options?: NotificationOptions) {
    console.info('[Toast]', message, options)
  }

  success(message: string) {
    this.toast(message, { type: 'success' })
  }

  error(message: string) {
    this.toast(message, { type: 'error' })
  }

  warning(message: string) {
    this.toast(message, { type: 'warning' })
  }

  info(message: string) {
    this.toast(message, { type: 'info' })
  }
}

export const notification = new NotificationManager()



