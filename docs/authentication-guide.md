# Next.js Server Actions 认证配置指南

## 概述

本项目实现了灵活的认证系统，支持三种不同的认证模式：

1. **需要认证** - 强制要求用户登录
2. **公开访问** - 无需认证即可访问
3. **可选认证** - 根据登录状态提供不同体验

## 🔐 需要认证的功能

### Server Actions
```typescript
// 默认需要认证
export const getEcommerceData = withAuth(async () => {
  return eCommerceData
})

// 明确指定需要认证
export const createEcommerceItem = withAuth(async (data: any) => {
  // 业务逻辑
}, true) // 第二个参数为 true（默认值）
```

### 中间件保护
```typescript
// 在 middleware.ts 中配置需要认证的路径
const protectedPaths = [
  '/dashboard',
  '/apps', 
  '/admin',
  '/profile',
  '/settings'
]
```

### 客户端使用
```typescript
const { authenticatedFetch } = useTokenManager()

// 自动处理认证和 token 刷新
const response = await authenticatedFetch('/api/protected-endpoint')
```

## 🌐 公开功能（无需认证）

### Server Actions
```typescript
// 明确指定不需要认证
export const getPublicFaqData = withAuth(async () => {
  return faqData
}, false) // 第二个参数为 false

export const searchPublicContent = withAuth(async (query: string) => {
  // 搜索逻辑
}, false)
```

### API 路由
```typescript
// /api/public/site-info/route.ts
export async function GET(req: NextRequest) {
  // 无需认证检查，直接返回数据
  return NextResponse.json(siteInfo)
}
```

### 中间件配置
```typescript
// 完全公开的路径
const publicPaths = [
  '/login',
  '/register',
  '/api/auth',
  '/api/public',
  '/front-pages',
  '/images'
]
```

## 🔄 可选认证功能

### Server Actions
```typescript
// 使用 withOptionalAuth 装饰器
export const getPersonalizedContent = withOptionalAuth(async (session: any) => {
  if (session?.user) {
    // 用户已登录，返回个性化内容
    return {
      type: 'personalized',
      content: `欢迎回来，${session.user.name}！`
    }
  } else {
    // 用户未登录，返回默认内容
    return {
      type: 'default',
      content: '欢迎访问我们的网站！'
    }
  }
})

export const logPageVisit = withOptionalAuth(async (page: string, session: any) => {
  const logData = {
    page,
    userId: session?.user?.id || 'anonymous',
    isAuthenticated: !!session
  }
  return { success: true, logged: logData }
})
```

### 中间件配置
```typescript
// 可选认证的路径（允许访问，但可能需要用户信息）
const optionalAuthPaths = [
  '/',
  '/home',
  '/about',
  '/contact',
  '/pricing',
  '/faq'
]
```

## 🛠️ 装饰器详解

### withAuth 装饰器
```typescript
function withAuth<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  requireAuth: boolean = true // 默认需要认证
): (...args: T) => Promise<R>
```

**功能：**
- 自动检查用户会话
- Token 过期检查和刷新
- 统一的错误处理
- 支持可选认证模式

### withOptionalAuth 装饰器
```typescript
function withOptionalAuth<T extends any[], R>(
  action: (...args: [...T, any]) => Promise<R>
): (...args: T) => Promise<R>
```

**功能：**
- 获取会话信息（可能为空）
- 将 session 作为额外参数传递
- 不强制要求认证

## 🔄 Token 刷新机制

### 自动刷新
- Token 过期前 5 分钟自动刷新
- 在 JWT 回调中处理
- 客户端定时器自动触发

### 手动刷新
```typescript
const { refreshToken } = useTokenManager()
await refreshToken()
```

### API 端点
```typescript
// POST /api/auth/refresh
// GET /api/auth/verify
```

## 📝 使用示例

### 组件中使用
```typescript
const TokenManagementExample = () => {
  const { authenticatedFetch, refreshToken, isAuthenticated } = useTokenManager()

  // 需要认证的操作
  const handleProtectedAction = async () => {
    if (!isAuthenticated) return
    const data = await createEcommerceItem(newItem)
  }

  // 公开操作
  const handlePublicAction = async () => {
    const data = await getPublicFaqData() // 无需认证
  }

  // 可选认证操作
  const handleOptionalAction = async () => {
    const content = await getPersonalizedContent() // 根据登录状态返回不同内容
  }
}
```

## 🚀 最佳实践

1. **明确认证需求**：根据业务需求选择合适的认证模式
2. **统一错误处理**：使用装饰器统一处理认证错误
3. **性能优化**：公开接口避免不必要的认证检查
4. **用户体验**：可选认证提供更好的用户体验
5. **安全性**：敏感操作必须使用强制认证

## 🔧 配置说明

### 环境变量
```env
API_URL=your-backend-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 数据库配置
- 使用 Prisma 管理用户会话
- 支持 JWT 和数据库会话策略
- 自动处理 token 存储和刷新

这个认证系统提供了完整的灵活性，可以根据不同的业务需求选择合适的认证模式，既保证了安全性，又提供了良好的用户体验。
