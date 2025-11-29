/**
 * DOM 工具函数
 * @description 提供 DOM 操作相关的工具函数
 */

/**
 * 检查是否在浏览器环境
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/**
 * 锁定页面滚动
 * @returns 解锁函数
 */
export function lockBodyScroll(): () => void {
  if (!isBrowser)
    return () => {}

  const body = document.body
  const originalStyle = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  }

  // 计算滚动条宽度
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

  body.style.overflow = 'hidden'
  if (scrollBarWidth > 0) {
    body.style.paddingRight = `${scrollBarWidth}px`
  }

  return () => {
    body.style.overflow = originalStyle.overflow
    body.style.paddingRight = originalStyle.paddingRight
  }
}

/**
 * 获取滚动条宽度
 * @returns 滚动条宽度（像素）
 */
export function getScrollBarWidth(): number {
  if (!isBrowser)
    return 0
  return window.innerWidth - document.documentElement.clientWidth
}

/**
 * 创建容器元素
 * @param id - 容器 ID
 * @param className - 容器类名
 * @returns 容器元素
 */
export function createContainer(id: string, className?: string): HTMLElement {
  if (!isBrowser) {
    throw new Error('createContainer can only be called in browser environment')
  }

  let container = document.getElementById(id)
  if (!container) {
    container = document.createElement('div')
    container.id = id
    if (className) {
      container.className = className
    }
    document.body.appendChild(container)
  }
  return container
}

/**
 * 移除容器元素
 * @param id - 容器 ID
 */
export function removeContainer(id: string): void {
  if (!isBrowser)
    return

  const container = document.getElementById(id)
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

/**
 * 获取焦点陷阱元素
 * @param container - 容器元素
 * @returns 可聚焦元素数组
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

/**
 * 创建焦点陷阱
 * @param container - 容器元素
 * @returns 清理函数
 */
export function createFocusTrap(container: HTMLElement): () => void {
  if (!isBrowser)
    return () => {}

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab')
      return

    const focusableElements = getFocusableElements(container)
    if (focusableElements.length === 0)
      return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    }
    else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * 计算元素位置
 * @param position - 位置字符串
 * @param offset - 偏移量
 * @returns CSS 样式对象
 */
export function getPositionStyle(
  position: string,
  offset: number = 0,
): Record<string, string> {
  const styles: Record<string, string> = {
    position: 'fixed',
  }

  const [vertical, horizontal] = position.split('-')

  // 垂直位置
  if (vertical === 'top') {
    styles.top = `${offset}px`
  }
  else if (vertical === 'bottom') {
    styles.bottom = `${offset}px`
  }
  else if (vertical === 'center') {
    styles.top = '50%'
    styles.transform = 'translateY(-50%)'
  }

  // 水平位置
  if (horizontal === 'left') {
    styles.left = `${offset}px`
  }
  else if (horizontal === 'right') {
    styles.right = `${offset}px`
  }
  else if (horizontal === 'center' || !horizontal) {
    styles.left = '50%'
    if (styles.transform) {
      styles.transform = 'translate(-50%, -50%)'
    }
    else {
      styles.transform = 'translateX(-50%)'
    }
  }

  return styles
}

