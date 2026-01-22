'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Lucide React Imports
import { Copy, Check } from 'lucide-react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import type { IconButtonProps } from '@mui/material/IconButton'

type CopyButtonProps = {
  /**
   * 要复制的文本内容
   */
  text: string
  /**
   * IconButton 的尺寸
   */
  size?: IconButtonProps['size']
  /**
   * IconButton 的 sx 样式
   */
  sx?: IconButtonProps['sx']
  /**
   * 复制成功后的回调函数
   */
  onCopySuccess?: () => void
}

/**
 * 复制按钮组件
 * 点击后复制文本到剪贴板，图标切换为成功图标，3秒后恢复
 */
const CopyButton = ({ text, size = 'small', sx, onCopySuccess }: CopyButtonProps) => {
  // States
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  /**
   * 处理复制操作
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)

      // 清理之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // 3秒后恢复图标
      timerRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)

      // 触发成功回调
      onCopySuccess?.()
    } catch (error) {}
  }

  return (
    <IconButton size={size} onClick={handleCopy} sx={sx}>
      {copied ? <Check size={14} className='text-green-600' /> : <Copy size={14} />}
    </IconButton>
  )
}

export default CopyButton
