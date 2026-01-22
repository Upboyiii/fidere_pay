/**
 * 英文翻译聚合文件
 * 自动导入所有模块，提取 en 语言并合并导出
 *
 * 添加新模块时：
 * 1. 在 modules 目录下创建新模块文件（如 tradingOrder.ts）
 * 2. 在 modules/index.ts 中导出：export * from './tradingOrder'
 * 3. 此文件会自动包含新模块（无需手动添加）
 */

import * as modules from './modules'

/**
 * 合并所有模块的英文翻译
 * 自动从 modules 中提取所有模块的 en 属性
 */
type ModuleKeys = keyof typeof modules
type MergedDictionary = {
  [K in ModuleKeys]: (typeof modules)[K] extends { en: infer E } ? E : never
}

/**
 * 自动合并所有模块的 en 翻译
 * 使用动态方式提取，新增模块时只需在 modules/index.ts 中导出即可
 */
const mergeModules = (): MergedDictionary => {
  const result = {} as Record<string, any>

  // 遍历所有导出的模块
  Object.keys(modules).forEach(moduleName => {
    const module = (modules as any)[moduleName]
    // 提取 en 属性
    if (module && typeof module === 'object' && 'en' in module) {
      result[moduleName] = module.en
    }
  })

  return result as MergedDictionary
}

const en = mergeModules()

export default en
