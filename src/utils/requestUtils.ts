/**
 * 请求工具函数
 * 包含防抖、节流、缓存等功能
 */

// 缓存存储
const requestCache = new Map<string, { data: any; timestamp: number }>()

// 进行中的请求
const pendingRequests = new Map<string, Promise<any>>()

/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param delay 间隔时间(毫秒)
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timer: NodeJS.Timeout | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * 生成缓存键
 */
function generateCacheKey(url: string, params?: any): string {
  return `${url}:${JSON.stringify(params || {})}`
}

/**
 * 带缓存的请求包装器
 * @param requestFn 原始请求函数
 * @param cacheTime 缓存时间(毫秒)，默认30秒
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  requestFn: T,
  cacheTime: number = 30000
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = generateCacheKey(requestFn.name, args)
    const cached = requestCache.get(cacheKey)
    
    // 如果有有效缓存，直接返回
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data
    }
    
    // 执行请求
    const result = await requestFn(...args)
    
    // 存入缓存
    requestCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })
    
    return result
  }) as T
}

/**
 * 防重复请求包装器
 * 同一时间只允许一个相同请求进行
 * @param requestFn 原始请求函数
 * @param keyGenerator 生成唯一键的函数
 */
export function withDedup<T extends (...args: any[]) => Promise<any>>(
  requestFn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator 
      ? keyGenerator(...args) 
      : generateCacheKey(requestFn.name, args)
    
    // 如果有进行中的相同请求，返回该请求的 Promise
    const pending = pendingRequests.get(key)
    if (pending) {
      return pending
    }
    
    // 创建新请求
    const promise = requestFn(...args).finally(() => {
      pendingRequests.delete(key)
    })
    
    pendingRequests.set(key, promise)
    return promise
  }) as T
}

/**
 * 清除指定缓存
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    requestCache.clear()
    return
  }
  
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key)
    }
  }
}

/**
 * React Hook: 防抖值
 * 用于搜索输入等场景
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  // 这个 hook 需要在组件中导入 useState 和 useEffect 使用
  // 为了保持纯函数，这里只提供类型定义
  // 实际使用时在组件中实现
  return value
}

/**
 * 创建带防抖的 API 调用函数
 * @param apiFn API 函数
 * @param delay 防抖延迟
 */
export function createDebouncedApi<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  delay: number = 300
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  let timer: NodeJS.Timeout | null = null
  let resolveRef: ((value: any) => void) | null = null
  
  return (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    return new Promise((resolve) => {
      if (timer) {
        clearTimeout(timer)
        // 取消之前的请求
        if (resolveRef) {
          resolveRef(undefined)
        }
      }
      
      resolveRef = resolve
      timer = setTimeout(async () => {
        const result = await apiFn(...args)
        resolve(result)
        timer = null
        resolveRef = null
      }, delay)
    })
  }
}

/**
 * 创建带节流的 API 调用函数（防止重复提交）
 * @param apiFn API 函数
 * @param delay 节流间隔
 */
export function createThrottledApi<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  delay: number = 1000
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  let lastCallTime = 0
  let isProcessing = false
  
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    const now = Date.now()
    
    // 如果正在处理中或距离上次调用时间不足，返回 null
    if (isProcessing || now - lastCallTime < delay) {
      console.warn('请求被节流，请稍后再试')
      return null
    }
    
    isProcessing = true
    lastCallTime = now
    
    try {
      return await apiFn(...args)
    } finally {
      isProcessing = false
    }
  }
}
