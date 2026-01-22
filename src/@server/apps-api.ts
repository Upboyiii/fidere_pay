/**
 * 应用模块 API
 * 处理各个应用模块的数据接口
 */

// Third-party Imports
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Server Imports
import type { PaginatedResponse } from '@server/types'
import { createSuccessResponse, createErrorResponse } from '@server/utils'

// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce'
import { db as academyData } from '@/fake-db/apps/academy'
import { db as vehicleData } from '@/fake-db/apps/logistics'
import { db as invoiceData } from '@/fake-db/apps/invoice'
import { db as userData } from '@/fake-db/apps/userList'
import { db as permissionData } from '@/fake-db/apps/permissions'

/**
 * 电商模块 API
 */
export const ecommerceApi = {
  /**
   * 获取电商数据
   * GET /api/apps/ecommerce
   */
  async getData(_req: NextRequest): Promise<NextResponse> {
    try {
      return NextResponse.json(createSuccessResponse(eCommerceData))
    } catch (error) {
      console.error('获取电商数据错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  },

  /**
   * 获取电商统计数据
   * GET /api/apps/ecommerce/stats
   */
  async getStats(_req: NextRequest): Promise<NextResponse> {
    try {
      const stats = {
        totalOrders: eCommerceData.orderData.length,
        totalRevenue: eCommerceData.orderData.reduce((sum, order) => sum + order.spent, 0),
        totalCustomers: eCommerceData.customerData.length,
        totalProducts: eCommerceData.products.length
      }

      return NextResponse.json(createSuccessResponse(stats))
    } catch (error) {
      console.error('获取电商统计错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  }
}

/**
 * 学院模块 API
 */
export const academyApi = {
  /**
   * 获取学院数据
   * GET /api/apps/academy
   */
  async getData(_req: NextRequest): Promise<NextResponse> {
    try {
      return NextResponse.json(createSuccessResponse(academyData))
    } catch (error) {
      console.error('获取学院数据错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  },

  /**
   * 获取课程列表
   * GET /api/apps/academy/courses
   */
  async getCourses(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search') || ''

      let courses = academyData.courses

      // 搜索过滤
      if (search) {
        courses = courses.filter(
          course =>
            course.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
            course.desc.toLowerCase().includes(search.toLowerCase())
        )
      }

      // 分页
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedCourses = courses.slice(startIndex, endIndex)

      const response: PaginatedResponse<(typeof paginatedCourses)[0]> = {
        data: paginatedCourses,
        pagination: {
          page,
          limit,
          total: courses.length,
          totalPages: Math.ceil(courses.length / limit)
        }
      }

      return NextResponse.json(response)
    } catch (error) {
      console.error('获取课程列表错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  }
}

/**
 * 物流模块 API
 */
export const logisticsApi = {
  /**
   * 获取物流数据
   * GET /api/apps/logistics
   */
  async getData(_req: NextRequest): Promise<NextResponse> {
    try {
      return NextResponse.json(createSuccessResponse(vehicleData))
    } catch (error) {
      console.error('获取物流数据错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  }
}

/**
 * 发票模块 API
 */
export const invoiceApi = {
  /**
   * 获取发票数据
   * GET /api/apps/invoice
   */
  async getData(_req: NextRequest): Promise<NextResponse> {
    try {
      return NextResponse.json(createSuccessResponse(invoiceData))
    } catch (error) {
      console.error('获取发票数据错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  }
}

/**
 * 用户模块 API
 */
export const userApi = {
  /**
   * 获取用户数据
   * GET /api/apps/users
   */
  async getData(_req: NextRequest): Promise<NextResponse> {
    try {
      return NextResponse.json(createSuccessResponse(userData))
    } catch (error) {
      console.error('获取用户数据错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  }
}

/**
 * 权限模块 API
 */
export const permissionApi = {
  /**
   * 获取权限数据
   * GET /api/apps/permissions
   */
  async getData(_req: NextRequest): Promise<NextResponse> {
    try {
      return NextResponse.json(createSuccessResponse(permissionData))
    } catch (error) {
      console.error('获取权限数据错误:', error)
      return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
    }
  }
}
