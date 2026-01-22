/**
 * 更新 wrangler.jsonc 中的 name 字段
 * 根据 SITE_TYPE 环境变量动态设置不同的 name
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * 网站类型到 name 的映射
 */
const SITE_NAME_MAP: Record<string, string> = {
  kyc: 'new-trust-manage-websit-kyc',
  operation: 'new-trust-manage-websit-operation',
  admin: 'new-trust-manage-websit'
}

/**
 * 更新 wrangler.jsonc 的 name 字段
 */
function updateWranglerName() {
  const siteType = process.env.SITE_TYPE || 'admin'
  const newName = SITE_NAME_MAP[siteType] || SITE_NAME_MAP.admin

  const wranglerPath = join(process.cwd(), 'wrangler.jsonc')

  try {
    // 检查文件是否存在
    if (!existsSync(wranglerPath)) {
      process.exit(1)
    }

    // 读取文件内容
    const content = readFileSync(wranglerPath, 'utf-8')

    // 使用正则表达式替换 name 字段
    // 匹配 "name": "..." 的模式，支持 JSONC 注释和制表符
    const updatedContent = content.replace(/("name"\s*:\s*)"[^"]*"/, `$1"${newName}"`)

    // 检查是否成功替换
    if (updatedContent === content) {
    }
    console.log('newName', newName)

    // 写入文件
    writeFileSync(wranglerPath, updatedContent, 'utf-8')
  } catch (error) {
    process.exit(1)
  }
}

// 执行更新
updateWranglerName()
