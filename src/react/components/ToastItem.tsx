/**
 * React - ToastItem Component
 */

import type { NotificationItem } from '../../types'
import React, { useMemo } from 'react'

interface ToastItemProps {
  item: NotificationItem
  onDismiss: (id: string) => void
}

export function ToastItem({ item, onDismiss }: ToastItemProps) {
  const classList = useMemo(
    () => ['ldesign-toast', `ldesign-toast--${item.variant}`, item.className].filter(Boolean).join(' '),
    [item.variant, item.className]
  )

  const showIcon = item.icon !== false

  const iconText = useMemo(() => {
    if (typeof item.icon === 'string') {
      return item.icon
    }

    const defaultIcons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳',
    }

    return defaultIcons[item.variant] || ''
  }, [item.icon, item.variant])

  const showProgress = item.duration > 0 && item.variant !== 'loading'

  const handleClick = () => {
    item.onClick(item.id)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss(item.id)
  }

  return (
    <div className={classList} data-id={item.id} style={item.style} onClick={handleClick}>
      <div className="ldesign-toast-content">
        {showIcon && (
          <span className={`ldesign-notification-icon${item.variant === 'loading' ? ' ldesign-notification-loading' : ''}`}>
            {iconText}
          </span>
        )}
        <div className="ldesign-toast-message">{item.message}</div>
      </div>
      {item.dismissible && (
        <button className="ldesign-notification-close" aria-label="Close" onClick={handleClose}>
          ×
        </button>
      )}
      {showProgress && (
        <div className="ldesign-notification-progress">
          <div
            className="ldesign-notification-progress-bar"
            style={{ animationDuration: `${item.duration}ms` }}
          />
        </div>
      )}
    </div>
  )
}



