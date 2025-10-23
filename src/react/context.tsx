/**
 * React Context for Notification Manager
 */

import type { NotificationManagerConfig } from '../types'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { NotificationManager } from '../core/manager'

/**
 * Context Value
 */
export interface NotificationContextValue {
  manager: NotificationManager
}

/**
 * Notification Context
 */
export const NotificationContext = createContext<NotificationContextValue | null>(null)

/**
 * Provider Props
 */
export interface NotificationProviderProps {
  children: React.ReactNode
  config?: NotificationManagerConfig
}

/**
 * Notification Provider
 */
export function NotificationProvider({ children, config }: NotificationProviderProps) {
  const managerRef = useRef<NotificationManager>()

  if (!managerRef.current) {
    managerRef.current = new NotificationManager(config)
  }

  useEffect(() => {
    return () => {
      managerRef.current?.destroy()
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ manager: managerRef.current }}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Use Notification Context
 */
export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }

  return context
}



