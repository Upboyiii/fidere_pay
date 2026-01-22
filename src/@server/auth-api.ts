/**
 * 认证 API 模块
 * 处理认证相关的 API 接口
 */

// Third-party Imports
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

// Server Imports
import { authOptions } from '@server/auth'
import { createSuccessResponse, createErrorResponse } from '@server/utils'

// /**
//  * Token 刷新 API
//  * POST /api/auth/refresh
//  */
// export async function refreshToken(req: NextRequest): Promise<NextResponse> {
//   try {
//     // 获取当前会话
//     const session = await getServerSession(authOptions)

//     if (!session) {
//       return NextResponse.json(createErrorResponse('未授权访问'), { status: 401 })
//     }

//     // 从请求体中获取 refresh token
//     const body = await req.json()
//     const { refreshToken } = body

//     if (!refreshToken) {
//       return NextResponse.json(createErrorResponse('缺少 refresh token'), { status: 400 })
//     }

//     // 调用后端 API 刷新 token（通过代理）
//     const response = await fetch('/admin-api/auth/refresh', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${refreshToken}`
//       }
//     })

//     if (!response.ok) {
//       return NextResponse.json(createErrorResponse('Token 刷新失败'), { status: response.status })
//     }

//     const data = await response.json()

//     return NextResponse.json(
//       createSuccessResponse({
//         accessToken: data.accessToken,
//         refreshToken: data.refreshToken,
//         expires: data.expires || data.expiresIn
//       })
//     )
//   } catch (error) {
//     console.error('Token 刷新 API 错误:', error)
//     return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
//   }
// }

/**
 * 验证 Token 有效性
 * GET /api/auth/verify
 */
export async function verifyToken(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(createErrorResponse('未授权访问'), { status: 401 })
    }

    // 验证 token 是否有效（通过代理）
    const response = await fetch('/admin-api/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${(session as any).accessToken}`
      }
    })

    if (!response.ok) {
      return NextResponse.json(createErrorResponse('Token 无效'), { status: 401 })
    }

    return NextResponse.json(
      createSuccessResponse({
        valid: true,
        user: session.user
      })
    )
  } catch (error) {
    console.error('Token 验证错误:', error)
    return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
  }
}

/**
 * 用户登录
 * POST /api/auth/login
 */
export async function login(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(createErrorResponse('邮箱和密码不能为空'), { status: 400 })
    }

    // 调用后端登录 API（通过代理）
    const response = await fetch('/admin-api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(createErrorResponse(errorData.message || '登录失败'), {
        status: response.status
      })
    }

    const userData = await response.json()

    return NextResponse.json(createSuccessResponse(userData, '登录成功'))
  } catch (error) {
    console.error('登录 API 错误:', error)
    return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
  }
}

/**
 * 用户登出
 * POST /api/auth/logout
 */
export async function logout(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (session) {
      // 调用后端登出 API（通过代理）
      await fetch('/admin-api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any).accessToken}`
        }
      })
    }

    return NextResponse.json(createSuccessResponse(null, '登出成功'))
  } catch (error) {
    console.error('登出 API 错误:', error)
    return NextResponse.json(createErrorResponse('服务器内部错误'), { status: 500 })
  }
}
