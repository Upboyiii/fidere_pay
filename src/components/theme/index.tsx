'use client'

// React Imports
import { useMemo, useEffect } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import { ThemeProvider, lighten, darken, createTheme } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import type {} from '@mui/material/themeCssVarsAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import type {} from '@mui/lab/themeAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build

// Third-party Imports
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Type Imports
import type { ChildrenType, Direction, SystemMode } from '@core/types'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

type Props = ChildrenType & {
  direction: Direction
  systemMode: SystemMode
}

const CustomThemeProvider = (props: Props) => {
  // Props
  const { children, direction, systemMode } = props

  // Vars
  const isServer = typeof window === 'undefined'
  let currentMode: SystemMode

  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  if (isServer) {
    currentMode = systemMode
  } else {
    if (settings.mode === 'system') {
      currentMode = isDark ? 'dark' : 'light'
    } else {
      currentMode = settings.mode as SystemMode
    }
  }

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const newTheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor || '#8C57FF',
              light: lighten(settings.primaryColor || '#8C57FF', 0.2),
              dark: darken(settings.primaryColor || '#8C57FF', 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor || '#8C57FF',
              light: lighten(settings.primaryColor || '#8C57FF', 0.2),
              dark: darken(settings.primaryColor || '#8C57FF', 0.1)
            }
          }
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data',
        // 强制更新CSS变量
        defaultColorScheme: currentMode
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(settings, currentMode, direction), newTheme)
    const finalTheme = createTheme(coreTheme)

    return finalTheme

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, settings.mode, currentMode, direction])

  // 使用 useEffect 确保 CSS 变量在 theme 创建和 DOM 更新后立即更新，避免语言切换时主题颜色丢失
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 使用 requestAnimationFrame 确保在 DOM 渲染后更新 CSS 变量
      requestAnimationFrame(() => {
        const root = document.documentElement

        // 更新主色调：优先使用 settings.primaryColor，如果不存在则保留当前值
        const primaryColor = settings.primaryColor
        if (primaryColor) {
          root.style.setProperty('--mui-palette-primary-main', primaryColor)
          root.style.setProperty('--mui-palette-primary-light', lighten(primaryColor, 0.2))
          root.style.setProperty('--mui-palette-primary-dark', darken(primaryColor, 0.1))
        }

        // 更新皮肤相关的CSS变量
        if (settings.skin === 'bordered') {
          root.style.setProperty('--mui-palette-background-default', currentMode === 'dark' ? '#312D4B' : '#FFFFFF')
        } else {
          root.style.setProperty('--mui-palette-background-default', currentMode === 'dark' ? '#28243D' : '#F4F5FA')
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, settings.mode, currentMode, theme])

  return (
    <AppRouterCacheProvider
      options={{
        prepend: true,
        ...(direction === 'rtl' && {
          key: 'rtl',
          stylisPlugins: [stylisRTLPlugin]
        })
      }}
    >
      <ThemeProvider
        theme={theme}
        defaultMode={systemMode}
        modeStorageKey={`${(themeConfig.templateName || 'materio').toLowerCase().split(' ').join('-')}-mui-template-mode`}
      >
        <>
          <ModeChanger systemMode={systemMode} />
          <CssBaseline />
          {children}
        </>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default CustomThemeProvider
