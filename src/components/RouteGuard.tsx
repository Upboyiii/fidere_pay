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
  const { data: session, status: sessionStatus } = useSession()
  const { menuList, isLoaded: isMenuLoaded } = useMenu()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // 重置检查状态
    setIsChecking(true)
    
    // 移除语言前缀，获取实际路由路径
    const routePath = pathname.replace(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/, '') || '/'

    // 检查是否是公开路径
    const publicPaths = ['/login', '/managelogin', '/userlogin', '/register', '/not-authorized', '/not-found']
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
    const isAdminMode = normalizedUserRole === 'admin' || normalizedUserRole.includes('admin')

    // 特殊处理管理员角色：管理员有全部路由权限
    if (isAdminMode) {
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // 优先检查硬编码路由（不需要等待菜单加载）
    // 特殊处理运营角色：运营角色使用硬编码菜单，menuList 可能为空
    if (isOperationMode && routePath.startsWith('/operation')) {
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // 特殊处理资产管理和全球汇款路由：运营和KYC角色都可以访问
    // 这些路由使用硬编码菜单，menuList 可能为空
    // 优先检查硬编码路由，避免等待菜单加载导致的404闪烁
    if ((isOperationMode || isKycMode) && (routePath.startsWith('/assets') || routePath.startsWith('/remittance'))) {
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // 如果菜单和 session 都还未加载完成，继续等待
    if (!isMenuLoaded || sessionStatus === 'loading') {
      // 保持 isChecking 为 true，显示 loading 状态
      return
    }

    // 菜单已加载完成，进行权限检查
    if (menuList.length === 0) {
      // 菜单为空，可能是新用户或没有分配菜单
      // 如果菜单为空且不是特殊角色，暂时允许访问（避免误拦截）
      // 可以根据业务需求调整这里的逻辑
      setIsAuthorized(false)
      setIsChecking(false)
      return
    }

    // 检查路由权限
    const hasPermission = hasRoutePermission(pathname, menuList)

    if (!hasPermission) {
      setIsAuthorized(false)
    } else {
      setIsAuthorized(true)
    }

    setIsChecking(false)
  }, [pathname, menuList, isMenuLoaded, router, params, session, sessionStatus])

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
