/**
 * Server 端类型定义
 * 用于 Server Actions 和 API 路由的类型约束
 */

// 基础响应类型

export interface ServerResponse<T = any> {
  // success: boolean
  data?:
    | {
        data?: T
        code: number
        message: string
      }
    | T
  // error?: string
  // message?: string
}

// 分页响应类型

export interface PaginatedResponse<T> extends ServerResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 认证相关类型
export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expires: Date
}

// Server Action 装饰器类型
export type ServerAction<T extends any[], R> = (...args: T) => Promise<R>

// 数据库操作类型
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

// API 错误类型
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// 日志类型
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  userId?: string
  action?: string
  metadata?: Record<string, any>
}
