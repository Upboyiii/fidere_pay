'use client'

// React Imports
import { useCallback } from 'react'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Config Imports
import themeConfig, { operationThemeConfig } from '@configs/themeConfig'

/**
 * 根据用户角色更新主题设置的Hook
 * 提供手动调用的方法来更新主题配置
 */
export const useThemeByRole = () => {
  const { updateSettings } = useSettings()

  /**
   * 根据当前用户角色更新主题设置
   * 在登录成功后手动调用此方法
   */
  const updateThemeByRole = useCallback(
    (tokenData: any) => {
      if (!tokenData?.role) {
        return
      }
      if (tokenData.role === 'operation') {
        updateSettings(
          {
            layout: operationThemeConfig.layout,
            navbarContentWidth: operationThemeConfig.navbar.contentWidth,
            contentWidth: operationThemeConfig.contentWidth,
            footerContentWidth: operationThemeConfig.footer.contentWidth,
            // mode: operationThemeConfig.mode,
            skin: operationThemeConfig.skin,
            semiDark: operationThemeConfig.semiDark
          },
          {
            updateCookie: true // 更新Cookie以持久化设置
          }
        )
      } else {
        // 对于非operation角色，只更新布局相关设置，保留primaryColor
        updateSettings({
          layout: themeConfig.layout,
          navbarContentWidth: themeConfig.navbar.contentWidth,
          contentWidth: themeConfig.contentWidth,
          footerContentWidth: themeConfig.footer.contentWidth,
          // mode: themeConfig.mode,
          skin: themeConfig.skin,
          semiDark: themeConfig.semiDark
        })
        // 可以在这里添加其他角色的主题配置
      }
    },
    [updateSettings]
  )

  return {
    updateThemeByRole // 返回手动调用的方法
  }
}

export default useThemeByRole
