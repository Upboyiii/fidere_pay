import type { NextConfig } from 'next'

// 统一计算 API 基础地址
// 优先使用环境变量 API_URL，方便本地切换测试服务器
// 使用方法：
//   1. 连接本地开发服务器（默认）: 不设置或 API_URL=http://192.168.5.111:9009
//   2. 连接测试服务器: API_URL=https://server.fidere.xyz
//   可以在 .env.local 文件中设置，或启动时指定：API_URL=https://server.fidere.xyz npm run dev
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (process.env.API_URL) {
    return process.env.API_URL
  }
  // 生产环境使用线上地址
  if (process.env.NODE_ENV === 'production') {
    return 'https://server.fidere.xyz'
  }
  // 开发环境默认使用本地地址
  return 'http://192.168.5.111:9009'
}

const apiBaseUrl = getApiBaseUrl()
console.log('🔗 API Base URL:', apiBaseUrl)

const nextConfig: NextConfig = {
  // 忽略构建错误
  experimental: {
    // missingSuspenseWithCSRBailout: false // 移除不支持的配置
  },
  basePath: process.env.BASEPATH,
  // 关闭 TypeScript 类型检查1
  typescript: {
    ignoreBuildErrors: true
  },
  // 关闭 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true
  },
  // Cloudflare Pages 适配配置
  output: 'standalone',
  // 图片优化配置
  images: {
    unoptimized: true, // Cloudflare Pages 不支持 Next.js 图片优化
    domains: ['9b9db7dcceb5c_server.fideretrust.com']
  },
  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // 网站类型配置，用于区分三个网站的入口 (kyc | operation | admin)
    NEXT_PUBLIC_SITE_TYPE: process.env.SITE_TYPE || 'admin',
    // 代理配置，暴露到客户端
    proxy: process.env.proxy || '',
    // API 基础地址，用于文件下载等（暴露到客户端）
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl
  },
  // 代理配置 - 类似 Vite 的代理方式
  // 注意：NextAuth 使用 /api/auth 路径（标准路径），不会与后端 API 代理冲突
  async rewrites() {
    return [
      {
        source: '/admin-api/:path*',
        // destination: 'http://192.168.5.58:8808/admin-api/:path*' // 本地开发（可选）
        destination: `${apiBaseUrl}/:path*`
      },
      // 统一代理所有 /_api/v1/ 开头的请求（完整路径）
      // 注意：使用 /_api/v1 前缀避免与服务器其他配置冲突
      {
        source: '/_api/v1/:path*',
        destination: `${apiBaseUrl}/api/v1/:path*`
      },
      // 短路径支持（自动添加 /api/v1/ 前缀）
      {
        source: '/:module(pub|system|member|operation|general)/:path*',
        destination: `${apiBaseUrl}/api/v1/:module/:path*`
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/zh-CN/login',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|zh-CN|zh-Hant)',
        destination: '/:lang/login',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|zh-CN|zh-Hant|front-pages|favicon.ico)\\b)):path',
        destination: '/zh-CN/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
