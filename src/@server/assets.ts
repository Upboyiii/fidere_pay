import { clientRequest } from '@server/http'

/**
 * 资产中心概览 API
 * 处理资产中心相关的数据接口
 */

// ==================== 资产中心概览数据类型定义 ====================

// 汇总数据
export interface AssetSummary {
  currency: string              // 币种
  totalAsset: number            // 总资产
  totalChangePct: number        // 总资产变化百分比
  fiatAsset: number             // 法币资产
  fiatChangePct: number         // 法币资产变化百分比
  digitalAsset: number          // 数字资产
  digitalChangePct: number      // 数字资产变化百分比
  customerCount: number         // 客户总数
  customerChangePct: number     // 客户总数变化百分比
}

// 资产类型饼图项
export interface AssetTypePieItem {
  label: string                 // 标签，如 "法币资产"、"数字资产"
  amount: number                // 金额
  percent: number               // 百分比
  category: string               // 分类
  color: string                 // 颜色
}

// 资产类型饼图
export interface AssetTypePie {
  totalAmount: number           // 总金额
  items: AssetTypePieItem[]      // 项列表
}

// 币种分布项
export interface CoinBar {
  currency: string               // 币种，如 "USD"、"HKD"、"CNY"、"BTC"、"ETH"
  amount: number                 // 金额
  percent: number                // 百分比
}

// AUM 趋势数据
export interface AumTrendPeriod {
  dateAxis: string[]             // 日期轴数组
  values: number[]                // 数值数组
}

// AUM 趋势
export interface AumTrend {
  unit: string                   // 单位
  sevenDays: AumTrendPeriod      // 7天数据
  thirtyDays: AumTrendPeriod     // 30天数据
}

// Top 客户项
export interface TopCustomer {
  userId: number                 // 用户ID
  name: string                   // 客户名称
  email: string                 // 客户邮箱
  totalAsset: number            // 总资产
  fiatAsset: number             // 法币资产
  digitalAsset: number          // 数字资产
  changePercent: number         // 变化百分比（24h变化）
}

// 资产中心概览响应
export interface AssetOverviewResponse {
  summary: AssetSummary         // 汇总数据
  assetTypePie: AssetTypePie    // 资产类型饼图
  coinBars: CoinBar[]           // 币种分布
  aumTrend: AumTrend            // AUM 趋势
  topCustomers: TopCustomer[]   // Top 客户列表
  updatedAt: string             // 最后更新时间
}

/**
 * 获取资产中心概览数据
 * GET /operation/asset/overview
 * @param statDate 统计日期，格式 YYYY-MM-DD，默认当天
 */
export const getAssetOverview = (statDate?: string) =>
  clientRequest.get<AssetOverviewResponse>('/operation/asset/overview', {
    params: statDate ? { statDate } : undefined
  })

// ==================== 客户资产详情数据类型定义 ====================

// 客户资产概览汇总
export interface CustomerAssetSummary {
  currency: string              // 币种
  totalAsset: number            // 总资产
  totalChangePct: number        // 总资产变化百分比
  fiatAsset: number             // 法币资产
  fiatChangePct: number         // 法币资产变化百分比
  digitalAsset: number          // 数字资产
  digitalChangePct: number      // 数字资产变化百分比
}

// 客户资产饼图项
export interface CustomerAssetPieItem {
  label: string                 // 标签
  amount: number                // 金额
  percent: number               // 百分比
  category: string               // 分类
  color: string                 // 颜色
}

// 客户资产饼图
export interface CustomerAssetPie {
  totalAmount: number           // 总金额
  items: CustomerAssetPieItem[]  // 项列表
}

// 客户法币分布项
export interface CustomerFiatBar {
  currency: string               // 币种
  amount: number                 // 金额
  percent: number                // 百分比
}

// 客户数字资产分布项
export interface CustomerDigitalBar {
  currency: string               // 币种
  amount: number                 // 金额
  percent: number                // 百分比
}

// 客户资产趋势数据
export interface CustomerTrend7d {
  dateAxis: string[]             // 日期轴数组
  totalValues: number[]          // 总资产数值数组
  fiatValues: number[]           // 法币资产数值数组
  digitalValues: number[]        // 数字资产数值数组
}

// 客户资产概览响应
export interface CustomerAssetOverviewResponse {
  summary: CustomerAssetSummary  // 汇总数据
  assetPie: CustomerAssetPie     // 资产饼图
  fiatBars: CustomerFiatBar[]     // 法币分布
  digitalBars: CustomerDigitalBar[] // 数字资产分布
  trend7d: CustomerTrend7d       // 7天趋势
}

// 客户法币资产项
export interface CustomerFiatAssetItem {
  currency: string               // 币种
  available: number              // 可用余额
  cardAmount: number             // 卡片金额
  frozen: number                  // 冻结金额
  pending: number                // 在途金额
  valueUsd: number               // USD估值
  original: number                // 原始金额
}

// 客户法币资产响应
export interface CustomerFiatAssetsResponse {
  list: CustomerFiatAssetItem[]  // 列表
  totalUsd: number               // 总USD估值
}

// 客户数字资产项
export interface CustomerDigitalAssetItem {
  coinKey: string                 // 币种Key
  symbol: string                 // 币种符号
  balance: number                // 余额
  valueUsd: number               // USD估值
  changePercent: number           // 24h变化百分比
}

// 客户数字资产响应
export interface CustomerDigitalAssetsResponse {
  list: CustomerDigitalAssetItem[] // 列表
  totalUsd: number                // 总USD估值
}

// 客户交易记录项
export interface CustomerTradeItem {
  eventId: number                 // 事件ID
  eventType: string               // 事件类型
  typeLabel: string               // 类型标签
  time: string                    // 时间
  amount: number                  // 金额
  currency: string                // 币种
  status: string                  // 状态
  statusLabel: string             // 状态标签
  source: string                  // 来源
  reference: string               // 参考号
}

// 客户交易记录响应
export interface CustomerTradeResponse {
  list: CustomerTradeItem[]        // 列表
  currentPage: number             // 当前页
  total: number                    // 总数
}

/**
 * 获取客户资产概览数据
 * GET /operation/asset/customer/overview
 * @param userId 用户ID
 * @param statDate 统计日期，格式 YYYY-MM-DD，默认当天
 */
export const getCustomerAssetOverview = (userId: number, statDate?: string) =>
  clientRequest.get<CustomerAssetOverviewResponse>('/operation/asset/customer/overview', {
    params: { userId, ...(statDate ? { statDate } : {}) }
  })

/**
 * 获取客户法币资产
 * GET /operation/asset/customer/fiat
 * @param userId 用户ID
 */
export const getCustomerFiatAssets = (userId: number) =>
  clientRequest.get<CustomerFiatAssetsResponse>('/operation/asset/customer/fiat', {
    params: { userId }
  })

/**
 * 获取客户数字资产
 * GET /operation/asset/customer/digital
 * @param userId 用户ID
 * @param statDate 统计日期，格式 YYYY-MM-DD，默认当天
 */
export const getCustomerDigitalAssets = (userId: number, statDate?: string) =>
  clientRequest.get<CustomerDigitalAssetsResponse>('/operation/asset/customer/digital', {
    params: { userId, ...(statDate ? { statDate } : {}) }
  })

/**
 * 获取客户交易记录
 * post /operation/asset/customer/trade
 * @param userId 用户ID
 * @param params 查询参数
 */
export const getCustomerTrades = (params?: {
  userId: number,
  statDate?: string               // 统计日期
  type?: string                   // 类型筛选
  status?: string                  // 状态筛选
  coinKey?: string                // 币种筛选
  dateRange?: string[]            // 日期范围
  pageNum?: number                // 页码
  pageSize?: number               // 每页数量
  orderBy?: string                // 排序
}) =>
  clientRequest.post<CustomerTradeResponse>('/operation/asset/customer/activity', params)

// ==================== 客户列表数据类型定义 ====================

// 客户列表项
export interface CustomerListItem {
  userId: number                 // 用户ID
  name: string                   // 客户名称
  email: string                  // 客户邮箱
  totalAsset: number            // 总资产
  fiatAsset: number             // 法币资产
  digitalAsset: number          // 数字资产
  changePercent: number         // 变化百分比（24h变化）
  fiatDetails?: CustomerFiatAssetItem[]  // 法币资产明细
  digitalDetails?: CustomerDigitalAssetItem[]  // 数字资产明细
  cardDetails?: CustomerFiatAssetItem[]  // 卡片详情
}

// 客户列表响应
export interface CustomerListResponse {
  list: CustomerListItem[]        // 列表
  currentPage: number             // 当前页
  total: number                   // 总数
}

/**
 * 获取客户列表
 * POST /operation/asset/customer/list
 * @param params 查询参数
 */
export const getCustomerList = (params?: {
  statDate?: string               // 统计日期，格式 YYYY-MM-DD，默认当天
  keyword?: string                // 搜索关键词，支持姓名、邮箱、ID
  dateRange?: string[]            // 日期范围
  pageNum?: number                // 页码
  pageSize?: number               // 每页数量
  orderBy?: string                // 排序
}) =>
  clientRequest.post<CustomerListResponse>('/operation/asset/customer/list', params)

// ==================== 客户理财产品数据类型定义 ====================

// 理财产品项
export interface CustomerInvestItem {
  orderId: number                 // 订单ID
  productId: number               // 产品ID
  productCode: string             // 产品代码
  productName: string              // 产品名称
  productType: string              // 产品类型
  investAmount: number             // 投资金额
  marketValue: number              // 市值
  yield: number                    // 收益
  apr: number                      // 年化收益率
  buyDate: string                  // 购买日期
  expireDate: string               // 到期日期
  status: string                   // 状态
}

// 理财产品响应
export interface CustomerInvestResponse {
  count: number                    // 持有数量
  totalInvest: number              // 总投资额
  totalValue: number               // 总市值
  list: CustomerInvestItem[]       // 列表
  currentPage: number              // 当前页
  total: number                    // 总数
}

/**
 * 获取客户理财产品
 * GET /operation/asset/customer/invest
 * @param userId 用户ID
 * @param params 查询参数
 */
export const getCustomerInvest = (userId: number, params?: {
  name?: string                    // 产品名搜索
  type?: string                    // 产品类型筛选
  status?: string                  // 状态筛选
  dateRange?: string[]            // 日期范围
  pageNum?: number                // 页码
  pageSize?: number               // 每页数量
  orderBy?: string                // 排序
}) =>
  clientRequest.get<CustomerInvestResponse>('/operation/asset/customer/invest', {
    params: { userId, ...params }
  })

