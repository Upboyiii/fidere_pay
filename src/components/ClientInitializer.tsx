'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Server Imports
import { initClient } from '@server/http'

// Util Imports
import { TokenManager } from '@/utils/tokenManager'

/**
 * 客户端初始化组件
 * 负责初始化客户端配置和设置 token 自动刷新
 * 增强版本：添加更好的错误处理和防重复调用
 */
const ClientInitializer = () => {
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // 防止重复初始化
    if (isInitializedRef.current) {
      return
    }

    try {
      // 初始化客户端配置
      initClient()
      isInitializedRef.current = true
    } catch (error) {
      console.error('客户端初始化失败:', error)
      // 即使初始化失败，也不阻止应用运行
    }

    // 设置自动刷新定时器
    // const setupAutoRefresh = () => {
    //   try {
    //     const timeoutId = TokenManager.setupAutoRefresh(async () => {
    //       try {
    //         const tokens = TokenManager.getTokens()
    //         if (tokens?.refreshToken) {
    //           await TokenManager.refreshToken(tokens.refreshToken)
    //           // 重新设置定时器（避免递归调用导致的问题）
    //           setTimeout(() => {
    //             setupAutoRefresh()
    //           }, 1000)
    //         }
    //       } catch (error) {
    //         console.error('自动刷新失败:', error)
    //         // 刷新失败时，延迟重试
    //         setTimeout(() => {
    //           setupAutoRefresh()
    //         }, 30000) // 30秒后重试
    //       }
    //     })

    //     if (timeoutId) {
    //       refreshTimeoutRef.current = timeoutId
    //     }
    //   } catch (error) {
    //     console.error('设置自动刷新失败:', error)
    //   }
    // }

    // 延迟初始设置，确保应用完全加载
    // const initTimer = setTimeout(() => {
    //   setupAutoRefresh()
    // }, 2000)

    // 清理函数
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      // if (initTimer) {
      //   clearTimeout(initTimer)
      // }
    }
  }, [])

  return null
}

export default ClientInitializer
