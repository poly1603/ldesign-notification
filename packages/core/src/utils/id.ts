/**
 * ID 生成工具
 * @description 提供唯一 ID 生成功能
 */

/** ID 计数器 */
let idCounter = 0

/**
 * 生成唯一 ID
 * @param prefix - ID 前缀
 * @returns 唯一 ID 字符串
 * @example
 * ```ts
 * const id = generateId('toast')
 * // 返回: 'toast_1_1234567890'
 * ```
 */
export function generateId(prefix = 'notification'): string {
  return `${prefix}_${++idCounter}_${Date.now()}`
}

/**
 * 重置 ID 计数器
 * @description 主要用于测试
 */
export function resetIdCounter(): void {
  idCounter = 0
}

/**
 * 获取当前 ID 计数器值
 * @returns 当前计数器值
 */
export function getIdCounter(): number {
  return idCounter
}

