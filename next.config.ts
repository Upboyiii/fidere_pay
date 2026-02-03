import type { NextConfig } from 'next'

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
    proxy: process.env.proxy || ''
  },
  // 代理配置 - 类似 Vite 的代理方式
  // 注意：NextAuth 使用 /api/auth 路径（标准路径），不会与后端 API 代理冲突
  async rewrites() {
    let apiBaseUrl: string
    if (process.env.NODE_ENV === 'production' && process.env.proxy === 'odi') {
      // 生产环境且 proxy 为 odi 时的请求地址
      console.error('1231312')

      apiBaseUrl = 'http://b1dae9bc5cabbc13e4bee21af11cdb8d_manage.oditrust.com:9002' // 可根据需要修改为其他地址
    } else if (process.env.NODE_ENV === 'production') {
      // 生产环境
      apiBaseUrl = 'http://b1dae9bc5cabbc13e4bee21af11cdb8d_manage.oditrust.com:9002'
    } else {
      // 开发环境
      apiBaseUrl = 'http://192.168.5.111:9009'
    }
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
