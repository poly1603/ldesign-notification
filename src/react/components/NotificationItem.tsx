/**
 * React - NotificationItem Component
 */

import type { NotificationAction, NotificationItem as NotificationItemType } from '../../types'
import React, { useMemo } from 'react'

interface NotificationItemProps {
  item: NotificationItemType
  onDismiss: (id: string) => void
}

export function NotificationItem({ item, onDismiss }: NotificationItemProps) {
  const classList = useMemo(
    () => ['ldesign-notification', `ldesign-notification--${item.variant}`, item.className].filter(Boolean).join(' '),
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
    }

    return defaultIcons[item.variant] || ''
  }, [item.icon, item.variant])

  const actions = useMemo(() => item.data?.actions as NotificationAction[] | undefined, [item.data?.actions])

  const handleClick = () => {
    item.onClick(item.id)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss(item.id)
  }

  const handleAction = (action: NotificationAction) => (e: React.MouseEvent) => {
    e.stopPropagation()
    action.onClick(item.id)
    if (action.closeOnClick !== false) {
      onDismiss(item.id)
    }
  }

  const getActionClass = (action: NotificationAction) => {
    const classes = ['ldesign-notification-button']
    if (action.type) {
      classes.push(`ldesign-notification-button--${action.type}`)
    }
    return classes.join(' ')
  }

  return (
    <div className={classList} data-id={item.id} style={item.style} onClick={handleClick}>
      <div className="ldesign-notification-header">
        {showIcon && <span className="ldesign-notification-icon">{iconText}</span>}
        <div className="ldesign-notification-header-content">
          {item.title && <div className="ldesign-notification-title">{item.title}</div>}
          <div className="ldesign-notification-message">{item.message}</div>
        </div>
        {item.dismissible && (
          <button className="ldesign-notification-close" aria-label="Close" onClick={handleClose}>
            ×
          </button>
        )}
      </div>
      {actions && actions.length > 0 && (
        <div className="ldesign-notification-actions">
          {actions.map((action, index) => (
            <button key={index} className={getActionClass(action)} onClick={handleAction(action)}>
              {action.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}



