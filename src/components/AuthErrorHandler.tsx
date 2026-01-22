'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// Component Imports
import { Button, Alert, AlertTitle } from '@mui/material'

// Server Imports
import { HttpError } from '@server/http'

/**
 * 认证错误处理组件
 * 增强版本：添加错误边界和异常处理
 */
interface AuthErrorHandlerProps {
  children: React.ReactNode
}

const AuthErrorHandler = ({ children }: AuthErrorHandlerProps) => {
  const { data: _session, status: _status } = useSession()
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // 监听未捕获的错误
  useEffect(() => {
    /**
     * 检查是否为 HTTP 请求错误
     */
    const isHttpError = (error: any): boolean => {
      if (!error) {
        return false
      }

      // 检查 instanceof
      if (error instanceof HttpError) {
        return true
      }

      // 检查错误名称或构造函数名称
      if (error?.name === 'HttpError' || error?.constructor?.name === 'HttpError') {
        return true
      }

      // 检查错误消息是否包含 HTTP 相关错误信息
      const httpErrorMessages = ['网络异常', '网络请求失败', '请求失败']
      const errorStr = String(error?.message || error?.toString() || '')
      if (httpErrorMessages.some(msg => errorStr.includes(msg))) {
        return true
      }

      // 检查错误堆栈
      if (error?.stack && typeof error.stack === 'string') {
        if (error.stack.includes('http.ts') || error.stack.includes('@server/http')) {
          return true
        }
      }

      return false
    }

    const handleError = (event: ErrorEvent) => {
      const error = event.error

      // 如果是 HTTP 请求错误，忽略它
      if (isHttpError(error)) {
        console.warn('AuthErrorHandler 忽略 HTTP 请求错误:', error?.message || error?.toString())
        return
      }

      console.error('捕获到客户端错误:', error)
      setHasError(true)
      setErrorMessage(error?.message || '未知错误')
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason

      // 如果是 HTTP 请求错误，忽略它（已经被全局错误处理器处理）
      if (isHttpError(error)) {
        console.warn('AuthErrorHandler 忽略 HTTP 请求错误:', error?.message || error?.toString())
        return
      }

      console.error('捕获到未处理的Promise拒绝:', error)
      setHasError(true)
      setErrorMessage(error?.message || 'Promise拒绝错误')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // 如果有错误，显示错误信息
  if (hasError) {
    return (
      <div className='flex items-center justify-center min-h-screen p-4'>
        <Alert severity='error' className='max-w-md'>
          <AlertTitle>应用错误</AlertTitle>
          <p className='mb-4'>发生了一个客户端异常：</p>
          <p className='text-sm text-gray-600 mb-4'>{errorMessage}</p>
          <div className='flex gap-2'>
            <Button variant='contained' color='error' size='small' onClick={() => window.location.reload()}>
              刷新页面
            </Button>
            <Button
              variant='outlined'
              size='small'
              onClick={() => {
                setHasError(false)
                setErrorMessage('')
              }}
            >
              重试
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  // 正常情况显示内容
  return <>{children}</>
}

export default AuthErrorHandler
