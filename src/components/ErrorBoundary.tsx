'use client'

// React Imports
import React, { Component } from 'react'

// Type Imports
import type { ErrorInfo, ReactNode } from 'react'

// MUI Imports
import { Alert, AlertTitle, Button, Box, Typography } from '@mui/material'

// Server Imports
import { HttpError } from '@server/http'

/**
 * 错误边界组件
 * 捕获React组件树中的JavaScript错误，记录这些错误，并显示一个备用UI
 */
interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  /**
   * 检查是否为 HTTP 请求错误
   */
  static isHttpError(error: Error | any): boolean {
    if (!error) {
      return false
    }

    // 检查 instanceof（最可靠的方式）
    if (error instanceof HttpError) {
      return true
    }

    // React 18+ 可能会将原始错误包装在 cause 属性中
    if (error.cause && ErrorBoundary.isHttpError(error.cause)) {
      return true
    }

    // 检查错误名称或构造函数名称（处理序列化后的错误）
    if (error.name === 'HttpError' || error.constructor?.name === 'HttpError') {
      return true
    }

    // 检查错误消息是否包含 HTTP 相关错误信息（兜底方案）
    const httpErrorMessages = ['网络异常', '网络请求失败', '请求失败']
    const errorStr = String(error.message || error.toString() || '')
    if (httpErrorMessages.some(msg => errorStr.includes(msg))) {
      return true
    }

    // 检查错误的 stack trace 中是否包含 http.ts（额外的识别方式）
    if (error.stack && typeof error.stack === 'string') {
      if (error.stack.includes('http.ts') || error.stack.includes('@server/http')) {
        return true
      }
    }

    return false
  }

  static getDerivedStateFromError(error: Error | any): State | null {
    // 开发模式下打印详细错误信息，便于调试
    if (process.env.NODE_ENV === 'development') {
    }

    // 如果是 HTTP 请求错误，不触发错误边界
    if (ErrorBoundary.isHttpError(error)) {
      console.warn('ErrorBoundary 忽略 HTTP 请求错误:', error?.message || error?.toString())
      return null
    }

    // 更新state，使下一次渲染能够显示降级后的UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 如果是 HTTP 请求错误，不处理
    if (ErrorBoundary.isHttpError(error)) {
      console.warn('ErrorBoundary 忽略 HTTP 请求错误:', error.message || error.toString())
      return
    }

    // 记录错误信息
    console.error('ErrorBoundary捕获到错误:', error, errorInfo)

    // 只有在 getDerivedStateFromError 返回了新的 state 时才更新 state
    // 这样可以避免在 HttpError 时也更新 state
    if (!ErrorBoundary.isHttpError(error)) {
      this.setState({
        error,
        errorInfo
      })
    }

    // 可以在这里添加错误报告服务
    // 例如：reportError(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定义的fallback组件，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认的错误UI
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
          }}
        >
          <Alert severity='error' sx={{ maxWidth: 600, width: '100%' }}>
            <AlertTitle>应用错误</AlertTitle>
            <Typography variant='body1' sx={{ mb: 2 }}>
              抱歉，应用遇到了一个错误。我们已经记录了这个问题。
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  错误详情（开发模式）:
                </Typography>
                <Typography
                  variant='caption'
                  component='pre'
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    p: 1,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 200
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant='contained' color='error' size='small' onClick={this.handleRetry}>
                重试
              </Button>
              <Button variant='outlined' size='small' onClick={this.handleReload}>
                刷新页面
              </Button>
            </Box>
          </Alert>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
