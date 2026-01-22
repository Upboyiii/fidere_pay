/*
 * If you change the following items in the config object, you will not see any effect in the local development server
 * as these are stored in the cookie (cookie has the highest priority over the themeConfig):
 * 1. mode
 * 2. skin
 * 3. semiDark
 * 4. layout
 * 5. navbar.contentWidth
 * 6. contentWidth
 * 7. footer.contentWidth
 *
 * To see the effect of the above items, you can click on the reset button from the Customizer
 * which is on the top-right corner of the customizer besides the close button.
 * This will reset the cookie to the values provided in the config object below.
 *
 * Another way is to clear the cookie from the browser's Application/Storage tab and then reload the page.
 */

// Third-party Imports
import type { ToastPosition } from 'react-toastify'

// Type Imports
import type { Mode, Skin, Layout, LayoutComponentPosition, LayoutComponentWidth } from '@core/types'
import type { VerticalMenuDataType } from '@/types/menuTypes'

// Util Imports
import { TokenManager } from '@/utils/tokenManager'
import { convertMenuListToVerticalMenu } from '@/utils/menuConverter'

type Navbar = {
  type: LayoutComponentPosition
  contentWidth: LayoutComponentWidth
  floating: boolean
  detached: boolean
  blur: boolean
}

type Footer = {
  type: LayoutComponentPosition
  contentWidth: LayoutComponentWidth
  detached: boolean
}

// 用户角色类型定义
export type UserRole = 'kyc' | 'operation' | 'admin'

// 角色配置接口
export interface RoleConfig {
  homePageUrl: string
  layout?: Layout
  navbar?: Partial<Navbar>
  footer?: Partial<Footer>
}

// 角色配置映射
export const roleConfigs: Record<UserRole, RoleConfig> = {
  kyc: {
    homePageUrl: '/kyc/dashboard',
    layout: 'vertical'
  },
  operation: {
    homePageUrl: '/operation/dashboard',
    layout: 'horizontal'
  },
  admin: {
    homePageUrl: '/dashboards/crm',
    layout: 'vertical'
  }
}

export type Config = {
  templateName: string
  homePageUrl: string
  settingsCookieName: string
  mode: Mode
  skin: Skin
  semiDark: boolean
  layout: Layout
  layoutPadding: number
  navbar: Navbar
  contentWidth: LayoutComponentWidth
  compactContentWidth: number
  footer: Footer
  disableRipple: boolean
  toastPosition: ToastPosition
  loginName: string
  loginIllustration: string
  loginIllustrationDark: string
  loginIllustrationBordered: string
  loginIllustrationBorderedDark: string
}

const themeConfig: Config = {
  templateName: 'Fidere Pay',
  homePageUrl: '/kyc/dashboard',
  loginName: 'Fidere Pay',
  settingsCookieName: 'materio-mui-next-demo-1',
  mode: 'system', // 'system', 'light', 'dark'
  skin: 'default', // 'default', 'bordered'
  semiDark: false, // true, false
  layout: 'vertical', // 'vertical', 'collapsed', 'horizontal'
  layoutPadding: 24, // Common padding for header, content, footer layout components (in px)
  compactContentWidth: 1440, // in px
  navbar: {
    type: 'fixed', // 'fixed', 'static'
    contentWidth: 'compact', // 'compact', 'wide'
    floating: false, //! true, false (This will not work in the Horizontal Layout)
    detached: true, //! true, false (This will not work in the Horizontal Layout or floating navbar is enabled)
    blur: true // true, false
  },
  contentWidth: 'compact', // 'compact', 'wide'
  footer: {
    type: 'static', // 'fixed', 'static'
    contentWidth: 'compact', // 'compact', 'wide'
    detached: true //! true, false (This will not work in the Horizontal Layout)
  },
  disableRipple: false, // true, false
  toastPosition: 'top-right', // 'top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left'
  loginIllustration: '/images/illustrations/auth/v2-login-light.png',
  loginIllustrationDark: '/images/illustrations/auth/v2-login-dark.png',
  loginIllustrationBordered: '/images/illustrations/auth/v2-login-light-border.png',
  loginIllustrationBorderedDark: '/images/illustrations/auth/v2-login-dark-border.png'
}

export const operationThemeConfig: Config = {
  templateName: 'Fidere Pay',
  homePageUrl: '/operation/clients',
  loginName: 'Fidere Pay',
  settingsCookieName: 'materio-mui-next-demo-2',
  mode: 'system', // 'system', 'light', 'dark'
  skin: 'default', // 'default', 'bordered'
  semiDark: false, // true, false
  layout: 'horizontal', // 'vertical', 'collapsed', 'horizontal'
  layoutPadding: 24, // Common padding for header, content, footer layout components (in px)
  compactContentWidth: 1440, // in px
  navbar: {
    type: 'fixed', // 'fixed', 'static'
    contentWidth: 'compact', // 'compact', 'wide'
    floating: false, //! true, false (This will not work in the Horizontal Layout)
    detached: true, //! true, false (This will not work in the Horizontal Layout or floating navbar is enabled)
    blur: true // true, false
  },
  contentWidth: 'compact', // 'compact', 'wide'
  footer: {
    type: 'static', // 'fixed', 'static'
    contentWidth: 'compact', // 'compact', 'wide'
    detached: true //! true, false (This will not work in the Horizontal Layout)
  },
  disableRipple: false, // true, false
  toastPosition: 'top-right', // 'top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left'
  loginIllustration: '/images/illustrations/auth/v2-forgot-password-light.png',
  loginIllustrationDark: '/images/illustrations/auth/v2-forgot-password-dark.png',
  loginIllustrationBordered: '/images/illustrations/auth/v2-forgot-password-dark-border.png',
  loginIllustrationBorderedDark: '/images/illustrations/auth/v2-forgot-password-dark-border.png'
}

/**
 * 根据用户角色获取对应的首页URL
 * @param userRole - 用户角色
 * @returns 对应的首页URL路径
 */
export const getHomePageUrlByRole = (userRole: string): string => {
  const role = userRole as UserRole
  return roleConfigs[role]?.homePageUrl || themeConfig.homePageUrl
}

/**
 * 根据用户角色获取完整的角色配置
 * @param userRole - 用户角色
 * @returns 角色配置对象
 */
export const getRoleConfig = (userRole: string): RoleConfig | null => {
  const role = userRole as UserRole
  return roleConfigs[role] || null
}

/**
 * 根据用户角色获取主题配置
 * @param userRole - 用户角色
 * @returns 合并后的主题配置
 */
export const getThemeConfigByRole = (userRole: string): Config => {
  const roleConfig = getRoleConfig(userRole)

  if (!roleConfig) {
    return themeConfig
  }

  return {
    ...themeConfig,
    homePageUrl: roleConfig.homePageUrl,
    layout: roleConfig.layout || themeConfig.layout,
    navbar: {
      ...themeConfig.navbar,
      ...roleConfig.navbar
    },
    footer: {
      ...themeConfig.footer,
      ...roleConfig.footer
    }
  }
}

/**
 * 从菜单数据中递归查找第一个路由
 * @param menu - 菜单数据
 * @returns 第一个路由路径，如果没有则返回 null
 */
const findFirstRoute = (menu: VerticalMenuDataType): string | null => {
  // 如果是菜单项且有 href，直接返回
  if ('href' in menu && menu.href && menu.href !== '#') {
    return menu.href
  }

  // 如果有子菜单，递归查找第一个子菜单的路由
  if ('children' in menu && menu.children && menu.children.length > 0) {
    for (const child of menu.children) {
      const route = findFirstRoute(child)
      if (route) {
        return route
      }
    }
  }

  return null
}

/**
 * 获取 menuList 第一条的第一个路由
 * 如果 menuList 不存在或为空，则返回默认路径 '/'
 * @param menuListParam - 可选的 menuList 数组，如果传入则直接使用，否则从 localStorage 读取
 * @returns 首页URL路径
 */
export const getFirstMenuRoute = (menuListParam?: any[]): string => {
  try {
    let menuList: any[] | null = null

    // 如果传入了 menuList 参数，直接使用
    if (menuListParam && Array.isArray(menuListParam) && menuListParam.length > 0) {
      menuList = menuListParam
    } else {
      // 否则从 TokenManager 获取 menuList
      const tokens = TokenManager.getTokens()
      if (tokens && tokens.menuList) {
        try {
          const parsedMenuList = JSON.parse(tokens.menuList)
          if (Array.isArray(parsedMenuList) && parsedMenuList.length > 0) {
            menuList = parsedMenuList
          }
        } catch (parseError) {
          console.error('解析 menuList 失败:', parseError)
        }
      }
    }

    // 如果 menuList 为空，返回默认路径
    if (!menuList || menuList.length === 0) {
      return '/'
    }

    // 转换为 VerticalMenuDataType 格式
    const convertedMenus = convertMenuListToVerticalMenu(menuList)
    if (!convertedMenus || convertedMenus.length === 0) {
      // 如果转换后为空，返回默认路径
      return '/'
    }

    // 查找第一条菜单的第一个路由
    const firstRoute = findFirstRoute(convertedMenus[0])
    if (firstRoute) {
      return firstRoute
    }

    // 如果第一条菜单没有路由，返回默认路径
    return '/'
  } catch (error) {
    console.error('获取第一条菜单路由失败:', error)
    // 出错时返回默认路径
    return '/'
  }
}

export default themeConfig
