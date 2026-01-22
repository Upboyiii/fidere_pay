import { NextResponse } from 'next/server'

/**
 * 获取 Remix Icon 图标列表的 API 路由
 * 从本地的 @iconify/json 包读取图标数据
 */
export async function GET() {
  try {
    // 动态导入 @iconify/json 包
    const riJson = await import('@iconify/json/json/ri.json')
    
    // 获取所有图标名称
    const iconNames = Object.keys(riJson.default.icons || {})
    
    // 只返回 line 风格的图标，并添加 ri- 前缀
    const lineIcons = iconNames
      .filter(name => name.includes('-line'))
      .map(name => `ri-${name}`)
      .sort()
    
    return NextResponse.json({
      success: true,
      data: lineIcons,
      count: lineIcons.length
    })
  } catch (error) {
    console.error('加载图标列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '加载图标列表失败',
        data: []
      },
      { status: 500 }
    )
  }
}

