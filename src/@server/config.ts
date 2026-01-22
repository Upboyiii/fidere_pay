/**
 * Server 端配置
 * 集中管理服务器端配置项
 */

// 环境配置
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production', // 生产环境
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  // 网站类型：用于区分三个网站的入口 (kyc | operation | admin)
  SITE_TYPE: process.env.NEXT_PUBLIC_SITE_TYPE || process.env.SITE_TYPE || 'admin'
}

// API 配置
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:3000',
  TIMEOUT: 30000 // 30秒
}

// 认证配置
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30天
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: false
}

// 数据库配置（移除，因为 Cloudflare Pages 不需要本地数据库）
// export const DATABASE_CONFIG = {
//   URL: process.env.DATABASE_URL || 'file:./dev.db'
// }

// 缓存配置（简化版）
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300 // 5分钟
}

// 文件上传配置（简化版）
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
}

// 日志配置（简化版）
export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_CONSOLE: true
}

// 安全配置（简化版）
export const SECURITY_CONFIG = {
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
}

// 邮件配置（简化版）
export const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || 'noreply@example.com'
}

// 第三方服务配置
export const THIRD_PARTY_CONFIG = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
}

// 功能开关（简化版）
export const FEATURE_FLAGS = {
  ENABLE_DEBUG_MODE: process.env.ENABLE_DEBUG_MODE === 'true'
}

// 导出所有配置
export const SERVER_CONFIG = {
  ENV: ENV_CONFIG,
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  // DATABASE: DATABASE_CONFIG, // 移除数据库配置
  CACHE: CACHE_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
  LOG: LOG_CONFIG,
  SECURITY: SECURITY_CONFIG,
  EMAIL: EMAIL_CONFIG,
  THIRD_PARTY: THIRD_PARTY_CONFIG,
  FEATURES: FEATURE_FLAGS
}
