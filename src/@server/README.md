# @server 模块说明

这是服务器端代码的统一管理模块，所有文件都在根目录下，结构简洁。

## 文件说明

### 核心文件

- **`http.ts`** - HTTP 客户端（函数式，类似 axios）
- **`auth.ts`** - NextAuth.js 认证配置
- **`config.ts`** - 服务器配置常量
- **`middleware.ts`** - Next.js 中间件
- **`types.ts`** - 类型定义
- **`utils.ts`** - 工具函数

### API 文件

- **`auth-api.ts`** - 认证相关 API
- **`public-api.ts`** - 公开 API
- **`pages-api.ts`** - 页面相关 API
- **`apps-api.ts`** - 应用模块 API

## 使用方式

```typescript
// 服务端使用
import { get, post, setConfig, setRequestInterceptor } from '@server/http'

// 配置一次
setConfig({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 设置拦截器
setRequestInterceptor(config => ({
  ...config,
  headers: { ...config.headers, Authorization: 'Bearer token' }
}))

// 直接使用
const response = await get('/users')
```

```typescript
// 客户端使用
import { initClient, clientRequest } from '@server/http'

// 初始化一次
initClient()

// 直接使用
const response = await clientRequest.get('/users')
```
