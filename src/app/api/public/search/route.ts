// Server Imports
import { searchPublicContent, getTrendingKeywords } from '@server/public-api'

/**
 * 搜索公开内容
 * POST /api/public/search
 */
export async function POST(req: Request) {
  return searchPublicContent(req as any)
}

/**
 * 获取热门搜索词
 * GET /api/public/search
 */
export async function GET(req: Request) {
  return getTrendingKeywords(req as any)
}
