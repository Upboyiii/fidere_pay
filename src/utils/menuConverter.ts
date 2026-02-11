// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { MenuNode } from '@/views/admin/authRoles/components/utils'
import type { getDictionary } from '@/utils/getDictionary'
import { buildMenuTree } from '@/views/admin/authRoles/components/utils'
import { i18n } from '@configs/i18n'

const TITLE_KEY = {
  'zh-CN': 'title',
  en: 'titleEn',
  'zh-Hant': 'titleTw'
}

/**
 * 获取当前语言代码
 * @returns 当前语言代码，如果无法获取则返回默认语言
 */
const getCurrentLocale = (): string => {
  if (typeof window === 'undefined') {
    return i18n.defaultLocale
  }

  const pathname = window.location.pathname
  // 匹配路径中的语言前缀，格式为 /[lang]/...
  // 支持格式：zh-CN, zh-Hant, en 等
  const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z][a-zA-Z]*)?)/)

  if (localeMatch && i18n.locales.includes(localeMatch[1] as any)) {
    return localeMatch[1]
  }

  return i18n.defaultLocale
}

/**
 * 将 name 值转换为翻译键格式
 * 例如：AssetsMyAssets -> assetsMyAssets
 */
const convertNameToTranslationKey = (name: string): string => {
  if (!name) return ''
  // 将首字母转为小写
  return name.charAt(0).toLowerCase() + name.slice(1)
}

/**
 * 根据当前语言获取菜单标题，优先使用 name 值查找翻译
 * @param node - 菜单节点
 * @param dictionary - 字典数据（可选）
 * @returns 菜单标题
 */
export const getMenuLabel = (node: MenuNode, dictionary?: Awaited<ReturnType<typeof getDictionary>>): string => {
  // 1. 优先使用 name 值查找翻译（如果提供了字典）
  if (dictionary && node.name && String(node.name).trim()) {
    const navigationDict = dictionary.navigation as any
    
    // 尝试多种格式的翻译键
    const nameStr = String(node.name).trim()
    
    // 1.1 尝试转换后的格式：AssetsMyAssets -> assetsMyAssets
    const translationKey = convertNameToTranslationKey(nameStr)
    if (navigationDict && navigationDict[translationKey]) {
      return String(navigationDict[translationKey])
    }
    
    // 1.2 尝试原始 name 值
    if (navigationDict && navigationDict[nameStr]) {
      return String(navigationDict[nameStr])
    }
    
    // 1.3 尝试全小写格式：AssetsMyAssets -> assetsmyassets
    const lowerKey = nameStr.toLowerCase()
    if (navigationDict && navigationDict[lowerKey]) {
      return String(navigationDict[lowerKey])
    }
    
  }

  const currentLocale = getCurrentLocale()
  const currentTitleKey = TITLE_KEY[currentLocale as keyof typeof TITLE_KEY] || 'title'

  // 2. 获取当前语言对应的标题字段值
  const currentTitle = (node as any)?.meta?.[currentTitleKey]

  // 如果当前语言的标题存在且不为空，直接返回
  if (currentTitle && String(currentTitle).trim()) {
    return String(currentTitle)
  }

  // 向下兼容：依次尝试其他语言的标题
  // 3. 如果提供了字典，尝试根据 title（API 返回 meta.title 或 title）查找翻译
  const rawTitle = (node?.meta?.title ?? (node as any)?.title ?? '').trim()
  if (dictionary && rawTitle) {
    const navigationDict = dictionary.navigation as any

    // 根据中文标题查找对应的翻译键（与 API menu.title 对应）
    const titleToKeyMap: Record<string, string> = {
      '资产管理': 'assetManagement',
      '全球汇款': 'globalRemittance',
      '开发配置': 'development',
      '设置': 'settings',
      '安全设置': 'securitySettings',
      '管理员配置': 'adminConfiguration',
      '转账管理': 'adminTransfer',
      '收款人列表': 'adminPayees',
      '收款人': 'remittanceRecipients',
      '收款人管理': 'adminPayeeManagement',
      '资金流水': 'adminFinancial',
      '充值管理': 'adminRecharge',
      '回调地址': 'adminCallbackAddress',
      '我的资产': 'assetsMyAssets',
      '交易流水': 'assetsTransactions',
      '创建汇款': 'remittanceCreate',
      '汇款记录': 'remittanceRecords',
      '权限管理': 'permissionManagement',
      '菜单管理': 'authMenu',
      '角色管理': 'authRoles',
      '部门管理': 'authDept',
      '岗位管理': 'authPost',
      '用户管理': 'authUser',
      '添加菜单': 'adminAddMenu',
      '修改菜单': 'adminEditMenu',
      '删除菜单': 'adminDeleteMenu',
      '添加角色': 'adminAddRole',
      '修改角色': 'adminEditRole',
      '删除角色': 'adminDeleteRole',
      '授权数据权限': 'adminDataScope',
      '授权用户权限': 'adminUserAuth',
      '添加部门': 'adminAddDept',
      '修改部门': 'adminEditDept',
      '删除部门': 'adminDeleteDept',
      '添加岗位': 'adminAddPost',
      '修改岗位': 'adminEditPost',
      '删除岗位': 'adminDeletePost',
      '新增用户': 'adminAddUser',
      '修改用户': 'adminEditUser',
      '用户信息': 'adminUserInfo',
      '删除用户': 'adminDeleteUser',
      '管理所有': 'adminManageAll',
      '用户资产列表': 'userAssetList',
      '回调记录列表': 'callbackRecordList',
      '资金流水列表': 'financialList',
      '系统配置': 'systemConfig',
      '系统工具': 'systemTools',
      '系统监控': 'systemMonitor',
      '外链测试': 'outLinkTest',
      '字典管理': 'dictManagement',
      '字典数据管理': 'dictDataManagement',
      '参数管理': 'configManagement',
      '系统参数配置': 'systemParameterConfig',
      '系统参数设置': 'systemParameterSettings',
      '参数配置': 'parameterConfig',
      '服务监控': 'serverMonitor',
      '登录日志': 'loginLog',
      '操作日志': 'operLog',
      '在线用户': 'onlineUser',
      'api文档': 'apiDoc',
      '代码生成': 'codeGen',
      '代码生成配置': 'codeGenConfig',
      '定时任务': 'scheduledTask',
      '定时任务查询': 'scheduledTaskQuery',
      '定时任务添加': 'scheduledTaskAdd',
      '定时任务修改': 'scheduledTaskEdit',
      '定时任务删除': 'scheduledTaskDelete',
      '执行一次': 'scheduledTaskRun',
      '附件管理': 'attachmentManagement',
      '附件管理删除': 'attachmentDelete',
      '通知公告': 'notification',
      '通知公告管理': 'notificationManage',
      '通知公告查询': 'notificationQuery',
      '通知公告添加': 'notificationAdd',
      '通知公告修改': 'notificationEdit',
      '通知公告删除': 'notificationDelete',
      '通知公告展示': 'notificationShow',
      '阿里云-iframe': 'aliyunIframe',
      '腾讯云-外链': 'tencentLink'
    }

    const translationKey = titleToKeyMap[rawTitle]
    if (translationKey && navigationDict && navigationDict[translationKey]) {
      return String(navigationDict[translationKey])
    }
  }
  
  // 4. 使用 title（API 返回的 meta.title 或 title）
  if (rawTitle) {
    return rawTitle
  }

  // 5. 尝试 titleEn (英文)
  if ((node as any)?.meta?.titleEn && String((node as any)?.meta?.titleEn).trim()) {
    return String((node as any)?.meta?.titleEn)
  }

  // 6. 尝试 titleTw (繁体)
  if ((node as any)?.meta?.titleTw && String((node as any)?.meta?.titleTw).trim()) {
    return String((node as any)?.meta?.titleTw)
  }

  // 7. 尝试 meta.title
  if (node.meta?.title && String(node.meta.title).trim()) {
    return String(node.meta.title)
  }

  // 8. 尝试 label
  if (node.label && String(node.label).trim()) {
    return String(node.label)
  }

  // 9. 最后尝试 name（作为后备）
  if (node.name && String(node.name).trim()) {
    return String(node.name)
  }

  return ''
}

/**
 * 后端路径到前端路径的映射表
 * 将后端返回的路径映射到前端实际的路由路径
 */
const ROUTE_MAPPING: Record<string, string> = {
  // 系统配置
  '/system/dict/type/list': '/admin/dictList',
  '/system/config/list': '/admin/configList',
  '/api/v1/system/config/list': '/admin/System/parameter',
  // 系统参数配置 - 兼容后端返回的不同路径格式
  'System/parameter': '/admin/System/parameter',
  '/System/parameter': '/admin/System/parameter',
  'admin/System/parameter': '/admin/System/parameter',
  // 系统参数设置、参数配置（后端可能返回的路径）
  'system/parameter': '/admin/System/parameter',
  'System/settings': '/admin/System/parameter',
  'system/settings': '/admin/System/parameter',
  
  // 权限管理
  '/system/auth/menuList': '/admin/authMenu',
  '/system/auth/roleList': '/admin/authRoles',
  '/system/auth/deptList': '/admin/authDept',
  '/system/auth/postList': '/admin/authPost',
  '/system/auth/user/list': '/admin/authUser',
  
  // 系统工具
  '/system/sysJob/list': '/admin/jobList',
  '/system/sysAttachment/list': '/admin/sysAttachment',
  
  // 系统监控（如果需要显示的话）
  '/system/monitor/operLog': '/admin/auditLogs',
  
  // OTC资产管理 - 管理员接口
  '/api/v1/biz/asset/list': '/admin/otc/assets',
  '/api/v1/biz/callback/list': '/admin/otc/callbacks',
  '/api/v1/biz/currency/list': '/admin/otc/currencies',
  '/api/v1/biz/fee-config/lis': '/admin/otc/fee-config',
  '/api/v1/biz/recharge/list': '/admin/otc/recharges',
  '/api/v1/biz/transaction/list': '/admin/otc/transactions',
  '/api/v1/biz/transfer/list': '/admin/otc/transfers',
  '/api/v1/biz/payee/list': '/Adminconfiguration/payees',

  // OTC资产管理 - 普通用户接口
  '/api/v1/biz/user/api-key/list': '/otc/api-keys',
  '/api/v1/biz/user/payee/list': '/remittance/recipients',
  '/api/v1/biz/user/recharge/list': '/otc/recharges',
  '/api/v1/biz/user/security': '/settings',
  '/api/v1/biz/user/security/settings': '/settings',
  '/api/v1/biz/user/transaction/list': '/otc/transactions',
  '/api/v1/biz/user/transfer/list': '/otc/transfers',
  
  // 资产管理
  '/api/v1/biz/user/asset/list': '/assets/my-assets',
  
  // 全球汇款
  '/api/v1/biz/user/transfer/create': '/remittance/create',
  '/api/v1/biz/user/transfer/records': '/remittance/records',
}

/**
 * 将后端路径映射到前端路径
 * @param backendPath - 后端返回的路径
 * @returns 前端实际的路由路径
 */
const mapBackendPathToFrontend = (backendPath: string | undefined): string => {
  if (!backendPath) return '#'
  
  // 处理带参数的路径，如 /system/dict/data/list/:dictType
  // 先尝试精确匹配
  if (ROUTE_MAPPING[backendPath]) {
    return ROUTE_MAPPING[backendPath]
  }
  
  // 尝试去除首尾空格后的匹配
  const trimmedPath = backendPath.trim()
  if (ROUTE_MAPPING[trimmedPath]) {
    return ROUTE_MAPPING[trimmedPath]
  }
  
  // 处理带参数的路径，移除参数部分后匹配
  const pathWithoutParams = backendPath.split('/:')[0]
  if (ROUTE_MAPPING[pathWithoutParams]) {
    return ROUTE_MAPPING[pathWithoutParams]
  }
  
  // 如果路径是 System/parameter 或 system/parameter（忽略大小写），映射到正确的 admin 路由
  const lowerPath = trimmedPath.toLowerCase()
  if (lowerPath === 'system/parameter' || lowerPath === '/system/parameter') {
    return '/admin/System/parameter'
  }
  
  // 如果没有映射，确保路径以 / 开头后返回
  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`
}

/**
 * 需要隐藏的菜单路径列表
 * 这些路径对应的菜单及其所有子菜单都会被隐藏
 * 通常用于隐藏其他项目的功能，当前项目不支持的菜单
 */
const HIDDEN_MENU_PATHS: string[] = [
  // 在这里添加需要隐藏的菜单路径
  '/demo/outLink',
  '/system/sysNotice',
  '/system/monitor', // 监控相关菜单默认隐藏
  '/system/tools/gen', // 代码生成默认隐藏
  '/system/swagger', // API文档默认隐藏（如果需要显示可以移除）
  
  // 以下路由不在左侧菜单栏展示
  '/operation/dashboard', // 概览
  '/operation/clients', // 客户
  '/operation/assets', // 资产中心
  '/operation/fiatAssets', // 法币资产管理
  '/operation/digitalAssets', // 数字资产管理
  '/operation/transactions', // 交易管理
  '/operation/feeCenter', // 费率中心
  '/operation/financialProducts', // 理财产品
]

/**
 * 检查菜单路径是否应该被隐藏
 * @param path - 菜单路径
 * @returns 是否应该隐藏
 */
const shouldHideMenuByPath = (path: string | undefined): boolean => {
  if (!path) return false
  return HIDDEN_MENU_PATHS.some(hiddenPath => path.startsWith(hiddenPath))
}

/**
 * 将 API 返回的 menuList 转换为 VerticalMenuDataType 格式
 * @param menuList - API 返回的菜单列表（扁平数组）
 * @param dictionary - 字典数据（可选，用于翻译菜单标题）
 * @returns 转换后的菜单数据
 */
export const convertMenuListToVerticalMenu = (
  menuList: any[],
  dictionary?: Awaited<ReturnType<typeof getDictionary>>
): VerticalMenuDataType[] => {
  if (!menuList || menuList?.length === 0) {
    return []
  }

  // 过滤掉隐藏的菜单：检查 meta.isHide 或 isHide
  const visibleMenus = menuList.filter(menu => {
    const isHide = menu.meta?.isHide ?? menu.isHide
    return isHide !== 1 && isHide !== true
  })

  // 构建树形结构
  const menuTree = buildMenuTree(visibleMenus)

  // 转换为 VerticalMenuDataType 格式
  // 返回 null 表示该菜单应该被隐藏
  const convertNode = (node: MenuNode): VerticalMenuDataType | null => {
    // 检查路径是否在隐藏列表中，如果是则隐藏该菜单及其所有子菜单
    const menuPath = node.path || node.linkUrl
    if (shouldHideMenuByPath(menuPath)) {
      return null
    }

    // 根据当前语言获取菜单标题，优先使用 name 值查找翻译
    const label = getMenuLabel(node, dictionary)
    
    // 优先使用 meta.icon，其次使用 icon，如果都不存在则返回 undefined（不显示图标）
    const icon = node.meta?.icon || node.icon || undefined

    // 检查是否有子菜单
    const hasChildren = node.children && node.children.length > 0

    // 如果有子菜单，递归转换并过滤
    if (hasChildren) {
      const children = node
        .children!.filter(child => {
          // 过滤隐藏的菜单：检查 meta.isHide 或 isHide
          const isHide = child.meta?.isHide ?? child.isHide
          return isHide !== 1 && isHide !== true
        })
        .map(child => convertNode(child))
        .filter((child): child is VerticalMenuDataType => child !== null) // 过滤掉返回 null 的子菜单

      // 如果所有子菜单都被隐藏或过滤掉了，则父级菜单也应该被隐藏
      if (children.length === 0) {
        return null
      }

      // 有子菜单时，不设置 href（避免点击跳转）
      return {
        label,
        icon,
        children
      } as VerticalMenuDataType
    }

    // 没有子菜单，处理路由路径
    let href = '#'

    // 如果有外部链接（isLink），优先使用外部链接
    if (node.meta?.isLink && String(node.meta.isLink).trim()) {
      href = node.meta.isLink
    } else {
      // 否则将后端路径映射到前端路径
      const backendPath = node.path || node.linkUrl
      href = mapBackendPathToFrontend(backendPath)
    }

    // 默认关闭 exactMatch，使菜单在进入二级/详情页时也保持高亮
    // 例如：href 为 /assets/my-assets，当前路由为 /assets/my-assets/deposit 时，父级菜单仍然高亮
    return {
      label,
      icon,
      href,
      exactMatch: false
    }
  }

  const convertedMenus = menuTree
    .filter(node => {
      // 过滤隐藏的根菜单：检查 meta.isHide 或 isHide
      const isHide = node.meta?.isHide ?? node.isHide
      return isHide !== 1 && isHide !== true
    })
    .map(node => convertNode(node))
    .filter((menu): menu is VerticalMenuDataType => menu !== null) // 过滤掉返回 null 的菜单

  // 如果只有一个父级菜单，且该菜单有子菜单，则直接返回子菜单，去掉父级层级
  if (convertedMenus.length === 1) {
    const singleMenu = convertedMenus[0]
    // 检查是否有子菜单（使用类型守卫检查是否为 SubMenu 或 Section 类型）
    if ('children' in singleMenu && singleMenu.children && singleMenu.children.length > 0) {
      // 直接返回子菜单，去掉父级层级
      return singleMenu.children
    }
  }

  return convertedMenus
}
