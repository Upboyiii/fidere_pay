/**
 * 公开 API 模块
 * 处理不需要认证的公开接口
 */

// Third-party Imports
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Server Imports
import { createSuccessResponse, createErrorResponse } from '@server/utils'

/**
 * 获取公开的网站信息
 * GET /api/public/site-info
 */
export async function getSiteInfo(_req: NextRequest): Promise<NextResponse> {
  try {
    const siteInfo = {
      name: '管理后台系统',
      version: '5.0.0',
      description: '基于 Next.js 和 TypeScript 的现代化管理后台',
      features: ['用户认证与授权', '权限管理', '数据统计与分析', '响应式设计', '多语言支持'],
      contact: {
        email: 'support@example.com',
        phone: '+86 400-123-4567',
        address: '北京市朝阳区xxx街道xxx号'
      },
      social: {
        github: 'https://github.com/example/admin',
        twitter: 'https://twitter.com/example',
        linkedin: 'https://linkedin.com/company/example'
      }
    }

    return NextResponse.json(createSuccessResponse(siteInfo))
  } catch (error) {
    console.error('获取网站信息错误:', error)
    return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
  }
}

/**
 * 获取公开的统计数据
 * POST /api/public/statistics
 */
export async function getPublicStatistics(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { type } = body

    let statistics

    switch (type) {
      case 'overview':
        statistics = {
          totalUsers: 1250,
          activeUsers: 890,
          totalOrders: 5670,
          revenue: 125000
        }
        break
      case 'trends':
        statistics = {
          userGrowth: [120, 135, 148, 162, 175, 189],
          orderGrowth: [45, 52, 48, 61, 67, 73],
          revenueGrowth: [8500, 9200, 8800, 10500, 11200, 12800]
        }
        break
      default:
        statistics = {
          message: '未知的统计类型',
          availableTypes: ['overview', 'trends']
        }
    }

    return NextResponse.json(createSuccessResponse(statistics))
  } catch (error) {
    console.error('获取统计数据错误:', error)
    return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
  }
}

/**
 * 搜索公开内容
 * POST /api/public/search
 */
export async function searchPublicContent(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { query, type = 'all' } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(createErrorResponse('搜索关键词不能为空'), { status: 400 })
    }

    // 模拟搜索结果
    const mockResults = {
      all: [
        { id: 1, title: '搜索结果 1', content: '这是搜索结果 1 的内容', type: 'article' },
        { id: 2, title: '搜索结果 2', content: '这是搜索结果 2 的内容', type: 'product' },
        { id: 3, title: '搜索结果 3', content: '这是搜索结果 3 的内容', type: 'page' }
      ],
      articles: [{ id: 1, title: '文章搜索结果 1', content: '这是文章搜索结果的内容', type: 'article' }],
      products: [{ id: 2, title: '产品搜索结果 1', content: '这是产品搜索结果的内容', type: 'product' }],
      pages: [{ id: 3, title: '页面搜索结果 1', content: '这是页面搜索结果的内容', type: 'page' }]
    }

    const results = mockResults[type as keyof typeof mockResults] || mockResults.all

    return NextResponse.json(
      createSuccessResponse({
        query,
        type,
        results,
        total: results.length,
        timestamp: new Date().toISOString()
      })
    )
  } catch (error) {
    console.error('搜索 API 错误:', error)
    return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
  }
}

/**
 * 获取热门搜索词
 * GET /api/public/search/trending
 */
export async function getTrendingKeywords(_req: NextRequest): Promise<NextResponse> {
  try {
    const trendingKeywords = [
      { keyword: '用户管理', count: 1250 },
      { keyword: '权限设置', count: 980 },
      { keyword: '数据统计', count: 856 },
      { keyword: '系统配置', count: 742 },
      { keyword: '日志查看', count: 634 }
    ]

    return NextResponse.json(
      createSuccessResponse({
        trending: trendingKeywords,
        timestamp: new Date().toISOString()
      })
    )
  } catch (error) {
    console.error('获取热门搜索词错误:', error)
    return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
  }
}
