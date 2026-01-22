'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { usePathname, useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Hook Imports
import useMenu from '@/hooks/useMenu'

// Util Imports
import { hasRoutePermission } from '@/utils/routePermission'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { Mode } from '@core/types'

// Component Imports
import NotFound from '@views/NotFound'

/**
 * 路由守卫组件
 * 拦截未授权路由访问，检查当前路由是否在 menuList 中
 * 支持二级路由匹配（如果父路由在菜单中，子路由也可以访问）
 * 特殊处理运营角色：运营角色使用硬编码菜单，允许访问 /operation/* 路由
 */
const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const menuList = useMenu()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // 重置检查状态
    setIsChecking(true)
    
    // 移除语言前缀，获取实际路由路径
    const routePath = pathname.replace(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/, '') || '/'

    // 调试日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 RouteGuard 调试信息:')
      console.log('  - pathname:', pathname)
      console.log('  - routePath:', routePath)
    }

    // 检查是否是公开路径
    const publicPaths = ['/login', '/register', '/not-authorized', '/not-found']
    if (publicPaths.some(path => routePath === path || routePath.startsWith(path))) {
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // 获取用户角色
    const userRole = (session as any)?.role || (session as any)?.user?.role
    const normalizedUserRole = userRole?.toLowerCase() || ''
    const isKycMode = normalizedUserRole === 'kyc' || normalizedUserRole.includes('kyc')
    const isOperationMode = normalizedUserRole === 'operation' || normalizedUserRole.includes('operation')

    // 调试日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('  - userRole:', userRole)
      console.log('  - isKycMode:', isKycMode)
      console.log('  - isOperationMode:', isOperationMode)
      console.log('  - menuList length:', menuList?.length || 0)
    }

    // 优先检查硬编码路由（不需要等待菜单加载）
    // 特殊处理运营角色：运营角色使用硬编码菜单，menuList 可能为空
    if (isOperationMode && routePath.startsWith('/operation')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('  - ✅ 运营模式，允许访问 /operation/*')
      }
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // 特殊处理资产管理和全球汇款路由：运营和KYC角色都可以访问
    // 这些路由使用硬编码菜单，menuList 可能为空
    // 优先检查硬编码路由，避免等待菜单加载导致的404闪烁
    if ((isOperationMode || isKycMode) && (routePath.startsWith('/assets') || routePath.startsWith('/remittance'))) {
      if (process.env.NODE_ENV === 'development') {
        console.log('  - ✅ 运营/KYC模式，允许访问 /assets/* 或 /remittance/*')
      }
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // 如果菜单列表还未加载，且不是硬编码路由，等待菜单加载
    if (!menuList || menuList.length === 0) {
      // 对于其他路由，等待菜单加载
      if (process.env.NODE_ENV === 'development') {
        console.log('  - ⏳ 菜单列表为空，等待菜单加载')
      }
      
      // 等待一下再检查，避免误拦截
      const timer = setTimeout(() => {
        setIsChecking(false)
      }, 300)

      return () => clearTimeout(timer)
    }

    // 检查路由权限
    const hasPermission = hasRoutePermission(pathname, menuList)

    if (process.env.NODE_ENV === 'development') {
      console.log('  - hasPermission:', hasPermission)
    }

    if (!hasPermission) {
      // 没有权限，标记为未授权
      if (process.env.NODE_ENV === 'development') {
        console.log('  - ❌ 没有权限访问该路由')
      }
      setIsAuthorized(false)
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('  - ✅ 有权限访问该路由')
      }
      setIsAuthorized(true)
    }

    setIsChecking(false)
  }, [pathname, menuList, router, params, session])

  // 检查中显示加载状态
  if (isChecking) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        </div>
      </div>
    )
  }

  // 如果未授权，直接显示404页面内容
  if (!isAuthorized) {
    return <NotFound mode='light' />
  }

  // 授权通过，渲染子组件
  return <>{children}</>
}

export default RouteGuard
