'use client'

// React Imports
import { memo, useState, useEffect, useRef } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

// Config Imports
import type { i18n } from '@configs/i18n'

// Util Imports
import { TokenManager } from '@/utils/tokenManager'

import type { ChildrenType } from '@core/types'

type Props = ChildrenType & {
  locale: keyof typeof i18n.langDirection
}

// 使用 sessionStorage 的 key 来持久化重定向状态
const REDIRECT_FLAG_KEY = 'auth_redirect_triggered'

/**
 * 优化的客户端认证守卫组件
 * 使用本地token检查机制，避免等待NextAuth session检查
 * 使用 sessionStorage 防止重复重定向问题
 */
const ClientAuthGuard = memo(({ children, locale }: Props) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [localAuthState, setLocalAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasClearedSession, setHasClearedSession] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // 使用 ref 防止重复执行清理逻辑
  const isClearingRef = useRef(false)
  const redirectTriggeredRef = useRef(false)
  const loginPath = `/${locale}/login`

  // 检查是否已经触发过重定向（使用 sessionStorage）
  const checkRedirectFlag = () => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(REDIRECT_FLAG_KEY) === 'true'
  }

  // 设置重定向标记
  const setRedirectFlag = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(REDIRECT_FLAG_KEY, 'true')
    }
  }

  // 清除重定向标记（在登录成功后调用）
  const clearRedirectFlag = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(REDIRECT_FLAG_KEY)
    }
  }

  // 检查本地token状态（首次加载时优先检查，清除可能残留的重定向标记）
  useEffect(() => {
    const checkLocalAuth = () => {
      try {
        const tokens = TokenManager.getTokens()
        if (tokens && tokens.accessToken) {
          // 如果有 token，立即清除所有重定向标记（防止页面刷新后残留标记导致误重定向）
          clearRedirectFlag()
          redirectTriggeredRef.current = false
          setShouldRedirect(false)
          // 清除退出登录标记（登录成功后）
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('logout_in_progress')
          }
          setLocalAuthState('authenticated')
        } else {
          setLocalAuthState('unauthenticated')
        }
      } catch (error) {
        console.error('检查本地认证状态失败:', error)
        setLocalAuthState('unauthenticated')
      } finally {
        setIsInitialized(true)
      }
    }

    checkLocalAuth()
  }, [pathname, loginPath])

  // 检查本地token和session的token是否一致
  useEffect(() => {
    // 如果已经清除过session，跳过
    if (hasClearedSession || isClearingRef.current) return

    // 如果本地token丢失但NextAuth有session，同步清除session
    if (localAuthState === 'unauthenticated' && session) {
      console.log('检测到本地token丢失但NextAuth session存在，清除session')
      isClearingRef.current = true
      setHasClearedSession(true)
      const signOutUser = async () => {
        try {
          const { signOut } = await import('next-auth/react')
          await signOut({ redirect: false })
        } catch (error) {
          console.error('清除session失败:', error)
        } finally {
          isClearingRef.current = false
        }
      }
      signOutUser()
      return
    }

    // 如果两个都存在，比对token
    if (localAuthState === 'authenticated' && session?.user) {
      const localTokens = TokenManager.getTokens()
      const sessionToken = (session as any)?.accessToken

      if (localTokens?.accessToken && sessionToken) {
        // 以session的token为准，比对本地token是否一致
        if (localTokens.accessToken !== sessionToken) {
          isClearingRef.current = true
          setHasClearedSession(true)
          setLocalAuthState('unauthenticated')
          TokenManager.clearTokens()
          const signOutUser = async () => {
            try {
              const { signOut } = await import('next-auth/react')
              await signOut({ redirect: false })
            } catch (error) {
              console.error('退出登录失败:', error)
            } finally {
              isClearingRef.current = false
            }
          }
          signOutUser()
        }
      } else if (sessionToken && !localTokens?.accessToken) {
        // 本地没有token但session有，两个必须一致，清除并退出登录
        console.log('检测到本地token丢失但session存在，清除本地和session，执行退出登录')
        isClearingRef.current = true
        setHasClearedSession(true)
        setLocalAuthState('unauthenticated')
        TokenManager.clearTokens()
        const signOutUser = async () => {
          try {
            const { signOut } = await import('next-auth/react')
            await signOut({ redirect: false })
          } catch (error) {
            console.error('退出登录失败:', error)
          } finally {
            isClearingRef.current = false
          }
        }
        signOutUser()
      }
    }
  }, [localAuthState, session, hasClearedSession])

  // 统一处理重定向逻辑，防止重复重定向
  useEffect(() => {
    // 如果还在初始化，不处理重定向
    if (!isInitialized) return

    // 如果已经在登录页，不需要重定向
    if (pathname === loginPath) {
      // 如果已经在登录页且有 token，清除重定向标记
      if (localAuthState === 'authenticated') {
        clearRedirectFlag()
        redirectTriggeredRef.current = false
        setShouldRedirect(false)
      }
      return
    }

    // 关键修复：如果有 token（认证通过），优先清除重定向标记，不进行重定向
    // 这解决了页面刷新后残留的重定向标记导致误重定向的问题
    if (localAuthState === 'authenticated') {
      // 清除所有重定向标记和状态
      clearRedirectFlag()
      redirectTriggeredRef.current = false
      setShouldRedirect(false)
      return
    }

    // 如果已经触发过重定向（通过 sessionStorage 检查），且确实未认证，保持重定向状态
    if (checkRedirectFlag() || redirectTriggeredRef.current) {
      // 再次确认确实没有 token，才保持重定向状态
      const tokens = TokenManager.getTokens()
      if (!tokens || !tokens.accessToken) {
        if (!shouldRedirect) {
          setShouldRedirect(true)
        }
        return
      } else {
        // 如果有 token，清除重定向标记（防止残留标记）
        clearRedirectFlag()
        redirectTriggeredRef.current = false
        setShouldRedirect(false)
        setLocalAuthState('authenticated')
        return
      }
    }

    // 如果本地认证失败，标记需要重定向
    if (localAuthState === 'unauthenticated') {
      // 再次确认没有 token
      const tokens = TokenManager.getTokens()
      if (!tokens || !tokens.accessToken) {
        // 确保清除本地token
        if (tokens) {
          TokenManager.clearTokens()
        }
        // 设置重定向标记（使用 sessionStorage）
        setRedirectFlag()
        redirectTriggeredRef.current = true
        setShouldRedirect(true)
      } else {
        // 如果有 token，更新状态为已认证
        setLocalAuthState('authenticated')
        clearRedirectFlag()
      }
      return
    }

    // 如果NextAuth检查完成且未认证，清除本地token并标记重定向
    // 注意：此时 localAuthState 可能是 'checking'，所以需要检查 token 而不是依赖 localAuthState
    if (status === 'unauthenticated' && !session) {
      // 再次确认没有 token
      const tokens = TokenManager.getTokens()
      if (!tokens || !tokens.accessToken) {
        // NextAuth确认未认证，清除本地token
        if (tokens) {
          TokenManager.clearTokens()
        }
        // 设置重定向标记（使用 sessionStorage）
        setRedirectFlag()
        redirectTriggeredRef.current = true
        setShouldRedirect(true)
        // 更新状态为未认证（如果还在检查中）
        if (localAuthState === 'checking') {
          setLocalAuthState('unauthenticated')
        }
      } else {
        // 如果有 token，更新状态为已认证
        setLocalAuthState('authenticated')
        clearRedirectFlag()
      }
      return
    }
  }, [isInitialized, localAuthState, status, session, pathname, loginPath, shouldRedirect])

  // 如果还在初始化，显示加载状态
  if (!isInitialized) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        </div>
      </div>
    )
  }

  // 统一的重定向处理
  // 关键修复：只有在确认没有 token 的情况下才重定向
  // 防止页面刷新后残留的重定向标记导致误重定向
  const hasValidToken = TokenManager.getTokens()?.accessToken
  
  // 检查是否正在退出登录，如果是则不触发重定向（由退出登录逻辑自己处理跳转）
  const isLoggingOut = typeof window !== 'undefined' && sessionStorage.getItem('logout_in_progress') === 'true'
  
  if ((shouldRedirect || checkRedirectFlag()) && !hasValidToken && !isLoggingOut) {
    return <AuthRedirect lang={locale} />
  }

  // 如果本地认证通过，显示内容（不等待NextAuth完成）
  if (localAuthState === 'authenticated' || hasValidToken) {
    return <>{children}</>
  }

  // 默认情况：认证通过，显示内容
  return <>{children}</>
})

ClientAuthGuard.displayName = 'ClientAuthGuard'

export default ClientAuthGuard
