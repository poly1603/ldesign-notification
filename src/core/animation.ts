/**
 * 动画引擎
 */

import type { AnimationType } from '../types'

/**
 * 动画配置
 */
export interface AnimationConfig {
  type: AnimationType
  duration?: number
  easing?: string
  delay?: number
}

/**
 * 动画引擎类
 */
export class AnimationEngine {
  private defaultDuration = 300
  private defaultEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'

  /**
   * 执行进入动画
   */
  async enter(element: HTMLElement, config: AnimationConfig): Promise<void> {
    const {
      type,
      duration = this.defaultDuration,
      easing = this.defaultEasing,
      delay = 0,
    } = config

    return new Promise((resolve) => {
      // 设置初始状态
      element.style.opacity = '0'
      element.style.transition = `all ${duration}ms ${easing} ${delay}ms`

      // 应用进入动画
      requestAnimationFrame(() => {
        this.applyEnterAnimation(element, type)

        setTimeout(() => {
          resolve()
        }, duration + delay)
      })
    })
  }

  /**
   * 执行退出动画
   */
  async exit(element: HTMLElement, config: AnimationConfig): Promise<void> {
    const {
      type,
      duration = this.defaultDuration,
      easing = this.defaultEasing,
      delay = 0,
    } = config

    return new Promise((resolve) => {
      element.style.transition = `all ${duration}ms ${easing} ${delay}ms`

      requestAnimationFrame(() => {
        this.applyExitAnimation(element, type)

        setTimeout(() => {
          resolve()
        }, duration + delay)
      })
    })
  }

  /**
   * 应用进入动画
   */
  private applyEnterAnimation(element: HTMLElement, type: AnimationType): void {
    element.style.opacity = '1'

    switch (type) {
      case 'fadeIn':
        // 已经在上面设置了 opacity
        break

      case 'slideInTop':
        element.style.transform = 'translateY(0)'
        break

      case 'slideInBottom':
        element.style.transform = 'translateY(0)'
        break

      case 'slideInLeft':
        element.style.transform = 'translateX(0)'
        break

      case 'slideInRight':
        element.style.transform = 'translateX(0)'
        break

      case 'zoomIn':
        element.style.transform = 'scale(1)'
        break

      case 'bounceIn':
        element.style.animation = 'ldesign-bounceIn 0.6s'
        break

      case 'flipIn':
        element.style.animation = 'ldesign-flipIn 0.6s'
        break

      case 'rotateIn':
        element.style.transform = 'rotate(0deg) scale(1)'
        break

      default:
        element.style.opacity = '1'
    }
  }

  /**
   * 应用退出动画
   */
  private applyExitAnimation(element: HTMLElement, type: AnimationType): void {
    switch (type) {
      case 'fadeOut':
        element.style.opacity = '0'
        break

      case 'slideOutTop':
        element.style.transform = 'translateY(-100%)'
        element.style.opacity = '0'
        break

      case 'slideOutBottom':
        element.style.transform = 'translateY(100%)'
        element.style.opacity = '0'
        break

      case 'slideOutLeft':
        element.style.transform = 'translateX(-100%)'
        element.style.opacity = '0'
        break

      case 'slideOutRight':
        element.style.transform = 'translateX(100%)'
        element.style.opacity = '0'
        break

      case 'zoomOut':
        element.style.transform = 'scale(0)'
        element.style.opacity = '0'
        break

      case 'bounceOut':
        element.style.animation = 'ldesign-bounceOut 0.6s'
        break

      case 'flipOut':
        element.style.animation = 'ldesign-flipOut 0.6s'
        break

      case 'rotateOut':
        element.style.transform = 'rotate(90deg) scale(0)'
        element.style.opacity = '0'
        break

      default:
        element.style.opacity = '0'
    }
  }

  /**
   * 设置初始动画状态
   */
  setInitialState(element: HTMLElement, type: AnimationType): void {
    switch (type) {
      case 'slideInTop':
        element.style.transform = 'translateY(-100%)'
        break

      case 'slideInBottom':
        element.style.transform = 'translateY(100%)'
        break

      case 'slideInLeft':
        element.style.transform = 'translateX(-100%)'
        break

      case 'slideInRight':
        element.style.transform = 'translateX(100%)'
        break

      case 'zoomIn':
        element.style.transform = 'scale(0)'
        break

      case 'rotateIn':
        element.style.transform = 'rotate(-90deg) scale(0)'
        break
    }
  }
}



