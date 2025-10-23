/**
 * 声音系统
 */

import type { NotificationVariant } from '../types'
import { isBrowser } from '../utils/helpers'

/**
 * 声音配置
 */
export interface SoundConfig {
  /** 音量 (0-1) */
  volume?: number
  /** 是否循环 */
  loop?: boolean
  /** 播放速率 */
  playbackRate?: number
}

/**
 * 声音映射
 */
export interface SoundMap {
  success?: string | HTMLAudioElement
  error?: string | HTMLAudioElement
  warning?: string | HTMLAudioElement
  info?: string | HTMLAudioElement
  loading?: string | HTMLAudioElement
  default?: string | HTMLAudioElement
}

/**
 * 声音管理器
 */
export class SoundManager {
  private enabled = false
  private muted = false
  private volume = 1.0
  private sounds: Map<NotificationVariant, HTMLAudioElement> = new Map()
  private audioContext?: AudioContext

  constructor() {
    this.enabled = isBrowser && 'Audio' in window

    if (this.enabled && 'AudioContext' in window) {
      this.audioContext = new AudioContext()
    }
  }

  /**
   * 检查是否支持
   */
  isSupported(): boolean {
    return this.enabled
  }

  /**
   * 设置声音映射
   */
  setSounds(soundMap: SoundMap): void {
    Object.entries(soundMap).forEach(([variant, sound]) => {
      if (typeof sound === 'string') {
        const audio = new Audio(sound)
        audio.volume = this.volume
        this.sounds.set(variant as NotificationVariant, audio)
      }
      else if (sound instanceof HTMLAudioElement) {
        sound.volume = this.volume
        this.sounds.set(variant as NotificationVariant, sound)
      }
    })
  }

  /**
   * 设置单个声音
   */
  setSound(variant: NotificationVariant, sound: string | HTMLAudioElement): void {
    if (typeof sound === 'string') {
      const audio = new Audio(sound)
      audio.volume = this.volume
      this.sounds.set(variant, audio)
    }
    else {
      sound.volume = this.volume
      this.sounds.set(variant, sound)
    }
  }

  /**
   * 播放声音
   */
  async play(variant: NotificationVariant, config?: SoundConfig): Promise<void> {
    if (!this.enabled || this.muted) {
      return
    }

    const audio = this.sounds.get(variant)
    if (!audio) {
      console.warn(`[SoundManager] No sound for variant: ${variant}`)
      return
    }

    try {
      // 应用配置
      if (config) {
        if (config.volume !== undefined) {
          audio.volume = Math.min(1, Math.max(0, config.volume * this.volume))
        }
        if (config.loop !== undefined) {
          audio.loop = config.loop
        }
        if (config.playbackRate !== undefined) {
          audio.playbackRate = config.playbackRate
        }
      }

      // 重置播放位置
      audio.currentTime = 0

      // 播放
      await audio.play()
    }
    catch (error) {
      console.error('[SoundManager] Play sound failed:', error)
    }
  }

  /**
   * 停止声音
   */
  stop(variant: NotificationVariant): void {
    const audio = this.sounds.get(variant)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  /**
   * 停止所有声音
   */
  stopAll(): void {
    this.sounds.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))
    this.sounds.forEach(audio => {
      audio.volume = this.volume
    })
  }

  /**
   * 获取音量
   */
  getVolume(): number {
    return this.volume
  }

  /**
   * 静音
   */
  mute(): void {
    this.muted = true
    this.sounds.forEach(audio => {
      audio.muted = true
    })
  }

  /**
   * 取消静音
   */
  unmute(): void {
    this.muted = false
    this.sounds.forEach(audio => {
      audio.muted = false
    })
  }

  /**
   * 切换静音
   */
  toggleMute(): boolean {
    if (this.muted) {
      this.unmute()
    }
    else {
      this.mute()
    }
    return this.muted
  }

  /**
   * 是否静音
   */
  isMuted(): boolean {
    return this.muted
  }

  /**
   * 预加载声音
   */
  async preload(variant: NotificationVariant): Promise<void> {
    const audio = this.sounds.get(variant)
    if (audio) {
      try {
        await audio.load()
      }
      catch (error) {
        console.error(`[SoundManager] Preload sound failed for ${variant}:`, error)
      }
    }
  }

  /**
   * 预加载所有声音
   */
  async preloadAll(): Promise<void> {
    const promises = Array.from(this.sounds.values()).map(audio => audio.load())
    await Promise.allSettled(promises)
  }

  /**
   * 使用 Web Audio API 播放（更精确的控制）
   */
  async playWithAudioContext(variant: NotificationVariant, config?: SoundConfig): Promise<void> {
    if (!this.audioContext || this.muted) {
      return
    }

    const audio = this.sounds.get(variant)
    if (!audio) {
      return
    }

    try {
      // 创建音频源
      const source = this.audioContext.createMediaElementSource(audio)
      const gainNode = this.audioContext.createGain()

      // 设置音量
      gainNode.gain.value = config?.volume !== undefined ? config.volume * this.volume : this.volume

      // 连接节点
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // 播放
      await audio.play()
    }
    catch (error) {
      console.error('[SoundManager] Play with AudioContext failed:', error)
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopAll()
    this.sounds.clear()

    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

// 导出单例
export const soundManager = new SoundManager()

// 默认声音 URL（可以自定义）
export const DEFAULT_SOUNDS: SoundMap = {
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVMRC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZZ7zs56FSEA1Npe/'
}



