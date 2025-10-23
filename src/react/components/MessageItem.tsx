/**
 * React - MessageItem Component
 */

import type { NotificationItem } from '../../types'
import React, { useMemo } from 'react'

interface MessageItemProps {
  item: NotificationItem
  onDismiss: (id: string) => void
}

export function MessageItem({ item, onDismiss }: MessageItemProps) {
  const classList = useMemo(() => {
    const classes = ['ldesign-message', `ldesign-message--${item.variant}`, item.className]
    if (item.data?.center) {
      classes.push('ldesign-message--center')
    }
    return classes.filter(Boolean).join(' ')
  }, [item.variant, item.className, item.data?.center])

  const showIcon = item.icon !== false
  const showClose = item.data?.showClose === true

  const iconText = useMemo(() => {
    if (typeof item.icon === 'string') {
      return item.icon
    }

    const defaultIcons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    }

    return defaultIcons[item.variant] || ''
  }, [item.icon, item.variant])

  const handleClick = () => {
    item.onClick(item.id)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss(item.id)
  }

  return (
    <div className={classList} data-id={item.id} style={item.style} onClick={handleClick}>
      <div className="ldesign-message-content">
        {showIcon && <span className="ldesign-notification-icon">{iconText}</span>}
        <span className="ldesign-message-text">{item.message}</span>
      </div>
      {showClose && (
        <button className="ldesign-notification-close" aria-label="Close" onClick={handleClose}>
          ×
        </button>
      )}
    </div>
  )
}



