// React Imports
import { useState } from 'react'

// Third-party Imports
import { Button, Card, CardContent, CardHeader } from '@mui/material'

// Hook Imports
// import { useTokenManager } from '@/hooks/useTokenManager'

// Server Action Imports
import {
  createEcommerceItem,
  updateEcommerceItem,
  getPublicFaqData,
  getPublicPricingData,
  searchPublicContent,
  getSiteConfig,
  getPersonalizedContent,
  logPageVisit
} from '@/app/server/actions'

/**
 * Token 管理示例组件
 * 展示如何使用 Server Actions 和 Token 管理
 */
const TokenManagementExample = () => {
  // const { authenticatedFetch, refreshToken, isAuthenticated } = useTokenManager()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  /**
   * 手动刷新 token
   */
  const handleRefreshToken = async () => {
    setLoading(true)
    try {
      // await refreshToken()
      setResult('Token 刷新功能已禁用')
    } catch (error) {
      setResult(`Token 刷新失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 使用 Server Action 创建数据
   */
  const handleCreateItem = async () => {
    setLoading(true)
    try {
      const newItem = {
        name: '测试商品',
        price: 99.99,
        description: '这是一个测试商品'
      }

      const result = await createEcommerceItem(newItem)
      setResult(`创建成功: ${JSON.stringify(result)}`)
    } catch (error) {
      setResult(`创建失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 使用 Server Action 更新数据
   */
  const handleUpdateItem = async () => {
    setLoading(true)
    try {
      const updateData = {
        name: '更新的商品',
        price: 199.99
      }

      const result = await updateEcommerceItem('item-123', updateData)
      setResult(`更新成功: ${JSON.stringify(result)}`)
    } catch (error) {
      setResult(`更新失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 使用认证 fetch 请求
   */
  const handleAuthenticatedRequest = async () => {
    setLoading(true)
    try {
      // const response = await authenticatedFetch('/api/some-protected-endpoint')
      // const data = await response.json()
      setResult('认证请求功能已禁用')
    } catch (error) {
      setResult(`请求失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 测试公开 Server Actions（无需认证）
   */
  const handlePublicActions = async () => {
    setLoading(true)
    try {
      // 获取公开 FAQ 数据
      const faqData = await getPublicFaqData()

      // 获取网站配置
      const siteConfig = await getSiteConfig()

      // 搜索公开内容
      const searchResults = await searchPublicContent('测试搜索')

      setResult(
        `公开数据获取成功:\nFAQ: ${faqData.length} 条\n配置: ${siteConfig.siteName}\n搜索: ${searchResults.total} 个结果`
      )
    } catch (error) {
      setResult(`公开请求失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 测试可选认证 Server Actions
   */
  const handleOptionalAuthActions = async () => {
    setLoading(true)
    try {
      // 获取个性化内容（根据登录状态返回不同内容）
      const personalizedContent = await getPersonalizedContent()

      // 记录页面访问（无论是否登录）
      const visitLog = await logPageVisit('/token-example')

      setResult(
        `可选认证测试成功:\n内容类型: ${personalizedContent.type}\n访问记录: ${visitLog.success ? '已记录' : '记录失败'}`
      )
    } catch (error) {
      setResult(`可选认证请求失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 测试公开 API 请求（无需认证）
   */
  const handlePublicApiRequest = async () => {
    setLoading(true)
    try {
      // 获取网站信息
      const siteInfoResponse = await fetch('/api/public/site-info')
      const siteInfo = await siteInfoResponse.json()

      // 搜索公开内容
      const searchResponse = await fetch('/api/public/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '测试', type: 'all' })
      })
      const searchData = await searchResponse.json()

      setResult(`公开 API 请求成功:\n网站: ${siteInfo.name}\n搜索结果: ${searchData.total} 个`)
    } catch (error) {
      setResult(`公开 API 请求失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // 移除认证检查，允许未登录用户测试公开功能

  return (
    <Card>
      <CardHeader>
        <h2 className='text-xl font-semibold'>Token 管理示例</h2>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 需要认证的功能 */}
        {/* {isAuthenticated && (
          <div className='mb-6'>
            <h4 className='font-semibold mb-3 text-blue-600'>🔐 需要认证的功能</h4>
            <div className='flex flex-wrap gap-2'>
              <Button variant='contained' onClick={handleRefreshToken} disabled={loading}>
                手动刷新 Token
              </Button>
              <Button variant='outlined' onClick={handleCreateItem} disabled={loading}>
                创建数据 (Server Action)
              </Button>
              <Button variant='outlined' onClick={handleUpdateItem} disabled={loading}>
                更新数据 (Server Action)
              </Button>
              <Button variant='outlined' onClick={handleAuthenticatedRequest} disabled={loading}>
                认证请求 (Client)
              </Button>
            </div>
          </div>
        )} */}

        {/* 公开功能（无需认证） */}
        <div className='mb-6'>
          <h4 className='font-semibold mb-3 text-green-600'>🌐 公开功能（无需认证）</h4>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outlined' color='success' onClick={handlePublicActions} disabled={loading}>
              公开 Server Actions
            </Button>
            <Button variant='outlined' color='success' onClick={handlePublicApiRequest} disabled={loading}>
              公开 API 请求
            </Button>
          </div>
        </div>

        {/* 可选认证功能 */}
        <div className='mb-6'>
          <h4 className='font-semibold mb-3 text-orange-600'>🔄 可选认证功能</h4>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outlined' color='warning' onClick={handleOptionalAuthActions} disabled={loading}>
              可选认证 Actions
            </Button>
          </div>
        </div>

        {result && (
          <div className='mt-4 p-4 bg-gray-100 rounded'>
            <h4 className='font-semibold mb-2'>执行结果:</h4>
            <pre className='text-sm'>{result}</pre>
          </div>
        )}

        <div className='mt-4 p-4 bg-blue-50 rounded'>
          <h4 className='font-semibold mb-2'>功能说明:</h4>
          <div className='text-sm space-y-2'>
            <div>
              <strong className='text-blue-600'>🔐 需要认证:</strong>
              <ul className='ml-4 space-y-1'>
                <li>• 手动刷新 Token: 立即刷新访问 token</li>
                <li>• Server Actions: 自动处理认证和 token 刷新</li>
                <li>• 认证请求: 客户端带认证的 fetch 请求</li>
                <li>• 自动刷新: Token 过期前 5 分钟自动刷新</li>
              </ul>
            </div>
            <div>
              <strong className='text-green-600'>🌐 公开功能:</strong>
              <ul className='ml-4 space-y-1'>
                <li>• 公开 Server Actions: 无需认证的数据获取</li>
                <li>• 公开 API: 无需认证的 API 请求</li>
                <li>• 网站信息、搜索、FAQ 等公开内容</li>
              </ul>
            </div>
            <div>
              <strong className='text-orange-600'>🔄 可选认证:</strong>
              <ul className='ml-4 space-y-1'>
                <li>• 个性化内容: 根据登录状态返回不同内容</li>
                <li>• 访问日志: 记录用户访问，无论是否登录</li>
                <li>• 灵活的用户体验</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TokenManagementExample
