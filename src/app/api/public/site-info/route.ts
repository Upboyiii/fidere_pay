// Server Imports
import { getSiteInfo, getPublicStatistics } from '@server/public-api'

/**
 * 获取公开的网站信息
 * GET /api/public/site-info
 */
export async function GET(req: Request) {
  return getSiteInfo(req as any)
}

/**
 * 获取公开的统计数据
 * POST /api/public/site-info
 */
export async function POST(req: Request) {
  return getPublicStatistics(req as any)
}
