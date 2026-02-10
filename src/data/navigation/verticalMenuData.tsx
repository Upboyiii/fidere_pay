// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'
import horizontalMenuData from './horizontalMenuData'
import { convertMenuListToVerticalMenu } from '@/utils/menuConverter'

/**
 * 将树形结构的菜单扁平化为数组
 * @param menuList - 菜单列表（可能是树形结构）
 * @returns 扁平化后的菜单列表
 */
const flattenMenuList = (menuList: any[]): any[] => {
  const result: any[] = []
  
  const flatten = (menus: any[]) => {
    menus.forEach(menu => {
      // 添加当前菜单项（不包含 children）
      const { children, ...menuWithoutChildren } = menu
      result.push(menuWithoutChildren)
      
      // 如果有子菜单，递归处理
      if (children && Array.isArray(children) && children.length > 0) {
        flatten(children)
      }
    })
  }
  
  flatten(menuList)
  return result
}

/**
 * 过滤出运营相关的菜单项（支持树形结构和扁平数组）
 * @param menuList - 菜单列表（可能是树形结构或扁平数组）
 * @returns 过滤后的菜单列表（扁平数组）
 */
const filterOperationMenus = (menuList: any[]): any[] => {
  if (!menuList || menuList.length === 0) {
    return []
  }
  
  // 先扁平化菜单列表（如果是树形结构）
  const flatMenuList = flattenMenuList(menuList)
  
  // 找出所有路径以 /operation/ 或 operation/ 开头的菜单项
  // 支持 path、linkUrl、component 字段，兼容有无前导斜杠的格式
  const operationMenus = flatMenuList.filter(menu => {
    const path = menu.path || menu.linkUrl || menu.component || ''
    // 标准化路径：确保以 /operation/ 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return normalizedPath.startsWith('/operation/')
  })
  
  if (operationMenus.length === 0) {
    return []
  }
  
  // 如果找到了运营菜单，还需要找出它们的父级菜单
  const operationMenuIds = new Set(operationMenus.map(menu => menu.id))
  
  // 递归找出所有父级菜单
  const findAllParents = (ids: Set<number | string>): Set<number | string> => {
    const newParentIds = new Set<number | string>()
    let foundNew = false
    
    flatMenuList.forEach(menu => {
      // 如果当前菜单在 ids 中，且它有父级（pid），且父级不在 ids 中
      if (ids.has(menu.id) && menu.pid && menu.pid !== 0 && menu.pid !== '0' && !ids.has(menu.pid)) {
        newParentIds.add(menu.pid)
        foundNew = true
      }
    })
    
    if (foundNew) {
      const allIds = new Set([...ids, ...newParentIds])
      return findAllParents(allIds)
    }
    
    return ids
  }
  
  const allRelatedIds = findAllParents(operationMenuIds)
  
  // 返回所有相关的菜单项（运营菜单及其父级菜单）
  return flatMenuList.filter(menu => allRelatedIds.has(menu.id))
}

/**
 * 获取垂直菜单数据
 * @param dictionary - 字典数据
 * @param userRole - 用户角色
 * @param menuList - 从 session 获取的菜单列表（可选，如果提供则使用动态菜单）
 * @returns 菜单数据数组
 */
const verticalMenuData = (
  dictionary: Awaited<ReturnType<typeof getDictionary>>,
  userRole?: string,
  menuList?: any[]
): VerticalMenuDataType[] => {
  // 运营角色的硬编码菜单（作为后备）
  const operationHardcodedMenu: VerticalMenuDataType[] = [
    {
      label: '概览',
      icon: 'ri-home-smile-line',
      href: '/operation/dashboard'
    },
    {
      label: '客户',
      icon: 'ri-user-line',
      href: '/operation/clients'
    },
    {
      label: dictionary?.navigation?.assetManagement || '资产管理',
      icon: 'ri-wallet-line',
      children: [
        {
          label: dictionary?.navigation?.assetsMyAssets || '我的资产',
          href: '/assets/my-assets'
        },
        {
          label: dictionary?.navigation?.assetsTransactions || '交易流水',
          href: '/assets/transactions'
        }
      ]
    },
    {
      label: dictionary?.navigation?.globalRemittance || '全球汇款',
      icon: 'ri-global-line',
      children: [
        {
          label: dictionary?.navigation?.remittanceCreate || '创建汇款',
          href: '/remittance/create'
        },
        {
          label: dictionary?.navigation?.remittanceRecipients || '收款人列表',
          href: '/remittance/recipients'
        },
        {
          label: dictionary?.navigation?.remittanceRecords || '汇款记录',
          href: '/remittance/records'
        }
      ]
    },
    {
      label: '开发配置',
      icon: 'ri-code-line',
      href: '/development'
    },
    // {
    //   label: '资产中心',
    //   icon: 'ri-user-line',
    //   href: '/operation/assets'
    // },
    // {
    //   label: '法币资产管理',
    //   icon: 'ri-shopping-cart-line',
    //   href: '/operation/fiatAssets'
    // },
    // {
    //   label: '数字资产管理',
    //   icon: 'ri-coin-line',
    //   href: '/operation/digitalAssets'
    // },
    // {
    //   label: '交易管理',
    //   icon: 'ri-exchange-line',
    //   href: '/operation/transactions'
    // },
    // {
    //   label: '费率中心',
    //   icon: 'ri-percent-line',
    //   href: '/operation/feeCenter'
    // },
    // {
    //   label: '理财产品',
    //   icon: 'ri-line-chart-line',
    //   href: '/operation/financialProducts'
    // }
  ]

  // KYC角色的硬编码菜单
  const kycHardcodedMenu: VerticalMenuDataType[] = [
    {
      label: dictionary?.navigation?.assetManagement || '资产管理',
      icon: 'ri-wallet-line',
      children: [
        {
          label: dictionary?.navigation?.assetsMyAssets || '我的资产',
          href: '/assets/my-assets'
        },
        {
          label: dictionary?.navigation?.assetsTransactions || '交易流水',
          href: '/assets/transactions'
        }
      ]
    },
    {
      label: dictionary?.navigation?.globalRemittance || '全球汇款',
      icon: 'ri-global-line',
      children: [
        {
          label: dictionary?.navigation?.remittanceCreate || '创建汇款',
          href: '/remittance/create'
        },
        {
          label: dictionary?.navigation?.remittanceRecipients || '收款人列表',
          href: '/remittance/recipients'
        },
        {
          label: dictionary?.navigation?.remittanceRecords || '汇款记录',
          href: '/remittance/records'
        }
      ]
    },
    {
      label: dictionary?.navigation?.development || '开发配置',
      icon: 'ri-code-line',
      href: '/development'
    }
  ]

  // 优先使用接口返回的动态菜单数据
  // 如果提供了 menuList，优先使用动态菜单
  if (menuList && menuList.length > 0) {
    // 调试日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 菜单调试信息:')
      console.log('  - 用户角色:', userRole)
      console.log('  - menuList 总数:', menuList.length)
      console.log('  - menuList 示例:', menuList.slice(0, 3))
    }

    // 根据角色过滤菜单
    let filteredMenuList = menuList
    const normalizedUserRole = userRole?.toLowerCase() || ''
    const isKycMode = normalizedUserRole === 'kyc' || normalizedUserRole.includes('kyc')
    const isOperationMode = normalizedUserRole === 'operation' || normalizedUserRole.includes('operation')
    const isAdminMode = normalizedUserRole === 'admin' || normalizedUserRole.includes('admin')

    // 运营角色：只显示运营相关的路由（/operation/ 开头）
    if (isOperationMode) {
      filteredMenuList = filterOperationMenus(menuList)
      if (process.env.NODE_ENV === 'development') {
        console.log('  - 运营模式，过滤后菜单数:', filteredMenuList.length)
      }
    }
    // 管理员角色：显示所有菜单
    else if (isAdminMode) {
      // 管理员显示所有菜单，不需要过滤
      if (process.env.NODE_ENV === 'development') {
        console.log('  - 管理员模式，显示所有菜单')
      }
    }
    // KYC角色和其他角色：显示所有菜单
    else {
      if (process.env.NODE_ENV === 'development') {
        console.log('  - 其他角色模式，显示所有菜单')
      }
    }

    // 转换菜单格式，传递字典用于翻译
    const dynamicMenu = convertMenuListToVerticalMenu(filteredMenuList, dictionary)
    
    // 如果动态菜单不为空，返回动态菜单
    if (dynamicMenu && dynamicMenu.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('  - 动态菜单转换成功，菜单数:', dynamicMenu.length)
        console.log('  - 动态菜单示例:', dynamicMenu.slice(0, 2))
      }
      return dynamicMenu
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('  - 动态菜单转换后为空，使用硬编码菜单作为后备')
      }
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 菜单调试信息:')
      console.log('  - menuList 为空或不存在，使用硬编码菜单作为后备')
      console.log('  - 用户角色:', userRole)
    }
  }

  // 如果没有动态菜单或动态菜单为空，使用硬编码菜单作为后备
  const normalizedUserRole = userRole?.toLowerCase() || ''
  const isKycMode = normalizedUserRole === 'kyc' || normalizedUserRole.includes('kyc')
  const isOperationMode = normalizedUserRole === 'operation' || normalizedUserRole.includes('operation')

  if (isKycMode) {
    return kycHardcodedMenu
  }

  if (isOperationMode) {
    return operationHardcodedMenu
  }

  // 默认菜单（管理员或其他角色，如果没有动态菜单）
  // 修复：horizontalMenuData 所有项已注释，会返回空数组导致登录后左侧菜单栏不可见
  // 使用 operationHardcodedMenu 作为默认后备，确保登录后始终可见菜单
  const defaultMenu = horizontalMenuData(dictionary)
  if (defaultMenu && defaultMenu.length > 0) {
    return defaultMenu
  }
  return operationHardcodedMenu
}
// This is how you will normally render submenu
// {
//   label: dictionary['navigation'].dashboards,
//   icon: 'ri-home-smile-line',
//   suffix: {
//     label: '5',
//     color: 'error'
//   },
//   children: [
//     // This is how you will normally render menu item
//     {
//       label: dictionary['navigation'].crm,
//       href: '/dashboards/crm'
//     },
//     {
//       label: dictionary['navigation'].analytics,
//       href: '/dashboards/analytics'
//     },
//     {
//       label: dictionary['navigation'].eCommerce,
//       href: '/dashboards/ecommerce'
//     },
//     {
//       label: dictionary['navigation'].academy,
//       href: '/dashboards/academy'
//     },
//     {
//       label: dictionary['navigation'].logistics,
//       href: '/dashboards/logistics'
//     }
//   ]
// },
// {
//   label: dictionary['navigation'].frontPages,
//   icon: 'ri-file-copy-line',
//   children: [
//     {
//       label: dictionary['navigation'].landing,
//       href: '/front-pages/landing-page',
//       target: '_blank',
//       excludeLang: true
//     },
//     {
//       label: dictionary['navigation'].pricing,
//       href: '/front-pages/pricing',
//       target: '_blank',
//       excludeLang: true
//     },
//     {
//       label: dictionary['navigation'].payment,
//       href: '/front-pages/payment',
//       target: '_blank',
//       excludeLang: true
//     },
//     {
//       label: dictionary['navigation'].checkout,
//       href: '/front-pages/checkout',
//       target: '_blank',
//       excludeLang: true
//     },
//     {
//       label: dictionary['navigation'].helpCenter,
//       href: '/front-pages/help-center',
//       target: '_blank',
//       excludeLang: true
//     }
//   ]
// },

// // This is how you will normally render menu section
// {
//   label: dictionary['navigation'].appsPages,
//   isSection: true,
//   children: [
//     {
//       label: dictionary['navigation'].eCommerce,
//       icon: 'ri-shopping-bag-3-line',
//       children: [
//         {
//           label: dictionary['navigation'].dashboard,
//           href: '/apps/ecommerce/dashboard'
//         },
//         {
//           label: dictionary['navigation'].products,
//           children: [
//             {
//               label: dictionary['navigation'].list,
//               href: '/apps/ecommerce/products/list'
//             },
//             {
//               label: dictionary['navigation'].add,
//               href: '/apps/ecommerce/products/add'
//             },
//             {
//               label: dictionary['navigation'].category,
//               href: '/apps/ecommerce/products/category'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].orders,
//           children: [
//             {
//               label: dictionary['navigation'].list,
//               href: '/apps/ecommerce/orders/list'
//             },
//             {
//               label: dictionary['navigation'].details,
//               href: '/apps/ecommerce/orders/details/5434',
//               exactMatch: false,
//               activeUrl: '/apps/ecommerce/orders/details'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].customers,
//           children: [
//             {
//               label: dictionary['navigation'].list,
//               href: '/apps/ecommerce/customers/list'
//             },
//             {
//               label: dictionary['navigation'].details,
//               href: '/apps/ecommerce/customers/details/879861',
//               exactMatch: false,
//               activeUrl: '/apps/ecommerce/customers/details'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].manageReviews,
//           href: '/apps/ecommerce/manage-reviews'
//         },
//         {
//           label: dictionary['navigation'].referrals,
//           href: '/apps/ecommerce/referrals'
//         },
//         {
//           label: dictionary['navigation'].settings,
//           href: '/apps/ecommerce/settings'
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].academy,
//       icon: 'ri-graduation-cap-line',
//       children: [
//         {
//           label: dictionary['navigation'].dashboard,
//           href: '/apps/academy/dashboard'
//         },
//         {
//           label: dictionary['navigation'].myCourses,
//           href: '/apps/academy/my-courses'
//         },
//         {
//           label: dictionary['navigation'].courseDetails,
//           href: '/apps/academy/course-details'
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].logistics,
//       icon: 'ri-car-line',
//       children: [
//         {
//           label: dictionary['navigation'].dashboard,
//           href: '/apps/logistics/dashboard'
//         },
//         {
//           label: dictionary['navigation'].fleet,
//           href: '/apps/logistics/fleet'
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].email,
//       icon: 'ri-mail-open-line',
//       href: '/apps/email',
//       exactMatch: false,
//       activeUrl: '/apps/email'
//     },
//     {
//       label: dictionary['navigation'].chat,
//       icon: 'ri-wechat-line',
//       href: '/apps/chat'
//     },
//     {
//       label: dictionary['navigation'].calendar,
//       icon: 'ri-calendar-line',
//       href: '/apps/calendar'
//     },
//     {
//       label: dictionary['navigation'].kanban,
//       icon: 'ri-drag-drop-line',
//       href: '/apps/kanban'
//     },
//     {
//       label: dictionary['navigation'].invoice,
//       icon: 'ri-bill-line',
//       children: [
//         {
//           label: dictionary['navigation'].list,
//           href: '/apps/invoice/list'
//         },
//         {
//           label: dictionary['navigation'].preview,
//           href: '/apps/invoice/preview/4987',
//           exactMatch: false,
//           activeUrl: '/apps/invoice/preview'
//         },
//         {
//           label: dictionary['navigation'].edit,
//           href: '/apps/invoice/edit/4987',
//           exactMatch: false,
//           activeUrl: '/apps/invoice/edit'
//         },
//         {
//           label: dictionary['navigation'].add,
//           href: '/apps/invoice/add'
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].user,
//       icon: 'ri-user-line',
//       children: [
//         {
//           label: dictionary['navigation'].list,
//           href: '/apps/user/list'
//         },
//         {
//           label: dictionary['navigation'].view,
//           href: '/apps/user/view'
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].rolesPermissions,
//       icon: 'ri-lock-2-line',
//       children: [
//         {
//           label: dictionary['navigation'].roles,
//           href: '/apps/roles'
//         },
//         {
//           label: dictionary['navigation'].permissions,
//           href: '/apps/permissions'
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].pages,
//       icon: 'ri-layout-left-line',
//       children: [
//         {
//           label: dictionary['navigation'].userProfile,
//           href: '/pages/user-profile'
//         },
//         {
//           label: dictionary['navigation'].accountSettings,
//           href: '/pages/account-settings'
//         },
//         {
//           label: dictionary['navigation'].faq,
//           href: '/pages/faq'
//         },
//         {
//           label: dictionary['navigation'].pricing,
//           href: '/pages/pricing'
//         },
//         {
//           label: dictionary['navigation'].miscellaneous,
//           children: [
//             {
//               label: dictionary['navigation'].comingSoon,
//               href: '/pages/misc/coming-soon',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].underMaintenance,
//               href: '/pages/misc/under-maintenance',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].pageNotFound404,
//               href: '/pages/misc/404-not-found',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].notAuthorized401,
//               href: '/pages/misc/401-not-authorized',
//               target: '_blank'
//             }
//           ]
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].authPages,
//       icon: 'ri-shield-keyhole-line',
//       children: [
//         {
//           label: dictionary['navigation'].login,
//           children: [
//             {
//               label: dictionary['navigation'].loginV1,
//               href: '/pages/auth/login-v1',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].loginV2,
//               href: '/pages/auth/login-v2',
//               target: '_blank'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].register,
//           children: [
//             {
//               label: dictionary['navigation'].registerV1,
//               href: '/pages/auth/register-v1',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].registerV2,
//               href: '/pages/auth/register-v2',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].registerMultiSteps,
//               href: '/pages/auth/register-multi-steps',
//               target: '_blank'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].verifyEmail,
//           children: [
//             {
//               label: dictionary['navigation'].verifyEmailV1,
//               href: '/pages/auth/verify-email-v1',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].verifyEmailV2,
//               href: '/pages/auth/verify-email-v2',
//               target: '_blank'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].forgotPassword,
//           children: [
//             {
//               label: dictionary['navigation'].forgotPasswordV1,
//               href: '/pages/auth/forgot-password-v1',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].forgotPasswordV2,
//               href: '/pages/auth/forgot-password-v2',
//               target: '_blank'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].resetPassword,
//           children: [
//             {
//               label: dictionary['navigation'].resetPasswordV1,
//               href: '/pages/auth/reset-password-v1',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].resetPasswordV2,
//               href: '/pages/auth/reset-password-v2',
//               target: '_blank'
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].twoSteps,
//           children: [
//             {
//               label: dictionary['navigation'].twoStepsV1,
//               href: '/pages/auth/two-steps-v1',
//               target: '_blank'
//             },
//             {
//               label: dictionary['navigation'].twoStepsV2,
//               href: '/pages/auth/two-steps-v2',
//               target: '_blank'
//             }
//           ]
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].wizardExamples,
//       icon: 'ri-git-commit-line',
//       children: [
//         {
//           label: dictionary['navigation'].checkout,
//           href: '/pages/wizard-examples/checkout'
//         },
//         {
//           label: dictionary['navigation'].propertyListing,
//           href: '/pages/wizard-examples/property-listing'
//         },
//         {
//           label: dictionary['navigation'].createDeal,
//           href: '/pages/wizard-examples/create-deal'
//         }
//       ]
//     },
//     {
//       label: dictionary['navigation'].dialogExamples,
//       icon: 'ri-tv-2-line',
//       href: '/pages/dialog-examples'
//     },
//     {
//       label: dictionary['navigation'].widgetExamples,
//       icon: 'ri-bar-chart-box-line',
//       children: [
//         {
//           label: dictionary['navigation'].basic,
//           href: '/pages/widget-examples/basic'
//         },
//         {
//           label: dictionary['navigation'].advanced,
//           href: '/pages/widget-examples/advanced'
//         },
//         {
//           label: dictionary['navigation'].statistics,
//           href: '/pages/widget-examples/statistics'
//         },
//         {
//           label: dictionary['navigation'].charts,
//           href: '/pages/widget-examples/charts'
//         },
//         {
//           label: dictionary['navigation'].gamification,
//           href: '/pages/widget-examples/gamification'
//         },
//         {
//           label: dictionary['navigation'].actions,
//           href: '/pages/widget-examples/actions'
//         }
//       ]
//     }
//   ]
// },
// {
//   label: dictionary['navigation'].formsAndTables,
//   isSection: true,
//   children: [
//     {
//       label: dictionary['navigation'].formLayouts,
//       icon: 'ri-layout-4-line',
//       href: '/forms/form-layouts'
//     },
//     {
//       label: dictionary['navigation'].formValidation,
//       icon: 'ri-checkbox-multiple-line',
//       href: '/forms/form-validation'
//     },
//     {
//       label: dictionary['navigation'].formWizard,
//       icon: 'ri-git-commit-line',
//       href: '/forms/form-wizard'
//     },
//     {
//       label: dictionary['navigation'].reactTable,
//       icon: 'ri-table-alt-line',
//       href: '/react-table'
//     },
//     {
//       label: dictionary['navigation'].formELements,
//       icon: 'ri-radio-button-line',
//       suffix: <i className='ri-external-link-line text-xl' />,
//       href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`,
//       target: '_blank'
//     },
//     {
//       label: dictionary['navigation'].muiTables,
//       icon: 'ri-table-2',
//       href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`,
//       suffix: <i className='ri-external-link-line text-xl' />,
//       target: '_blank'
//     }
//   ]
// },
// {
//   label: dictionary['navigation'].chartsMisc,

//   isSection: true,
//   children: [
//     {
//       label: dictionary['navigation'].charts,
//       icon: 'ri-bar-chart-2-line',
//       children: [
//         {
//           label: dictionary['navigation'].apex,
//           href: '/charts/apex-charts'
//         },
//         {
//           label: dictionary['navigation'].recharts,
//           href: '/charts/recharts'
//         }
//       ]
//     },

//     {
//       label: dictionary['navigation'].foundation,
//       icon: 'ri-pantone-line',
//       href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/foundation`,
//       suffix: <i className='ri-external-link-line text-xl' />,
//       target: '_blank'
//     },
//     {
//       label: dictionary['navigation'].components,
//       icon: 'ri-toggle-line',
//       href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`,
//       suffix: <i className='ri-external-link-line text-xl' />,
//       target: '_blank'
//     },
//     {
//       label: dictionary['navigation'].menuExamples,
//       icon: 'ri-menu-search-line',
//       href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`,
//       suffix: <i className='ri-external-link-line text-xl' />,
//       target: '_blank'
//     },
//     {
//       label: dictionary['navigation'].raiseSupport,
//       icon: 'ri-lifebuoy-line',
//       href: 'https://themeselection.com/support',
//       suffix: <i className='ri-external-link-line text-xl' />,
//       target: '_blank'
//     },
//     {
//       label: dictionary['navigation'].documentation,
//       icon: 'ri-book-line',
//       href: `${process.env.NEXT_PUBLIC_DOCS_URL}`,
//       suffix: <i className='ri-external-link-line text-xl' />,
//       target: '_blank'
//     },
//     {
//       label: dictionary['navigation'].others,
//       icon: 'ri-more-line',
//       children: [
//         {
//           suffix: {
//             label: 'New',
//             color: 'info'
//           },
//           label: dictionary['navigation'].itemWithBadge
//         },
//         {
//           label: dictionary['navigation'].externalLink,
//           href: 'https://themeselection.com',
//           target: '_blank',
//           suffix: <i className='ri-external-link-line text-xl' />
//         },
//         {
//           label: dictionary['navigation'].menuLevels,
//           children: [
//             {
//               label: dictionary['navigation'].menuLevel2
//             },
//             {
//               label: dictionary['navigation'].menuLevel2,
//               children: [
//                 {
//                   label: dictionary['navigation'].menuLevel3
//                 },
//                 {
//                   label: dictionary['navigation'].menuLevel3
//                 }
//               ]
//             }
//           ]
//         },
//         {
//           label: dictionary['navigation'].disabledMenu,
//           disabled: true
//         }
//       ]
//     }
//   ]
// }

export default verticalMenuData
