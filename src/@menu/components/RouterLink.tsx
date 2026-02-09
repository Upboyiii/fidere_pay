'use client'

// React Imports
import { forwardRef, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { useParams, usePathname } from 'next/navigation'

// Type Imports
import type { ChildrenType } from '../types'
import { RouteLoadingManager } from '@/hooks/useRouteLoading'

// Util Imports
import { getLocalizedPath } from '@/utils/routeUtils'

type RouterLinkProps = LinkProps &
  Partial<ChildrenType> & {
    className?: string
    prefetch?: boolean
    showLoading?: boolean
  }

export const RouterLink = forwardRef((props: RouterLinkProps, ref: any) => {
  // Props
  const { href, className, onClick, showLoading = true, ...other } = props
  const params = useParams()
  const pathname = usePathname()
  
  // 使用 useMemo 确保 currentLang 随着 pathname 的变化而更新
  const currentLang = useMemo(() => {
    // 从路径中提取语言，确保获取当前页面的语言
    if (pathname) {
      const langMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/)
      if (langMatch && langMatch[1]) {
        return langMatch[1]
      }
    }
    // 如果路径中没有语言，则使用 params
    return (params?.lang as string) || undefined
  }, [pathname, params?.lang])

  // 处理href，自动添加语言前缀
  const processedHref = typeof href === 'string' ? getLocalizedPath(href, currentLang) : href

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // if (showLoading) {
    RouteLoadingManager?.start()
    // }
    onClick?.(e)
  }

  return (
    <Link ref={ref} href={processedHref} className={className} {...other} onClick={handleClick}>
      {props.children}
    </Link>
  )
})
