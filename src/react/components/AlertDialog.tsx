/**
 * React - AlertDialog Component
 */

import type { AlertOptions, NotificationItem } from '../../types'
import React, { useEffect, useMemo, useRef, useState } from 'react'

interface AlertDialogProps {
  item: NotificationItem
  onDismiss: (id: string) => void
}

export function AlertDialog({ item, onDismiss }: AlertDialogProps) {
  const options = useMemo(() => item.data as AlertOptions, [item.data])
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(options.inputValue || '')
  const [validationError, setValidationError] = useState('')

  const iconText = useMemo(() => {
    const iconMap: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      question: '?',
    }
    return iconMap[options.icon || ''] || ''
  }, [options.icon])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (options.allowEscapeKey !== false) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCancel()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [options.allowEscapeKey])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && options.allowOutsideClick !== false) {
      handleCancel()
    }
  }

  const handleConfirm = async () => {
    // 验证输入
    if (options.input && options.inputValidator) {
      const error = await options.inputValidator(inputValue)
      if (error) {
        setValidationError(error)
        return
      }
    }

    // preConfirm 钩子
    if (options.preConfirm) {
      try {
        await options.preConfirm(inputValue)
      }
      catch (error) {
        console.error('preConfirm error:', error)
        return
      }
    }

    options.onConfirm?.()
    onDismiss(item.id)
  }

  const handleCancel = () => {
    options.onCancel?.()
    onDismiss(item.id)
  }

  const handleDeny = () => {
    options.onDeny?.()
    onDismiss(item.id)
  }

  return (
    <div className="ldesign-alert-overlay" onClick={handleOverlayClick}>
      <div className="ldesign-alert" onClick={e => e.stopPropagation()}>
        {options.icon && (
          <div className={`ldesign-alert-icon ldesign-alert-icon--${options.icon}`}>{iconText}</div>
        )}

        {(item.title || options.title) && (
          <div className="ldesign-alert-title">{item.title || options.title}</div>
        )}

        {(item.message || options.text) && (
          <div className="ldesign-alert-text">{item.message || options.text}</div>
        )}

        {options.input && (
          <div>
            <input
              ref={inputRef}
              type={options.input}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={options.inputPlaceholder}
              className={`ldesign-alert-input${validationError ? ' ldesign-alert-input--error' : ''}`}
            />
            {validationError && <div className="ldesign-alert-validation">{validationError}</div>}
          </div>
        )}

        <div className="ldesign-alert-buttons">
          {options.showCancelButton && (
            <button className="ldesign-alert-button ldesign-alert-button--cancel" onClick={handleCancel}>
              {options.cancelButtonText || 'Cancel'}
            </button>
          )}

          {options.showDenyButton && (
            <button className="ldesign-alert-button ldesign-alert-button--deny" onClick={handleDeny}>
              {options.denyButtonText || 'No'}
            </button>
          )}

          {options.showConfirmButton !== false && (
            <button className="ldesign-alert-button ldesign-alert-button--confirm" onClick={handleConfirm}>
              {options.confirmButtonText || 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}



