/**
 * 网站配置工具
 * 用于在客户端和服务端获取网站类型等配置信息
 */
import { ENV_CONFIG } from '@server/config'
/**
 * 网站类型枚举
 * - kyc: KYC 审核系统
 * - operation: 运营管理系统
 * - admin: 管理员系统
 */
import themeConfig, { operationThemeConfig } from '@configs/themeConfig'
export type SiteType = 'kyc' | 'operation' | 'admin'

/**
 * 获取当前网站类型
 * 优先使用 NEXT_PUBLIC_SITE_TYPE（客户端可用），否则使用 SITE_TYPE（服务端）
 * @returns 网站类型，默认为 'admin'
 */
export function getSiteType(): SiteType {
  // 客户端使用 NEXT_PUBLIC_ 前缀的环境变量
  const siteType = process.env.NEXT_PUBLIC_SITE_TYPE || process.env.SITE_TYPE || 'admin'

  // 类型检查，确保返回值符合 SiteType
  if (siteType === 'kyc' || siteType === 'operation' || siteType === 'admin') {
    return siteType
  }

  return 'admin'
}

/**
 * 检查是否为指定的网站类型
 * @param type 要检查的网站类型
 * @returns 是否为指定类型
 */
export function isSiteType(type: SiteType): boolean {
  return getSiteType() === type
}

/**
 * 根据网站类型执行不同的逻辑
 * @param handlers 不同网站类型的处理函数映射
 * @returns 对应网站类型的处理结果
 */
export function switchBySiteType<T>(handlers: Partial<Record<SiteType, () => T>>): T | undefined {
  const siteType = getSiteType()
  const handler = handlers[siteType]

  return handler ? handler() : undefined
}

/**
 * 网站配置常量
 */
export const SITE_CONFIG = {
  /**
   * 当前网站类型
   */
  SITE_TYPE: getSiteType(),

  /**
   * 是否为 KYC 系统
   */
  IS_KYC: isSiteType('kyc'),

  /**
   * 是否为运营管理系统
   */
  IS_OPERATION: isSiteType('operation'),

  /**
   * 是否为管理员系统
   */
  IS_ADMIN: isSiteType('admin')
}
export const GET_THEME_CONFIG = () => {
  if (SITE_CONFIG.IS_OPERATION) return operationThemeConfig
  if (SITE_CONFIG?.IS_KYC) return themeConfig
  return { ...themeConfig, loginName: '' }
}
export const GET_ENTRANCE = () => {
  if (ENV_CONFIG?.IS_DEVELOPMENT) return 'MANAGEMENT'
  return SITE_CONFIG.IS_KYC ? 'KYC' : SITE_CONFIG.IS_OPERATION ? 'OPERATION' : 'MANAGEMENT'
}
