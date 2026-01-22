'use client'

import { forwardRef, useMemo } from 'react'
import { RouterLink } from './RouterLink'

import { ComponentPropsWithoutRef, ForwardedRef } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams } from 'next/navigation'
const RouterLinkSkip = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentPropsWithoutRef<typeof RouterLink>, 'prefetch'> & { prefetch?: boolean }
>((props, ref) => {
  const { prefetch, href, ...rest } = props
  const { lang: locale } = useParams()
  const _href = useMemo(() => {
    return href ? getLocalizedUrl(href.toString(), locale as string) : ''
  }, [href, locale])
  return (
    <RouterLink
      href={_href}
      ref={ref as ForwardedRef<HTMLAnchorElement>}
      prefetch={typeof prefetch === 'boolean' ? prefetch : undefined}
      {...rest}
    />
  )
})

export default RouterLinkSkip
