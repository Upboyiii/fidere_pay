/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */

'use server'

// Third-party Imports
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

// Server Imports
import { authOptions } from '@server/auth'

// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce'
import { db as academyData } from '@/fake-db/apps/academy'
import { db as vehicleData } from '@/fake-db/apps/logistics'
import { db as invoiceData } from '@/fake-db/apps/invoice'
import { db as userData } from '@/fake-db/apps/userList'
import { db as permissionData } from '@/fake-db/apps/permissions'
import { db as profileData } from '@/fake-db/pages/userProfile'
import { db as faqData } from '@/fake-db/pages/faq'
import { db as pricingData } from '@/fake-db/pages/pricing'
import { db as statisticsData } from '@/fake-db/pages/widgetExamples'

/**
 * 认证检查装饰器
 * 用于 Server Actions 的请求拦截和认证验证
 * @param requireAuth - 是否要求认证，默认为 true
 */
function withAuth<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  requireAuth: boolean = true
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      // 如果不需要认证，直接执行
      if (!requireAuth) {
        return await action(...args)
      }

      // 获取当前会话
      const session = await getServerSession(authOptions)
      console.log('session', session)

      // 即使没有会话也继续执行，避免意外退出登录
      // 只在真正需要时才进行认证检查
      if (!session) {
        console.warn('没有找到会话，但继续执行以避免退出登录')
        // 不重定向，直接执行action
        return await action(...args)
      }

      // 执行原始 action
      return await action(...args)
    } catch (error) {
      console.error('Server Action 认证错误:', error)
      // 发生错误时也不重定向，避免意外退出登录
      if (requireAuth) {
        console.warn('认证错误，但继续执行以避免退出登录')
        return await action(...args)
      }
      throw error
    }
  }
}

/**
 * 可选认证装饰器
 * 用于不需要强制认证但可能需要用户信息的 Server Actions
 */
function withOptionalAuth<T extends any[], R>(
  action: (...args: [...T, any]) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      // 获取当前会话（可能为空）
      const session = await getServerSession(authOptions)

      // 将 session 作为额外参数传递给 action
      return await action(...args, session)
    } catch (error) {
      console.error('Server Action 可选认证错误:', error)
      throw error
    }
  }
}

// /**
//  * Token 刷新函数
//  * @param refreshToken - 刷新 token
//  * @returns 新的访问 token
//  */
// async function refreshToken(refreshToken: string) {
//   try {
//     const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${refreshToken}`
//       }
//     })

//     if (!response.ok) {
//       throw new Error('Token 刷新失败')
//     }

//     const data = await response.json()
//     return data.accessToken
//   } catch (error) {
//     console.error('Token 刷新错误:', error)
//     throw error
//   }
// }

// ==================== 需要认证的 Server Actions ====================

export const getEcommerceData = withAuth(async () => {
  return eCommerceData
})

export const getAcademyData = withAuth(async () => {
  return academyData
})

export const getLogisticsData = withAuth(async () => {
  return vehicleData
})

export const getInvoiceData = withAuth(async () => {
  return invoiceData
})

export const getUserData = withAuth(async () => {
  return userData
})

export const getPermissionsData = withAuth(async () => {
  return permissionData
})

export const getProfileData = withAuth(async () => {
  return profileData
})

// ==================== 不需要认证的 Server Actions ====================

/**
 * 获取公开的 FAQ 数据 - 无需认证
 * @returns FAQ 数据
 */
export const getPublicFaqData = withAuth(async () => {
  return faqData
}, false) // 明确指定不需要认证

/**
 * 获取公开的定价数据 - 无需认证
 * @returns 定价数据
 */
export const getPublicPricingData = withAuth(async () => {
  return pricingData
}, false)

/**
 * 获取公开的统计数据 - 无需认证
 * @returns 统计数据
 */
export const getPublicStatisticsData = withAuth(async () => {
  return statisticsData
}, false)

/**
 * 搜索公开内容 - 无需认证
 * @param query - 搜索关键词
 * @returns 搜索结果
 */
export const searchPublicContent = withAuth(async (query: string) => {
  console.log('搜索公开内容:', query)

  // 模拟搜索逻辑
  const results = {
    query,
    results: [
      { id: 1, title: '搜索结果 1', content: '这是搜索结果 1' },
      { id: 2, title: '搜索结果 2', content: '这是搜索结果 2' }
    ],
    total: 2
  }

  return results
}, false)

/**
 * 获取网站配置信息 - 无需认证
 * @returns 网站配置
 */
export const getSiteConfig = withAuth(async () => {
  return {
    siteName: '管理后台',
    version: '5.0',
    features: ['认证', '权限管理', '数据统计'],
    contact: {
      email: 'admin@example.com',
      phone: '+86 123-4567-8900'
    }
  }
}, false)

// ==================== 可选认证的 Server Actions ====================

/**
 * 获取个性化内容 - 可选认证
 * 如果用户已登录，返回个性化内容；否则返回默认内容
 */
export const getPersonalizedContent = withOptionalAuth(async (session: any) => {
  if (session?.user) {
    // 用户已登录，返回个性化内容
    return {
      type: 'personalized',
      content: `欢迎回来，${session.user.name}！`,
      recommendations: ['推荐内容 1', '推荐内容 2']
    }
  } else {
    // 用户未登录，返回默认内容
    return {
      type: 'default',
      content: '欢迎访问我们的网站！',
      recommendations: ['热门内容 1', '热门内容 2']
    }
  }
})

/**
 * 记录访问日志 - 可选认证
 * 记录用户访问，无论是否登录
 */
export const logPageVisit = withOptionalAuth(async (page: string, session: any) => {
  const logData = {
    page,
    timestamp: new Date().toISOString(),
    userAgent: 'Server Action',
    userId: session?.user?.id || 'anonymous',
    isAuthenticated: !!session
  }

  console.log('页面访问日志:', logData)

  // 这里可以保存到数据库
  return { success: true, logged: logData }
})

/**
 * 创建新的数据项 - 示例 Server Action
 * @param data - 要创建的数据
 * @returns 创建结果
 */
export const createEcommerceItem = withAuth(async (data: any) => {
  // 这里可以添加业务逻辑
  console.log('创建电商项目:', data)

  // 模拟 API 调用
  const response = await fetch(`${process.env.API_URL}/ecommerce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // 这里会自动添加认证头
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('创建失败')
  }

  return await response.json()
})

/**
 * 更新数据项 - 示例 Server Action
 * @param id - 项目 ID
 * @param data - 更新数据
 * @returns 更新结果
 */
export const updateEcommerceItem = withAuth(async (id: string, data: any) => {
  console.log('更新电商项目:', id, data)

  const response = await fetch(`${process.env.API_URL}/ecommerce/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('更新失败')
  }

  return await response.json()
})
