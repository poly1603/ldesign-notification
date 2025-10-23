/**
 * React - NotificationContainer Component
 */

import type { NotificationItem, Position } from '../../types'
import React, { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNotification } from '../hooks/useNotification'
import { ToastItem } from './ToastItem'
import { MessageItem } from './MessageItem'
import { NotificationItem as NotificationItemComponent } from './NotificationItem'
import { AlertDialog } from './AlertDialog'

export function NotificationContainer() {
  const { notifications, dismiss } = useNotification()

  // 获取所有使用的位置
  const positions = useMemo<Position[]>(() => {
    const posSet = new Set<Position>()
    notifications.forEach(item => posSet.add(item.position))
    return Array.from(posSet)
  }, [notifications])

  // 根据位置获取通知
  const getItemsByPosition = (position: Position): NotificationItem[] => {
    return notifications.filter(item => item.position === position)
  }

  // 获取容器类名
  const getContainerClass = (position: Position): string => {
    return `ldesign-notification-container ldesign-notification-container--${position}`
  }

  // 根据类型获取组件
  const getComponentForType = (item: NotificationItem) => {
    const components = {
      toast: ToastItem,
      message: MessageItem,
      notification: NotificationItemComponent,
      alert: AlertDialog,
    }
    const Component = components[item.type]
    return <Component key={item.id} item={item} onDismiss={dismiss} />
  }

  return createPortal(
    <>
      {positions.map(position => (
        <div key={position} className={getContainerClass(position)} data-position={position}>
          {getItemsByPosition(position).map(item => getComponentForType(item))}
        </div>
      ))}
    </>,
    document.body
  )
}



