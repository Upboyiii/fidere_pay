/**
 * 繁體中文翻譯聚合文件
 * 自動導入所有模組，提取 zhTW 語言並合併導出
 *
 * 添加新模組時：
 * 1. 在 modules 目錄下創建新模組文件（如 tradingOrder.ts）
 * 2. 在 modules/index.ts 中導出：export * from './tradingOrder'
 * 3. 此文件會自動包含新模組（無需手動添加）
 */

import * as modules from './modules'

/**
 * 合併所有模組的繁體中文翻譯
 * 自動從 modules 中提取所有模組的 zhTW 屬性
 */
type ModuleKeys = keyof typeof modules
type MergedDictionary = {
  [K in ModuleKeys]: (typeof modules)[K] extends { zhTW: infer Z } ? Z : never
}

/**
 * 自動合併所有模組的 zhTW 翻譯
 * 使用動態方式提取，新增模組時只需在 modules/index.ts 中導出即可
 */
const mergeModules = (): MergedDictionary => {
  const result = {} as Record<string, any>

  // 遍歷所有導出的模組
  Object.keys(modules).forEach(moduleName => {
    const module = (modules as any)[moduleName]
    // 提取 zhTW 屬性
    if (module && typeof module === 'object' && 'zhTW' in module) {
      result[moduleName] = module.zhTW
    }
  })

  return result as MergedDictionary
}

const zhTW = mergeModules()

export default zhTW
