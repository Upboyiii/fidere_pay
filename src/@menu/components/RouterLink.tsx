'use client'

// React Imports
import { forwardRef } from 'react'

// Next Imports
import Link from 'next/link'
import type { LinkProps } from 'next/link'

// Type Imports
import type { ChildrenType } from '../types'
import { RouteLoadingManager } from '@/hooks/useRouteLoading'
type RouterLinkProps = LinkProps &
  Partial<ChildrenType> & {
    className?: string
    prefetch?: boolean
    showLoading?: boolean
  }

export const RouterLink = forwardRef((props: RouterLinkProps, ref: any) => {
  // Props
  const { href, className, onClick, showLoading = true, ...other } = props

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // if (showLoading) {
    RouteLoadingManager?.start()
    // }
    onClick?.(e)
  }

  return (
    <Link ref={ref} href={href} className={className} {...other} onClick={handleClick}>
      {props.children}
    </Link>
  )
})
