'use client'

// 全局loading状态
let globalLoadingState = false
let globalLoadingCallbacks: Array<(loading: boolean) => void> = []
let loadingTimeout: NodeJS.Timeout | null = null

/**
 * 全局路由loading管理器
 */
export const RouteLoadingManager = {
  // 开始loading
  start: () => {
    // 如果已经在loading，不重复触发
    if (globalLoadingState) return

    globalLoadingState = true
    globalLoadingCallbacks.forEach(callback => callback(true))

    // 清除之前的定时器
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
    }
  },

  // 结束loading
  stop: () => {
    globalLoadingState = false
    globalLoadingCallbacks.forEach(callback => callback(false))

    // 清除定时器
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
  },

  // 自动停止loading（带延迟）
  autoStop: (delay: number = 200) => {
    // 从800ms减少到200ms
    // 清除之前的定时器
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
    }

    // 设置新的定时器
    loadingTimeout = setTimeout(() => {
      RouteLoadingManager.stop()
    }, delay)
  },

  // 获取当前状态
  getState: () => globalLoadingState,

  // 订阅状态变化
  subscribe: (callback: (loading: boolean) => void) => {
    globalLoadingCallbacks.push(callback)
    return () => {
      globalLoadingCallbacks = globalLoadingCallbacks.filter(cb => cb !== callback)
    }
  }
}
