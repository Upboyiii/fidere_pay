/**
 * 简化的 HTTP 客户端模块
 * 提供基础的 HTTP 请求功能
 */

// React Imports
import { useCallback, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

// Server Imports
import type { ServerResponse } from '@server/types'
import { SERVER_CONFIG } from '@server/config'

// Utils Imports
import { TokenManager } from '@/utils/tokenManager'
import { getLocalizedUrl } from '@/utils/i18n'
import { i18n } from '@configs/i18n'

const LOCAL_CONFIG = {
  // zh-cn  en  zh-tw
  'zh-CN': 'zh-cn',
  en: 'en',
  'zh-Hant': 'zh-tw'
}

/**
 * HTTP 请求错误类
 * 用于标识 HTTP 相关的业务错误，不应触发 ErrorBoundary
 */
export class HttpError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HttpError'
    // 确保 instanceof 检查正常工作
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

/**
 * 从当前路径中提取语言代码
 * @returns 语言代码，如果未找到则返回默认语言
 */
export function getCurrentLocale(): string {
  if (typeof window === 'undefined') {
    return i18n.defaultLocale
  }

  const pathname = window.location.pathname
  // 匹配路径中的语言前缀，格式为 /[lang]/...
  // 支持格式：zh-CN, zh-Hant, en 等
  // 语言代码：2个小写字母，可选的后缀：- 后跟大写字母开头的字母组合
  const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/)

  if (localeMatch && i18n.locales.includes(localeMatch[1] as any)) {
    return localeMatch[1]
  }

  return i18n.defaultLocale
}

/**
 * 请求配置
 */
interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

/**
 * 请求选项
 */
interface RequestOptions extends RequestInit {
  timeout?: number
  params?: any
}

/**
 * 请求响应
 */
interface RequestResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

/**
 * 全局配置
 */
let globalConfig: RequestConfig = {
  baseURL: SERVER_CONFIG.API.BASE_URL,
  timeout: SERVER_CONFIG.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * 初始化全局错误处理器
 * 在模块加载时立即注册，确保在所有请求之前就生效
 */
let isGlobalErrorHandlerInitialized = false
function initGlobalErrorHandler() {
  if (typeof window === 'undefined' || isGlobalErrorHandlerInitialized) {
    return
  }

  // 添加全局未处理的 Promise rejection 处理器
  // 使用 capture 模式确保优先拦截，避免触发 ErrorBoundary 和 Next.js 错误覆盖层
  window.addEventListener(
    'unhandledrejection',
    event => {
      const error = event.reason
      // 检查是否为 HttpError
      const isHttpError =
        error instanceof HttpError ||
        error?.name === 'HttpError' ||
        error?.constructor?.name === 'HttpError' ||
        // 检查错误消息（兜底方案）
        (error && typeof error === 'object' && 'message' in error
          ? ['网络异常', '网络请求失败', '请求失败'].some(msg => String(error.message || '').includes(msg))
          : false) ||
        // 检查错误堆栈（额外的识别方式）
        (error?.stack && typeof error.stack === 'string'
          ? error.stack.includes('http.ts') || error.stack.includes('@server/http')
          : false)

      if (isHttpError) {
        event.preventDefault()
        event.stopPropagation()
        // 只记录错误，不抛出
        const errorMessage = error?.message || error?.toString() || '未知 HTTP 错误'
        console.warn('未处理的 HTTP 请求错误（已被拦截，不会触发 ErrorBoundary）:', errorMessage)
      }
    },
    { capture: true }
  )

  isGlobalErrorHandlerInitialized = true
}

// 立即初始化全局错误处理器
if (typeof window !== 'undefined') {
  initGlobalErrorHandler()
}

/**
 * 设置基础配置
 */
export function setConfig(config: RequestConfig) {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * 发送请求
 */
async function request<T = any>(url: string, options: RequestOptions = {}): Promise<RequestResponse<T>> {
  // 处理 URL 拼接，避免双斜杠
  let fullUrl: string
  if (url.startsWith('http')) {
    fullUrl = url
  } else {
    const baseURL = globalConfig.baseURL || ''
    // 如果 baseURL 是 '/' 或 url 以 '/' 开头，直接拼接（避免双斜杠）
    if (baseURL === '/' || url.startsWith('/')) {
      fullUrl = baseURL === '/' ? url : `${baseURL}${url}`
    } else {
      // 确保 baseURL 和 url 之间有一个 '/'
      const separator = baseURL.endsWith('/') ? '' : '/'
      fullUrl = `${baseURL}${separator}${url}`
    }
  }

  // 获取有效的 access token
  let accessToken: string | null = null
  try {
    const tokens = TokenManager.getTokens()
    accessToken = tokens?.accessToken || null
  } catch (error) {
    console.warn('获取 access token 失败:', error)
  }

  // 合并配置
  const config: RequestOptions = {
    ...options,
    headers: {
      ...globalConfig.headers,
      ...options.headers,
      // 如果有 access token，添加到请求头
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      'Accept-Language': LOCAL_CONFIG?.[getCurrentLocale?.() as keyof typeof LOCAL_CONFIG]
    },
    timeout: options.timeout || globalConfig.timeout
  }

  // 如果是 FormData，删除 Content-Type，让浏览器自动设置（包含 boundary）
  if (options.body instanceof FormData && config.headers) {
    delete (config.headers as any)['Content-Type']
  }

  // 获取有效的超时时间（默认30秒）
  const timeoutMs = config.timeout || globalConfig.timeout || 30000

  // 发送请求
  const controller = new AbortController()
  let timeoutId: NodeJS.Timeout | null = null

  try {
    // 从config中移除不支持的选项，只保留fetch支持的选项
    const { timeout, ...fetchOptions } = config

    // 设置超时
    timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        controller.abort('请求超时')
      }
    }, timeoutMs)

    const response = await fetch(fullUrl, {
      ...fetchOptions,
      signal: controller.signal
    })

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    // 如果返回 401 未授权，尝试刷新 token 后重试
    // if (response.status === 401 && accessToken) {
    //   try {
    //     const { TokenManager } = await import('@/utils/tokenManager')
    //     const tokens = TokenManager.getTokens()
    //     if (tokens?.refreshToken) {
    //       const refreshedTokens = await TokenManager.refreshToken(tokens.refreshToken)
    //       if (refreshedTokens) {
    //         // 使用新的 token 重试请求
    //         const retryConfig: RequestOptions = {
    //           ...config,
    //           headers: {
    //             ...config.headers,
    //             Authorization: `Bearer ${refreshedTokens.accessToken}`
    //           }
    //         }

    //         const retryResponse = await fetch(fullUrl, {
    //           ...retryConfig,
    //           signal: controller.signal
    //         })

    //         const retryData = await retryResponse.json().catch(() => null)

    //         return {
    //           data: retryData,
    //           status: retryResponse.status,
    //           statusText: retryResponse.statusText,
    //           headers: retryResponse.headers
    //         }
    //       }
    //     }
    //   } catch (refreshError) {
    //     console.error('Token 刷新失败:', refreshError)
    //     // 刷新失败，清除本地 token
    //     try {
    //       const { TokenManager } = await import('@/utils/tokenManager')
    //       TokenManager.clearTokens()
    //     } catch (clearError) {
    //       console.error('清除 token 失败:', clearError)
    //     }
    //   }
    // }

    const data = await response.json().catch(() => null)
    if (!data) {
      return Promise.reject(new HttpError('网络异常'))
    }

    // 检查返回数据的 code 字段，判断是否为错误状态
    if (data && typeof data === 'object' && 'code' in data) {
      const code = data.code
      // code 为 200 或 0 表示成功，其他值表示失败
      if (code !== 200 && code !== 0) {
        // token 失效，执行退出登录流程
        if (code == 401) {
          try {
            // 清除本地存储的 token
            TokenManager.clearTokens()

            // 清除其他 localStorage 数据
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userRole')
              // 清除验证码状态
              sessionStorage.setItem('resetCaptcha', 'true')
            }

            // 清除 session 并退出登录
            await signOut({
              redirect: false,
              callbackUrl: '/login'
            })

            // 跳转到登录页面（保留语言前缀）
            if (typeof window !== 'undefined') {
              const locale = getCurrentLocale()
              const loginUrl = getLocalizedUrl('/login', locale)
              window.location.href = loginUrl
            }
          } catch (error) {
            console.error('退出登录处理失败:', error)
            // 如果退出登录失败，仍然尝试清除本地存储并跳转
            if (typeof window !== 'undefined') {
              try {
                TokenManager.clearTokens()
                localStorage.removeItem('userRole')
                const locale = getCurrentLocale()
                const loginUrl = getLocalizedUrl('/login', locale)
                window.location.href = loginUrl
              } catch (fallbackError) {
                console.error('退出登录 fallback 处理失败:', fallbackError)
              }
            }
          }
        }
        const errorMessage = data.message || data.msg || '请求失败'
        return Promise.reject(new HttpError(errorMessage))
      }

      // 检查嵌套的 data.code（部分接口会在 data.data.code 中返回实际的 code）
      if (data.data && typeof data.data === 'object' && 'code' in data.data) {
        const nestedCode = data.data.code
        if (nestedCode !== 200 && nestedCode !== 0) {
          const errorMessage = data.data.message || data.data.msg || data.message || '请求失败'
          return Promise.reject(new HttpError(errorMessage))
        }
      }
    }

    return {
      data: data,
      status: response?.status,
      statusText: response.statusText,
      headers: response.headers
    }
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    // 将网络错误转换为 HttpError，避免触发 ErrorBoundary
    if (error instanceof HttpError) {
      return Promise.reject(error)
    }
    // 处理超时错误或其他网络错误
    const errorMessage = error instanceof Error ? error.message : '网络请求失败'
    return Promise.reject(new HttpError(errorMessage))
  }
}

/**
 * GET 请求
 */
export async function get<T = any>(url: string, options: RequestOptions = {}): Promise<RequestResponse<T>> {
  return request<T>(url, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export async function post<T = any>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<RequestResponse<T>> {
  return request<T>(url, {
    ...options,
    method: 'POST',
    // 如果是 FormData，直接传递，不要 stringify
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined
  })
}

/**
 * PUT 请求
 */
export async function put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<RequestResponse<T>> {
  return request<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })
}

/**
 * DELETE 请求
 */
export async function del<T = any>(url: string, options: RequestOptions = {}): Promise<RequestResponse<T>> {
  return request<T>(url, { ...options, method: 'DELETE' })
}

/**
 * PATCH 请求
 */
export async function patch<T = any>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<RequestResponse<T>> {
  return request<T>(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined
  })
}

/**
 * 客户端请求函数（返回 ServerResponse 格式）
 */
async function clientRequestInternal<T = any>(url: string, options: RequestOptions = {}): Promise<ServerResponse<T>> {
  // 直接调用 request，让错误抛出到外层处理
  const response = await request<T>(url, options)

  // 处理嵌套数据，提取实际业务数据
  // 接口返回格式可能是：{ code, data: { key, img }, message }
  // 需要提取内层的 data 作为业务数据
  type NestedData = { data?: T } & T

  const resultData =
    response.data && typeof response.data === 'object' && 'data' in response.data
      ? ((response.data as NestedData).data ?? response.data)
      : (response.data as T)

  return {
    // success: true,
    data: resultData
    // message: 'Success'
  }
}

/**
 * 将对象转换为查询字符串
 */
function buildQueryString(params: any): string {
  if (!params || typeof params !== 'object') {
    return ''
  }

  const parts: string[] = []

  Object.keys(params).forEach(key => {
    const value = params[key]
    // 跳过 undefined 和 null 值
    if (value !== undefined && value !== null && value !== '') {
      // 对于 keyword 参数，使用 encodeURIComponent 确保空格被编码为 %20 而不是 +
      // 这样可以避免后端将 + 误解为加号字符
      if (key === 'keyword' && typeof value === 'string') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      } else {
        // 其他参数使用 URLSearchParams 的标准编码
        const searchParams = new URLSearchParams()
        searchParams.append(key, String(value))
        parts.push(searchParams.toString())
      }
    }
  })

  return parts.join('&')
}

/**
 * 客户端 GET 请求
 */
export async function clientGet<T = any>(url: string, options: RequestOptions = {}): Promise<ServerResponse<T>> {
  // 提取 params
  const { params, ...restOptions } = options

  // 如果有 params，将其转换为查询字符串并拼接到 URL
  let finalUrl = url
  if (params) {
    const queryString = buildQueryString(params)
    if (queryString) {
      // 判断 URL 中是否已包含查询参数
      const separator = url.includes('?') ? '&' : '?'
      finalUrl = `${url}${separator}${queryString}`
    }
  }

  return clientRequestInternal<T>(finalUrl, { ...restOptions, method: 'GET' })
}

/**
 * 客户端 POST 请求
 */
export async function clientPost<T = any>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ServerResponse<T>> {
  return clientRequestInternal<T>(url, {
    ...options,
    method: 'POST',
    // 如果是 FormData，直接传递，不要 stringify
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined
  })
}

/**
 * 客户端 PUT 请求
 */
export async function clientPut<T = any>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ServerResponse<T>> {
  return clientRequestInternal<T>(url, {
    ...options,
    method: 'PUT',
    // 如果是 FormData，直接传递，不要 stringify
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined
  })
}

/**
 * 客户端 DELETE 请求
 */
export async function clientDel<T = any>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ServerResponse<T>> {
  // 提取 params
  const { params, ...restOptions } = options

  // 如果有 params，将其转换为查询字符串并拼接到 URL
  let finalUrl = url
  if (params) {
    const queryString = buildQueryString(params)
    if (queryString) {
      // 判断 URL 中是否已包含查询参数
      const separator = url.includes('?') ? '&' : '?'
      finalUrl = `${url}${separator}${queryString}`
    }
  }

  return clientRequestInternal<T>(finalUrl, { ...restOptions, method: 'DELETE', body: data ? JSON.stringify(data) : undefined })
}

/**
 * 客户端 PATCH 请求
 */
export async function clientPatch<T = any>(
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ServerResponse<T>> {
  return clientRequestInternal<T>(url, {
    ...options,
    method: 'PATCH',
    // 如果是 FormData，直接传递，不要 stringify
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined
  })
}

/**
 * Token 管理 Hook
 * 用于处理客户端 token 刷新和请求拦截
 */
export const useTokenManager = () => {
  const { data: session, update } = useSession()
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  // /**
  //  * 刷新 token
  //  */
  // const refreshToken = useCallback(async () => {
  //   try {
  //     if (!(session as any)?.refreshToken) {
  //       throw new Error('没有 refresh token')
  //     }

  //     const response = await fetch('/_auth/refresh', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         refreshToken: (session as any).refreshToken
  //       })
  //     })

  //     if (!response.ok) {
  //       throw new Error('Token 刷新失败')
  //     }

  //     const data = await response.json()

  //     // 更新会话
  //     await update({
  //       accessToken: data.data.accessToken,
  //       refreshToken: data.data.refreshToken,
  //       accessTokenExpires: Date.now() + data.data.expiresIn * 1000
  //     })

  //     return data.data.accessToken
  //   } catch (error) {
  //     console.error('Token 刷新错误:', error)
  //     // 刷新失败，登出用户
  //     await signOut({ redirect: false })
  //     throw error
  //   }
  // }, [(session as any)?.refreshToken, update])

  // /**
  //  * 设置自动刷新定时器
  //  */
  // const setupAutoRefresh = useCallback(() => {
  //   if (!(session as any)?.accessTokenExpires) return

  //   // 清除现有定时器
  //   if (refreshTimeoutRef.current) {
  //     clearTimeout(refreshTimeoutRef.current)
  //   }

  //   // 计算刷新时间（提前 5 分钟）
  //   const refreshTime = (session as any).accessTokenExpires - Date.now() - 5 * 60 * 1000

  //   if (refreshTime > 0) {
  //     refreshTimeoutRef.current = setTimeout(async () => {
  //       try {
  //         await refreshToken()
  //         setupAutoRefresh() // 重新设置定时器
  //       } catch (error) {
  //         console.error('自动刷新失败:', error)
  //       }
  //     }, refreshTime)
  //   }
  // }, [(session as any)?.accessTokenExpires, refreshToken])

  // // 设置自动刷新
  // useEffect(() => {
  //   setupAutoRefresh()

  //   return () => {
  //     if (refreshTimeoutRef.current) {
  //       clearTimeout(refreshTimeoutRef.current)
  //     }
  //   }
  // }, [setupAutoRefresh])

  return {
    // refreshToken,
    isAuthenticated: !!(session as any)?.accessToken
  }
}

/**
 * 初始化客户端配置
 */
export function initClient() {
  // 设置基础配置
  setConfig({
    baseURL: '/',
    timeout: SERVER_CONFIG.API.TIMEOUT
  })

  // 确保全局错误处理器已初始化
  initGlobalErrorHandler()
}

/**
 * 导出客户端请求函数
 */
export const clientRequest = {
  get: clientGet,
  post: clientPost,
  put: clientPut,
  delete: clientDel,
  patch: clientPatch
}
