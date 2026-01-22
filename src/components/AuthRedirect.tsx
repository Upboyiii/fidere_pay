'use client'

// Next Imports
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig, { getHomePageUrlByRole } from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// 使用 sessionStorage 的 key 来持久化重定向状态
const REDIRECT_EXECUTED_KEY = 'auth_redirect_executed'

/**
 * 认证重定向组件
 * 使用 sessionStorage 和 ref 双重机制防止重复重定向
 */
const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const router = useRouter()
  const pathname = usePathname()
  // 使用 ref 而不是 state，避免组件重新渲染时重置
  const hasRedirectedRef = useRef(false)
  const login = `/${lang}/login`

  useEffect(() => {
    // 如果已经在登录页，不需要重定向
    if (pathname === login) {
      return
    }

    // 检查是否已经执行过重定向（使用 sessionStorage）
    const redirectExecuted = typeof window !== 'undefined' 
      ? sessionStorage.getItem(REDIRECT_EXECUTED_KEY) === 'true'
      : false

    // 防止重复重定向
    if (hasRedirectedRef.current || redirectExecuted) {
      return
    }

    // 从 localStorage 获取用户角色
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null

    // 根据角色设置不同的首页
    const currentHomePageUrl = getHomePageUrlByRole(userRole || '')

    // 执行重定向逻辑
    const redirectUrl = `/${lang}/login`
    const homePage = getLocalizedUrl(currentHomePageUrl, lang)

    let targetUrl: string
    if (pathname === homePage) {
      targetUrl = login
    } else {
      targetUrl = redirectUrl
    }

    // 标记已重定向（使用 sessionStorage 和 ref）
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(REDIRECT_EXECUTED_KEY, 'true')
    }
    hasRedirectedRef.current = true

    // 使用router.replace进行客户端重定向
    router.replace(targetUrl)
  }, [lang, pathname, router, login])

  // 显示空内容，避免重定向过程中的闪烁
  return <></>
}

export default AuthRedirect
