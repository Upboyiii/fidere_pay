'use client'

// React Imports
import { useEffect, useState, useRef } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'

// MUI Imports
import { Box } from '@mui/material'

// Hook Imports
import { RouteLoadingManager } from '@/hooks/useRouteLoading'

/**
 * 路由加载指示器组件
 * 顶部进度条，给用户即时反馈
 */
const RouteLoadingIndicator = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 启动进度条
  const startProgress = () => {
    setIsLoading(true)
    setProgress(0)

    // 清除之前的定时器
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)

    // 模拟进度条动画
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 100)

    // 500ms后完成进度条
    timerRef.current = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 500)
  }

  // 监听全局loading事件
  useEffect(() => {
    const unsubscribe = RouteLoadingManager.subscribe(loading => {
      if (loading) {
        startProgress()
      }
    })

    return unsubscribe
  }, [])

  // 监听路由变化
  useEffect(() => {
    startProgress()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '3px',
        backgroundColor: 'transparent',
        pointerEvents: 'none'
      }}
    >
      <Box
        sx={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'primary.main',
          transition: 'width 0.2s ease-out',
          boxShadow: '0 0 10px rgba(0, 212, 170, 0.5)'
        }}
      />
    </Box>
  )
}

export default RouteLoadingIndicator
