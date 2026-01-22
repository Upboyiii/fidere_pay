// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getHomePageUrlByRole } from '@configs/themeConfig'

// Server Imports
import { authOptions } from '@server/auth'

const GuestOnlyRoute = async ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const session = await getServerSession(authOptions)

  if (session) {
    // 从 session 中获取用户角色或其他值
    const userRole = (session.user as any)?.role || 'user'

    // 根据角色设置不同的首页
    const homePageUrl = getHomePageUrlByRole(userRole)

    // 使用 redirect 重定向 - Next.js 15 的正确用法
    redirect(getLocalizedUrl(homePageUrl, lang))
  }

  return <>{children}</>
}

export default GuestOnlyRoute
