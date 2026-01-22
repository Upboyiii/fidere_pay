/**
 * 路由权限工具函数
 */

/**
 * 移除路径中的语言前缀
 * @param pathname - 包含语言前缀的路径，如 /zh-CN/admin/user
 * @returns 移除语言前缀后的路径，如 /admin/user
 */
const removeLocalePrefix = (pathname: string): string => {
  // 匹配语言前缀格式：/[lang]/...，如 /zh-CN, /en, /zh-Hant
  const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)(\/.*)?$/)
  if (localeMatch && localeMatch[3]) {
    // 如果匹配到语言前缀且有后续路径，返回后续路径
    return localeMatch[3] || '/'
  }
  // 如果没有匹配到语言前缀，返回原路径
  return pathname
}

/**
 * 规范化路径，确保以 / 开头且不以 / 结尾（除非是根路径）
 * @param path - 路径字符串
 * @returns 规范化后的路径
 */
const normalizePath = (path: string): string => {
  if (!path) return '/'
  // 移除末尾的斜杠（除非是根路径）
  const normalized = path.trim().replace(/\/+$/, '') || '/'
  // 确保以 / 开头
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}

/**
 * 检查路径是否匹配菜单路径（支持精确匹配和前缀匹配）
 * @param routePath - 当前路由路径（已移除语言前缀）
 * @param menuPath - 菜单路径
 * @returns 是否匹配
 */
const isPathMatched = (routePath: string, menuPath: string): boolean => {
  const normalizedRoute = normalizePath(routePath)
  const normalizedMenu = normalizePath(menuPath)

  // 精确匹配
  if (normalizedRoute === normalizedMenu) {
    return true
  }

  // 前缀匹配：如果路由路径以菜单路径开头，且下一个字符是 / 或路径结束
  // 例如：/admin/user 匹配 /admin/user/list，但不匹配 /admin/user-list
  if (normalizedRoute.startsWith(normalizedMenu)) {
    const nextChar = normalizedRoute[normalizedMenu.length]
    // 下一个字符是 / 或路径结束，说明是子路由
    if (nextChar === '/' || nextChar === undefined) {
      return true
    }
  }

  return false
}

/**
 * 检查用户是否有权限访问指定路由
 * @param pathname - 当前路由路径（可能包含语言前缀，如 /zh-CN/admin/user）
 * @param menuList - 用户菜单列表
 * @returns 是否有权限
 */
export const hasRoutePermission = (pathname: string, menuList: any[]): boolean => {
  if (!menuList || menuList.length === 0) {
    return false
  }

  // 移除语言前缀，获取实际路由路径
  const routePath = removeLocalePrefix(pathname)

  // 公开路径，无需权限检查
  const publicPaths = ['/login', '/register', '/not-authorized', '/not-found']
  if (publicPaths.some(path => routePath === path || routePath.startsWith(path))) {
    return true
  }

  // 递归检查菜单路径
  const checkMenuPath = (menus: any[]): boolean => {
    for (const menu of menus) {
      // 获取菜单路径（支持 path 和 linkUrl 字段）
      const menuPath = menu.path || menu.linkUrl

      if (menuPath) {
        // 检查路径是否匹配（支持精确匹配和前缀匹配，用于二级路由）
        if (isPathMatched(routePath, menuPath)) {
          return true
        }
      }

      // 检查子菜单
      if (menu.children && menu.children.length > 0) {
        if (checkMenuPath(menu.children)) {
          return true
        }
      }
    }

    return false
  }

  return checkMenuPath(menuList)
}

/**
 * 从菜单列表中获取所有可访问的路由路径
 * @param menuList - 用户菜单列表
 * @returns 路由路径数组
 */
export const getAllowedRoutes = (menuList: any[]): string[] => {
  if (!menuList || menuList.length === 0) {
    return []
  }

  const routes: string[] = []

  const extractRoutes = (menus: any[]) => {
    menus.forEach(menu => {
      if (menu.path) {
        routes.push(menu.path)
      }

      if (menu.children && menu.children.length > 0) {
        extractRoutes(menu.children)
      }
    })
  }

  extractRoutes(menuList)
  return routes
}
