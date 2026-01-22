'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

/**
 * 客户端缓存Hook
 * 用于缓存服务器端数据，减少重复请求
 */
export const useClientCache = <T>(key: string, fetcher: () => Promise<T>, deps: any[] = []) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map())

  // 缓存过期时间（5分钟）
  const CACHE_EXPIRY = 5 * 60 * 1000

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 检查缓存
        const cached = cacheRef.current.get(key)
        if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
          setData(cached.data)
          setLoading(false)
          return
        }

        // 获取新数据
        const result = await fetcher()

        // 更新缓存
        cacheRef.current.set(key, {
          data: result,
          timestamp: Date.now()
        })

        setData(result)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error(`缓存获取失败 [${key}]:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, deps)

  // 清除缓存的方法
  const clearCache = () => {
    cacheRef.current.delete(key)
  }

  // 清除所有缓存
  const clearAllCache = () => {
    cacheRef.current.clear()
  }

  return { data, loading, error, clearCache, clearAllCache }
}

/**
 * 全局缓存管理器
 */
export const ClientCacheManager = {
  // 内存缓存
  cache: new Map<string, { data: any; timestamp: number }>(),

  // 缓存过期时间
  CACHE_EXPIRY: 5 * 60 * 1000, // 5分钟

  // 设置缓存
  set: (key: string, data: any) => {
    ClientCacheManager.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  },

  // 获取缓存
  get: (key: string) => {
    const cached = ClientCacheManager.cache.get(key)
    if (cached && Date.now() - cached.timestamp < ClientCacheManager.CACHE_EXPIRY) {
      return cached.data
    }
    return null
  },

  // 清除缓存
  clear: (key?: string) => {
    if (key) {
      ClientCacheManager.cache.delete(key)
    } else {
      ClientCacheManager.cache.clear()
    }
  },

  // 检查缓存是否存在
  has: (key: string) => {
    const cached = ClientCacheManager.cache.get(key)
    return cached && Date.now() - cached.timestamp < ClientCacheManager.CACHE_EXPIRY
  }
}
