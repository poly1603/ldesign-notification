/**
 * 动画引擎
 * 
 * @description
 * 基于 requestAnimationFrame 和 Web Animations API (WAAPI) 的高性能动画引擎
 * 
 * 特性：
 * - 使用 WAAPI 实现硬件加速动画
 * - RAF 调度器避免布局抖动
 * - 支持动画取消和中断
 * - 自定义缓动函数
 * - 性能监控（FPS 跟踪）
 */

import type { AnimationType } from '../types'
import { rafBatch } from '../utils/helpers'

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 动画类型 */
  type: AnimationType
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: string
  /** 延迟时间（毫秒） */
  delay?: number
  /** 填充模式 */
  fill?: FillMode
}

/**
 * 自定义关键帧接口
 */
export interface CustomKeyframes {
  /** 关键帧数组 */
  keyframes: Keyframe[]
  /** 动画选项 */
  options?: KeyframeAnimationOptions
}

/**
 * 动画统计信息
 */
interface AnimationStats {
  /** 总动画数 */
  total: number
  /** 活跃动画数 */
  active: number
  /** 平均 FPS */
  averageFps: number
  /** 最低 FPS */
  lowestFps: number
}

/**
 * 动画引擎类
 * 
 * @class AnimationEngine
 * @description 提供高性能的通知动画系统
 */
export class AnimationEngine {
  /** 默认动画持续时间（毫秒） */
  private readonly defaultDuration = 300

  /** 默认缓动函数 */
  private readonly defaultEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'

  /** 活跃动画映射 */
  private activeAnimations: Map<HTMLElement, Animation> = new Map()

  /** 自定义关键帧映射 */
  private customAnimations: Map<string, CustomKeyframes> = new Map()

  /** 性能监控数据 */
  private performanceData: {
    frames: number[]
    lastFrameTime: number
  } = {
      frames: [],
      lastFrameTime: 0,
    }

  /** 是否启用性能监控 */
  private performanceMonitoring = false

  constructor() {
    // 初始化性能监控
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      this.initPerformanceMonitoring()
    }
  }

  /**
   * 执行进入动画
   * 
   * @param element - 要动画的元素
   * @param config - 动画配置
   * @returns Promise<void>
   * 
   * @description
   * 使用 WAAPI 执行进入动画，自动清理之前的动画
   * 
   * @example
   * ```ts
   * await animationEngine.enter(element, {
   *   type: 'slideInTop',
   *   duration: 300,
   *   easing: 'ease-out'
   * })
   * ```
   */
  async enter(element: HTMLElement, config: AnimationConfig): Promise<void> {
    const {
      type,
      duration = this.defaultDuration,
      easing = this.defaultEasing,
      delay = 0,
      fill = 'forwards',
    } = config

    try {
      // 取消之前的动画
      this.cancel(element)

      // 检查是否有自定义动画
      if (type === 'custom') {
        const custom = this.customAnimations.get('enter')
        if (custom) {
          return this.playCustomAnimation(element, custom, duration, easing, delay)
        }
      }

      // 获取动画关键帧
      const keyframes = this.getEnterKeyframes(type)
      if (!keyframes) {
        console.warn(`[AnimationEngine] Unknown animation type: ${type}`)
        return
      }

      // 使用 WAAPI 播放动画
      const animation = element.animate(keyframes, {
        duration,
        easing,
        delay,
        fill,
      })

      // 保存动画引用
      this.activeAnimations.set(element, animation)

      // 等待动画完成
      await animation.finished

      // 清理动画引用
      this.activeAnimations.delete(element)
    }
    catch (error) {
      // 动画可能被取消或中断
      if (error.name !== 'AbortError') {
        console.error('[AnimationEngine] Enter animation failed:', error)
      }
      this.activeAnimations.delete(element)
    }
  }

  /**
   * 执行退出动画
   * 
   * @param element - 要动画的元素
   * @param config - 动画配置
   * @returns Promise<void>
   * 
   * @description
   * 使用 WAAPI 执行退出动画
   */
  async exit(element: HTMLElement, config: AnimationConfig): Promise<void> {
    const {
      type,
      duration = this.defaultDuration,
      easing = this.defaultEasing,
      delay = 0,
      fill = 'forwards',
    } = config

    try {
      // 取消之前的动画
      this.cancel(element)

      // 检查是否有自定义动画
      if (type === 'custom') {
        const custom = this.customAnimations.get('exit')
        if (custom) {
          return this.playCustomAnimation(element, custom, duration, easing, delay)
        }
      }

      // 获取动画关键帧
      const keyframes = this.getExitKeyframes(type)
      if (!keyframes) {
        console.warn(`[AnimationEngine] Unknown animation type: ${type}`)
        return
      }

      // 使用 WAAPI 播放动画
      const animation = element.animate(keyframes, {
        duration,
        easing,
        delay,
        fill,
      })

      // 保存动画引用
      this.activeAnimations.set(element, animation)

      // 等待动画完成
      await animation.finished

      // 清理动画引用
      this.activeAnimations.delete(element)
    }
    catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[AnimationEngine] Exit animation failed:', error)
      }
      this.activeAnimations.delete(element)
    }
  }

  /**
   * 取消元素的动画
   * 
   * @param element - HTML 元素
   * 
   * @description
   * 立即停止元素上的所有动画
   */
  cancel(element: HTMLElement): void {
    try {
      const animation = this.activeAnimations.get(element)
      if (animation) {
        animation.cancel()
        this.activeAnimations.delete(element)
      }
    }
    catch (error) {
      console.error('[AnimationEngine] Cancel animation failed:', error)
    }
  }

  /**
   * 取消所有动画
   * 
   * @description
   * 批量取消所有活跃的动画
   */
  cancelAll(): void {
    try {
      for (const [element, animation] of this.activeAnimations) {
        animation.cancel()
      }
      this.activeAnimations.clear()
    }
    catch (error) {
      console.error('[AnimationEngine] Cancel all animations failed:', error)
    }
  }

  /**
   * 暂停元素的动画
   * 
   * @param element - HTML 元素
   */
  pause(element: HTMLElement): void {
    try {
      const animation = this.activeAnimations.get(element)
      if (animation) {
        animation.pause()
      }
    }
    catch (error) {
      console.error('[AnimationEngine] Pause animation failed:', error)
    }
  }

  /**
   * 恢复元素的动画
   * 
   * @param element - HTML 元素
   */
  resume(element: HTMLElement): void {
    try {
      const animation = this.activeAnimations.get(element)
      if (animation) {
        animation.play()
      }
    }
    catch (error) {
      console.error('[AnimationEngine] Resume animation failed:', error)
    }
  }

  /**
   * 设置初始动画状态
   * 
   * @param element - HTML 元素
   * @param type - 动画类型
   * 
   * @description
   * 在动画开始前设置元素的初始状态，使用 RAF 批处理避免布局抖动
   */
  async setInitialState(element: HTMLElement, type: AnimationType): Promise<void> {
    await rafBatch(() => {
      const initialStyles = this.getInitialStyles(type)
      if (initialStyles) {
        Object.assign(element.style, initialStyles)
      }
    })
  }

  /**
   * 注册自定义动画
   * 
   * @param name - 动画名称（'enter' 或 'exit'）
   * @param keyframes - 关键帧配置
   * 
   * @description
   * 允许用户定义自己的动画效果
   * 
   * @example
   * ```ts
   * animationEngine.registerCustomAnimation('enter', {
   *   keyframes: [
   *     { opacity: 0, transform: 'scale(0.5)' },
   *     { opacity: 1, transform: 'scale(1)' }
   *   ]
   * })
   * ```
   */
  registerCustomAnimation(name: string, keyframes: CustomKeyframes): void {
    this.customAnimations.set(name, keyframes)
  }

  /**
   * 获取进入动画关键帧
   * 
   * @private
   * @param type - 动画类型
   * @returns 关键帧数组
   */
  private getEnterKeyframes(type: AnimationType): Keyframe[] | null {
    const keyframesMap: Partial<Record<AnimationType, Keyframe[]>> = {
      fadeIn: [
        { opacity: 0 },
        { opacity: 1 },
      ],
      slideInTop: [
        { opacity: 0, transform: 'translateY(-100%)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      slideInBottom: [
        { opacity: 0, transform: 'translateY(100%)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      slideInLeft: [
        { opacity: 0, transform: 'translateX(-100%)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      slideInRight: [
        { opacity: 0, transform: 'translateX(100%)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      zoomIn: [
        { opacity: 0, transform: 'scale(0.5)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      bounceIn: [
        { opacity: 0, transform: 'scale(0.3)' },
        { opacity: 1, transform: 'scale(1.05)', offset: 0.5 },
        { transform: 'scale(0.9)', offset: 0.7 },
        { opacity: 1, transform: 'scale(1)' },
      ],
      flipIn: [
        { opacity: 0, transform: 'perspective(400px) rotateX(90deg)' },
        { opacity: 1, transform: 'perspective(400px) rotateX(0deg)' },
      ],
      rotateIn: [
        { opacity: 0, transform: 'rotate(-90deg) scale(0)' },
        { opacity: 1, transform: 'rotate(0deg) scale(1)' },
      ],
    }

    return keyframesMap[type] || null
  }

  /**
   * 获取退出动画关键帧
   * 
   * @private
   * @param type - 动画类型
   * @returns 关键帧数组
   */
  private getExitKeyframes(type: AnimationType): Keyframe[] | null {
    const keyframesMap: Partial<Record<AnimationType, Keyframe[]>> = {
      fadeOut: [
        { opacity: 1 },
        { opacity: 0 },
      ],
      slideOutTop: [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-100%)' },
      ],
      slideOutBottom: [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(100%)' },
      ],
      slideOutLeft: [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(-100%)' },
      ],
      slideOutRight: [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(100%)' },
      ],
      zoomOut: [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.5)' },
      ],
      bounceOut: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)', offset: 0.3 },
        { opacity: 1, transform: 'scale(0.3)', offset: 0.7 },
        { opacity: 0, transform: 'scale(0)' },
      ],
      flipOut: [
        { opacity: 1, transform: 'perspective(400px) rotateX(0deg)' },
        { opacity: 0, transform: 'perspective(400px) rotateX(90deg)' },
      ],
      rotateOut: [
        { opacity: 1, transform: 'rotate(0deg) scale(1)' },
        { opacity: 0, transform: 'rotate(90deg) scale(0)' },
      ],
    }

    return keyframesMap[type] || null
  }

  /**
   * 获取初始样式
   * 
   * @private
   * @param type - 动画类型
   * @returns 样式对象
   */
  private getInitialStyles(type: AnimationType): Partial<CSSStyleDeclaration> | null {
    const stylesMap: Partial<Record<AnimationType, Partial<CSSStyleDeclaration>>> = {
      slideInTop: {
        opacity: '0',
        transform: 'translateY(-100%)',
      },
      slideInBottom: {
        opacity: '0',
        transform: 'translateY(100%)',
      },
      slideInLeft: {
        opacity: '0',
        transform: 'translateX(-100%)',
      },
      slideInRight: {
        opacity: '0',
        transform: 'translateX(100%)',
      },
      zoomIn: {
        opacity: '0',
        transform: 'scale(0.5)',
      },
      rotateIn: {
        opacity: '0',
        transform: 'rotate(-90deg) scale(0)',
      },
      fadeIn: {
        opacity: '0',
      },
    }

    return stylesMap[type] || null
  }

  /**
   * 播放自定义动画
   * 
   * @private
   * @param element - HTML 元素
   * @param custom - 自定义关键帧
   * @param duration - 持续时间
   * @param easing - 缓动函数
   * @param delay - 延迟
   * @returns Promise<void>
   */
  private async playCustomAnimation(
    element: HTMLElement,
    custom: CustomKeyframes,
    duration: number,
    easing: string,
    delay: number
  ): Promise<void> {
    try {
      const animation = element.animate(custom.keyframes, {
        ...custom.options,
        duration,
        easing,
        delay,
      })

      this.activeAnimations.set(element, animation)
      await animation.finished
      this.activeAnimations.delete(element)
    }
    catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[AnimationEngine] Custom animation failed:', error)
      }
      this.activeAnimations.delete(element)
    }
  }

  /**
   * 初始化性能监控
   * 
   * @private
   * @description
   * 使用 requestAnimationFrame 跟踪动画 FPS
   */
  private initPerformanceMonitoring(): void {
    if (!this.performanceMonitoring) {
      return
    }

    const measureFps = (timestamp: number) => {
      if (this.performanceData.lastFrameTime > 0) {
        const delta = timestamp - this.performanceData.lastFrameTime
        const fps = 1000 / delta

        // 保留最近 60 帧的数据
        this.performanceData.frames.push(fps)
        if (this.performanceData.frames.length > 60) {
          this.performanceData.frames.shift()
        }
      }

      this.performanceData.lastFrameTime = timestamp

      if (this.performanceMonitoring) {
        requestAnimationFrame(measureFps)
      }
    }

    requestAnimationFrame(measureFps)
  }

  /**
   * 启用性能监控
   * 
   * @description
   * 开始跟踪动画性能指标
   */
  enablePerformanceMonitoring(): void {
    this.performanceMonitoring = true
    this.initPerformanceMonitoring()
  }

  /**
   * 禁用性能监控
   */
  disablePerformanceMonitoring(): void {
    this.performanceMonitoring = false
    this.performanceData.frames = []
    this.performanceData.lastFrameTime = 0
  }

  /**
   * 获取性能统计
   * 
   * @returns 动画统计信息
   * 
   * @description
   * 返回动画系统的性能指标，用于调试和优化
   */
  getStats(): AnimationStats {
    const { frames } = this.performanceData
    const averageFps = frames.length > 0
      ? frames.reduce((sum, fps) => sum + fps, 0) / frames.length
      : 0
    const lowestFps = frames.length > 0
      ? Math.min(...frames)
      : 0

    return {
      total: this.activeAnimations.size,
      active: this.activeAnimations.size,
      averageFps: Math.round(averageFps),
      lowestFps: Math.round(lowestFps),
    }
  }

  /**
   * 获取活跃动画数量
   * 
   * @returns 活跃动画数量
   */
  getActiveCount(): number {
    return this.activeAnimations.size
  }

  /**
   * 检查元素是否有活跃动画
   * 
   * @param element - HTML 元素
   * @returns 是否有活跃动画
   */
  hasActiveAnimation(element: HTMLElement): boolean {
    return this.activeAnimations.has(element)
  }

  /**
   * 销毁动画引擎
   * 
   * @description
   * 清理所有资源
   */
  destroy(): void {
    this.cancelAll()
    this.customAnimations.clear()
    this.disablePerformanceMonitoring()
  }
}
