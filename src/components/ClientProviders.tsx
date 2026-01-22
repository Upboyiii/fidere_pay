'use client'

// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import ReduxProvider from '@/redux-store/ReduxProvider'

// Styled Component Imports
import AppReactToastify from '@/libs/styles/AppReactToastify'

// Component Imports
import ClientInitializer from '@components/ClientInitializer'
import RouteLoadingIndicator from '@components/RouteLoadingIndicator'
import ErrorBoundary from '@components/ErrorBoundary'

type Props = ChildrenType & {
  direction: Direction
}

/**
 * 客户端Providers组件
 * 避免服务器端渲染，提升性能
 */
const ClientProviders = ({ children, direction }: Props) => {
  // 使用默认值，避免服务器端数据获取
  const mode = 'light' as const
  const systemMode = 'light' as const
  const settingsCookie = {} as any

  return (
    <ErrorBoundary>
      <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
        <VerticalNavProvider>
          <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
            <ThemeProvider direction={direction} systemMode={systemMode}>
              <ReduxProvider>
                <ClientInitializer />
                <RouteLoadingIndicator />
                {children}
              </ReduxProvider>
              <AppReactToastify direction={direction} hideProgressBar />
            </ThemeProvider>
          </SettingsProvider>
        </VerticalNavProvider>
      </NextAuthProvider>
    </ErrorBoundary>
  )
}

export default ClientProviders
