'use client'

// React Imports
import { forwardRef } from 'react'

// Next Imports
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { useParams } from 'next/navigation'

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
  const currentLang = (params?.lang as string) || undefined

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
