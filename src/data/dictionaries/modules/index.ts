/**
 * 模块导出索引文件
 * 集中管理所有翻译模块，方便统一导入
 */

export * from './common'
export * from './navigation'
export * from './auth'
export * from './dashboard'
export * from './user'
export * from './table'
export * from './form'
export * from './messages'
export * from './tradingUser'
export * from './fatAccounts'
export * from './kycWhitelists'
export * from './processingReviews'
export * from './userManagement'
export * from './kycdashboard'
export * from './auditLogs'
export * from './admin'
// 添加新模块时，只需：
// 1. 在 modules 目录下创建新模块文件（如 tradingOrder.ts，参考 tradingUser.ts 示例）
// 2. 在此文件中添加 export * from './新模块名'
// 3. zh-CN.ts 和 en.ts 会自动包含新模块，无需修改
