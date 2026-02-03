'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'

// Third-party Imports
import { useMedia } from 'react-use'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeDropdown = () => {
  // States
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Hooks
  const { settings, updateSettings } = useSettings()
  const { mode: muiMode, systemMode, setMode } = useColorScheme()
  const isSystemDark = useMedia('(prefers-color-scheme: dark)', false)

  // 判断当前是否为暗色模式
  // 如果 muiMode 是 system，则根据系统偏好判断
  const isDarkMode = muiMode === 'system' 
    ? (systemMode === 'dark' || isSystemDark)
    : muiMode === 'dark'

  // 点击切换模式
  const handleToggle = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const newMode = isDarkMode ? 'light' : 'dark'
    
    // 同时更新 settings 和 MUI 的 colorScheme
    updateSettings({ mode: newMode })
    setMode(newMode)
    
    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }

  return (
    <Tooltip
      title={isDarkMode ? '切换到日间模式' : '切换到夜间模式'}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      open={tooltipOpen}
    >
      <IconButton 
        onClick={handleToggle} 
        color='default'
        sx={{
          position: 'relative',
          width: 40,
          height: 40,
          overflow: 'hidden',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        {/* 太阳图标 */}
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDarkMode ? 'translateY(-40px) rotate(-90deg)' : 'translateY(0) rotate(0deg)',
            opacity: isDarkMode ? 0 : 1,
          }}
        >
          <i 
            className='ri-sun-line' 
            style={{ 
              fontSize: 22,
              color: 'var(--mui-palette-warning-main)'
            }} 
          />
        </Box>

        {/* 月亮图标 */}
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDarkMode ? 'translateY(0) rotate(0deg)' : 'translateY(40px) rotate(90deg)',
            opacity: isDarkMode ? 1 : 0,
          }}
        >
          {/* 月牙效果 - 使用伪元素遮挡 */}
          <Box
            sx={{
              position: 'relative',
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: isDarkMode ? '#fbbf24' : '#94a3b8',
              boxShadow: isDarkMode 
                ? '0 0 10px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)' 
                : 'none',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -3,
                right: -3,
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: isDarkMode 
                  ? 'var(--mui-palette-background-paper)' 
                  : 'var(--mui-palette-background-paper)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isDarkMode ? 'scale(1)' : 'scale(0)',
              }
            }}
          />
        </Box>

        {/* 星星装饰（暗色模式下显示） */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 8,
            width: 3,
            height: 3,
            borderRadius: '50%',
            backgroundColor: '#fbbf24',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: '0.1s',
            opacity: isDarkMode ? 1 : 0,
            transform: isDarkMode ? 'scale(1)' : 'scale(0)',
            boxShadow: '0 0 4px rgba(251, 191, 36, 0.8)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 4,
            width: 2,
            height: 2,
            borderRadius: '50%',
            backgroundColor: '#fbbf24',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: '0.2s',
            opacity: isDarkMode ? 1 : 0,
            transform: isDarkMode ? 'scale(1)' : 'scale(0)',
            boxShadow: '0 0 3px rgba(251, 191, 36, 0.8)'
          }}
        />
      </IconButton>
    </Tooltip>
  )
}

export default ModeDropdown
