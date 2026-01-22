/**
 * Server 端工具函数
 * 提供服务器端常用的工具方法
 */

import type { ServerResponse, ApiError } from '@server/types'

/**
 * 创建标准化的成功响应
 * @param data - 响应数据
 * @param message - 成功消息
 * @returns 标准化的成功响应
 */
export function createSuccessResponse<T>(data: T, _message: string = '操作成功'): ServerResponse<T> {
  return {
    data
  }
}

/**
 * 创建标准化的错误响应
 * @param error - 错误信息
 * @param code - 错误代码
 * @returns 标准化的错误响应
 */
export function createErrorResponse(error: string, _code: string = 'UNKNOWN_ERROR'): ServerResponse {
  return {
    data: null
  }
}

/**
 * 创建 API 错误对象
 * @param code - 错误代码
 * @param message - 错误消息
 * @param details - 错误详情
 * @returns API 错误对象
 */
export function createApiError(code: string, message: string, details?: any): ApiError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  }
}

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 * @param password - 密码
 * @returns 密码强度评分 (0-100)
 */
export function validatePasswordStrength(password: string): number {
  let score = 0

  // 长度检查
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10

  // 字符类型检查
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^a-zA-Z0-9]/.test(password)) score += 20

  // 复杂度检查
  if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    score += 20
  }

  return Math.min(score, 100)
}

/**
 * 生成随机字符串
 * @param length - 字符串长度
 * @param charset - 字符集
 * @returns 随机字符串
 */
export function generateRandomString(
  length: number = 32,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 深度克隆对象
 * @param obj - 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const clonedObj = {} as any
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 延迟执行
 * @param ms - 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试机制
 * @param fn - 要重试的函数
 * @param maxAttempts - 最大重试次数
 * @param delayMs - 重试间隔毫秒数
 * @returns Promise
 */
export async function retry<T>(fn: () => Promise<T>, maxAttempts: number = 3, delayMs: number = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        throw lastError
      }

      await delay(delayMs * attempt) // 递增延迟
    }
  }

  throw lastError!
}
