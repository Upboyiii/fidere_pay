import { clientRequest } from '@server/http'

/**
 * 数字资产管理 API
 * 处理数字资产相关的数据接口
 */

// ==================== 总览数据类型定义 ====================

// KPI 指标通用结构
export interface KPIMetric {
  title: string
  amount: number
  currency: string
  changePercent: number
  changeValue: number
  transactionCount: number
}

// 资产分布项
export interface AssetDistributionItem {
  label: string          // 币种名称，如 "BTC"
  amount: number         // 金额
  percent: number        // 百分比
  category: string       // 分类
  color: string          // 显示颜色
}

// 资产分布
export interface AssetDistribution {
  totalAmount: number
  items: AssetDistributionItem[]
}

// 资产估值曲线数据点
export interface AumTrendPoint {
  date: string           // 日期，如 "01-09"
  value: number          // 估值
}

// 资产估值曲线
export interface AumTrend {
  range: string          // 时间范围，如 "近7天"
  unit: string           // 单位，如 "CNY"
  current: number        // 当前值
  change: number         // 变化值
  series: AumTrendPoint[]
}

// 资金流动数据点
export interface FundFlowPoint {
  date: string           // 日期，如 "01-09"
  value: number          // 金额
}

// 资金流动
export interface FundFlow {
  range: string          // 时间范围
  unit: string           // 单位
  inflow: FundFlowPoint[]      // 入金数据
  outflow: FundFlowPoint[]     // 出金数据
  totalInflow: number          // 总入金
  totalOutflow: number         // 总出金
}

// 币种-链汇总项
export interface CoinChainSummaryItem {
  coinKey: string        // 币种键，如 "BTC"
  chain: string          // 链名称，如 "Bitcoin"
  balance: number        // 余额（数字）
  valuation: number      // 估值
  change24h: number      // 24小时变化（百分比，如 2.3 表示 +2.3%）
}

// 数字资产总览响应
export interface DigitalAssetsOverviewResponse {
  totalAssetValuation: KPIMetric    // 总资产估值
  netInflow24h: KPIMetric           // 24h净流入
  todayDeposit: KPIMetric           // 今日入金
  todayWithdrawal: KPIMetric        // 今日出金
  assetDistribution: AssetDistribution   // 资产分布
  aumTrend: AumTrend                     // 资产估值曲线
  fundFlow: FundFlow                     // 资金流动
  coinChainSummary: CoinChainSummaryItem[]  // 币种-链汇总
}

// ==================== 客户资产列表类型定义 ====================

// 客户资产项
export interface CustomerAssetItem {
  email: any
  userId: number            // 客户ID
  customerName: string      // 客户名称
  customerEmail?: string   // 客户邮箱（可选）
  totalValuation: number    // 总资产估值
  assetTypes: number        // 资产种类数量
  recentTransaction: string // 最近交易时间
  change24h: number         // 24h变化（百分比）
}

// 客户资产列表响应
export interface CustomerAssetsResponse {
  total: number
  list: CustomerAssetItem[]
}

// ==================== 交易流水类型定义 ====================

// 交易流水统计
export interface TransactionFlowStats {
  totalCount: number        // 总笔数
  totalAmount: number       // 总金额
  inflowCount: number       // 入金笔数
  outflowCount: number      // 出金笔数
  failedCount: number       // 失败笔数
}

// 客户信息
export interface CustomerInfo {
  userId: number            // 客户ID
  nickName: string          // 客户昵称
  email: string             // 客户邮箱
}

// 交易流水项
export interface TransactionFlowItem {
  id: number                // 交易ID
  time: string              // 交易时间
  userId: number            // 客户ID
  sourceCustomer: CustomerInfo  // 发起方客户信息
  targetCustomer: CustomerInfo  // 接受方客户信息
  coinKey: string           // 币种
  chain: string             // 链
  amount: number            // 金额
  direction: string         // 方向：inflow/outflow/collection
  directionLabel: string    // 方向标签
  fromAddress: string       // 来源地址
  toAddress: string         // 目标地址
  fromLabel: string         // 来源标签
  toLabel: string           // 目标标签
  fee: number               // 手续费
  confirmations: number     // 确认数
  status: string            // 状态：completed/failed/pending
  statusLabel: string       // 状态标签
  txHash: string            // 交易哈希
  operatorId: number        // 操作员ID
  operatorName: string      // 操作员名称
  operatorIp: string        // 操作员IP
  operatorType: number      // 发起方类型：1=客户发起，2=后台发起
  createdAt: number         // 创建时间戳
}

// 交易流水响应
export interface TransactionFlowResponse {
  total: number
  stats: TransactionFlowStats
  list: TransactionFlowItem[]
}

// ==================== API 方法 ====================

/**
 * 获取数字资产总览数据
 * GET /operation/coin/coin/overview
 */
export const getCoinOverview = () =>
  clientRequest.get<DigitalAssetsOverviewResponse>('/operation/coin/coin/overview')

/**
 * 获取客户资产列表
 * GET /operation/coin/coin/customer-assets
 */
export const getCustomerAssets = (params?: {
  pageNum?: number      // 页码
  pageSize?: number     // 每页数量
  keyword?: string      // 关键词（客户ID、邮箱、姓名）
  coinKey?: string      // 币种（BTC、ETH等）
}) =>
  clientRequest.get<CustomerAssetsResponse>('/operation/coin/coin/customer-assets', { params })

/**
 * 获取交易流水列表
 * GET /operation/coin/coin/transaction-flow
 */
export const getTransactionFlow = (params?: {
  pageNum?: number          // 页码
  pageSize?: number         // 每页数量
  userId?: number           // 客户ID
  coinKey?: string          // 币种
  chain?: string            // 链
  direction?: string        // 方向：inflow入金，outflow出金，collection归集
  status?: string           // 状态：completed完成，failed失败，pending待处理
  startTime?: string        // 开始时间
  endTime?: string          // 结束时间
  minAmount?: string        // 最小金额
  maxAmount?: string        // 最大金额
  addressLabel?: string     // 地址标签
  source?: string           // 来源：customer客户，backend后台，system系统
  keyword?: string          // 关键词（交易哈希、地址）
}) =>
  clientRequest.get<TransactionFlowResponse>('/operation/coin/coin/transaction-flow', { params })

/**
 * 获取客户交易流水（根据用户ID）
 * GET /admin-api/operation/coin/coin/customer-transaction-flow
 */
export const getCustomerTransactionFlow = (params: {
  userId: number            // 客户ID（必填）
  pageNum?: number          // 页码
  pageSize?: number         // 每页数量
  coinKey?: string          // 币种
  chain?: string            // 链
  direction?: string        // 方向：inflow入金，outflow出金，collection归集
  status?: string           // 状态：completed完成，failed失败，pending待处理
  startTime?: string        // 开始时间
  endTime?: string          // 结束时间
  minAmount?: string        // 最小金额
  maxAmount?: string        // 最大金额
  keyword?: string          // 关键词（交易哈希、地址）
  includeInternal?: boolean // 包含内部/归集交易
}) => {
  // 过滤掉空值，只传有值的参数
  const cleanParams: any = {
    userId: params.userId,
  }
  
  if (params.pageNum !== undefined && params.pageNum !== null) {
    cleanParams.pageNum = params.pageNum
  }
  if (params.pageSize !== undefined && params.pageSize !== null) {
    cleanParams.pageSize = params.pageSize
  }
  if (params.coinKey !== undefined && params.coinKey !== null && params.coinKey !== '') {
    cleanParams.coinKey = params.coinKey
  }
  if (params.chain !== undefined && params.chain !== null && params.chain !== '') {
    cleanParams.chain = params.chain
  }
  if (params.direction !== undefined && params.direction !== null && params.direction !== '') {
    cleanParams.direction = params.direction
  }
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    cleanParams.status = params.status
  }
  if (params.startTime !== undefined && params.startTime !== null && params.startTime !== '') {
    cleanParams.startTime = params.startTime
  }
  if (params.endTime !== undefined && params.endTime !== null && params.endTime !== '') {
    cleanParams.endTime = params.endTime
  }
  if (params.minAmount !== undefined && params.minAmount !== null && params.minAmount !== '') {
    cleanParams.minAmount = params.minAmount
  }
  if (params.maxAmount !== undefined && params.maxAmount !== null && params.maxAmount !== '') {
    cleanParams.maxAmount = params.maxAmount
  }
  if (params.keyword !== undefined && params.keyword !== null && params.keyword !== '') {
    cleanParams.keyword = params.keyword
  }
  if (params.includeInternal === true) {
    cleanParams.includeInternal = true
  }
  

  return clientRequest.get<TransactionFlowResponse>('/operation/coin/coin/customer-transaction-flow', { params: cleanParams })
}

// ==================== 手动操作 ====================

/**
 * 手动入金请求参数
 */
export interface ManualDepositRequest {
  userId: number            // 客户ID
  coinKey: string           // 币种Key
  amount: string            // 入金数量
  referenceNo?: string      // 参考号
  remark: string            // 备注说明（必填，用于审计追踪）
  voucherUrl?: string       // 凭证URL（可选）
}

/**
 * 手动入金操作
 * POST /operation/coin/coin/manual-deposit
 */
export const manualDeposit = (data: ManualDepositRequest) =>
  clientRequest.post('/operation/coin/coin/manual-deposit', data)

/**
 * 手动出金请求参数
 */
export interface ManualWithdrawRequest {
  userId: number            // 客户ID
  coinKey: string           // 币种Key
  amount: string            // 出金数量
  referenceNo?: string      // 参考号
  remark: string            // 备注说明（必填，用于审计追踪）
  voucherUrl?: string       // 凭证URL（可选）
}

/**
 * 手动出金操作
 * POST /operation/coin/coin/manual-withdraw
 */
export const manualWithdraw = (data: ManualWithdrawRequest) =>
  clientRequest.post('/operation/coin/coin/manual-withdraw', data)

// ==================== 文件上传 ====================

/**
 * 图片上传响应
 */
export interface UploadImageResponse {
  size: number              // 文件大小（字节）
  path: string              // 相对路径
  fullPath: string          // 完整路径/URL
  name: string              // 文件名
  type: string              // 文件类型
}

/**
 * 上传单个文件
 */
export const uploadSingleFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  


  return clientRequest.post<UploadImageResponse>('/system/upload/singleFile', formData)
}

// ==================== 成员搜索 ====================

/**
 * 成员搜索项
 */
export interface MemberSearchItem {
  id: number                 // 用户ID
  name: string               // 客户名称
  email: string              // 邮箱
}

/**
 * 成员搜索响应
 */
export interface MemberSearchResponse {
  list: MemberSearchItem[]   // 成员列表
}

/**
 * 成员搜索
 * GET /operation/fiat/fiat/member-search
 */
export const memberSearch = (params: {
  email: string              // 邮箱（支持模糊查询）
  limit?: number             // 返回数量限制（默认10，最大50）
}) => 
  clientRequest.get<MemberSearchResponse>('/operation/fiat/fiat/member-search', { 
    params: {
      email: params.email,
      limit: params.limit || 10
    }
  })

// ==================== 用户币种列表 ====================

/**
 * 用户币种项
 */
export interface UserCoinItem {
  coinKey: string            // 币种Key，如 "BTC"
  coinName?: string          // 币种名称，如 "比特币"
  balance?: number           // 余额（可选）
}

/**
 * 用户币种列表响应
 */
export interface UserCoinsResponse {
  list: UserCoinItem[]       // 币种列表
}

/**
 * 获取用户的数字资产币种列表
 * GET /operation/coin/coin/user-coins
 */
export const getUserCoins = (params: {
  userId: number             // 客户ID
}) =>
  clientRequest.get<UserCoinsResponse>('/operation/coin/coin/user-coins', { 
    params: {
      userId: params.userId
    }
  })

// ==================== 默认币种和链列表 ====================

/**
 * 默认创建的币种项
 */
export interface DefaultCreateCoinItem {
  id: number                 // 币种ID
  coinKey: string           // 币种Key，如 "BTC"
  coinFullName: string      // 币种全名
  coinName: string          // 币种名称
  coinDecimal: number        // 小数位数
  logoUrl: string           // Logo URL
  symbol: string            // 符号
  blockChain: string        // 区块链
  network: string           // 网络
  blockchainType: string    // 区块链类型
}

/**
 * 默认创建的币种列表响应
 */
export interface DefaultCreateCoinsResponse {
  list: DefaultCreateCoinItem[]
}

/**
 * 获取默认创建的币种列表
 * GET /admin-api/operation/coin/coin/default-create-coins
 */
export const getDefaultCreateCoins = () =>
  clientRequest.get<DefaultCreateCoinsResponse>('/operation/coin/coin/default-create-coins')

/**
 * 默认创建的链项（按链分组）
 */
export interface DefaultCreateChainItem {
  blockChain: string        // 区块链名称，如 "Bitcoin"
  network: string           // 网络
  blockchainType: string    // 区块链类型
  coinKeys: string[]       // 该链下的币种Key列表
  coinCount: number         // 币种数量
}

/**
 * 默认创建的链列表响应
 */
export interface DefaultCreateChainsResponse {
  list: DefaultCreateChainItem[]
}

/**
 * 获取默认创建的链列表（按链分组）
 * GET /admin-api/operation/coin/coin/default-create-chains
 */
export const getDefaultCreateChains = () =>
  clientRequest.get<DefaultCreateChainsResponse>('/operation/coin/coin/default-create-chains')

// ==================== 客户详情 ====================

/**
 * 客户资产分布项
 */
export interface CustomerAssetDistributionItem {
  label: string          // 币种名称，如 "BTC"
  amount: number         // 金额
  percent: number        // 百分比
  category: string       // 分类
  color: string          // 显示颜色
}

/**
 * 客户资产分布
 */
export interface CustomerAssetDistribution {
  totalAmount: number
  items: CustomerAssetDistributionItem[]
}

/**
 * 客户持仓项
 */
export interface CustomerHoldingItem {
  coinKey: string        // 币种Key，如 "BTC"
  chain: string          // 链名称，如 "Bitcoin"
  equityQuantity: number // 权益数量
  valuation: number      // 估值
  addressCount: number   // 地址数量
  recentTransaction: string // 最近交易时间
}

/**
 * 客户详情响应
 */
export interface CustomerDetailResponse {
  totalValuation: number              // 总资产估值
  assetTypes: number                  // 资产种类数量
  addressCount: number                // 地址数量
  change24h: number                   // 24h变化（百分比）
  assetDistribution: CustomerAssetDistribution  // 资产分布
  holdings: CustomerHoldingItem[]     // 持仓列表
}

/**
 * 获取客户详情
 * GET /admin-api/operation/coin/coin/customer-detail
 * @param userId 客户ID
 */
export const getCustomerDetail = (params: {
  userId: number
}) =>
  clientRequest.get<CustomerDetailResponse>('/operation/coin/coin/customer-detail', {
    params: {
      userId: params.userId
    }
  })

// ==================== 地址列表 ====================

/**
 * 地址列表项
 */
export interface AddressListItem {
  address: string           // 地址
  tag: string              // 标签
  tagType: string          // 标签类型
  coinKey: string          // 币种Key
  chain: string            // 链名称
  balance: number          // 余额
  deposit7Days: number     // 近7日入金
  withdrawal7Days: number  // 近7日出金
  recentTransaction: string // 最近交易时间
  riskWarning: string      // 风险提示
}

/**
 * 地址列表响应
 */
export interface AddressListResponse {
  total: number
  list: AddressListItem[]
}

/**
 * 获取地址列表
 * GET /admin-api/operation/coin/coin/address-list
 * @param userId 客户ID（必填）
 * @param pageNum 页码
 * @param pageSize 每页数量
 * @param coinKey 币种
 * @param chain 链
 * @param keyword 关键词（地址）
 */
export const getAddressList = (params: {
  userId: number
  pageNum?: number
  pageSize?: number
  coinKey?: string
  chain?: string
  keyword?: string
}) => {
  const requestParams: any = {
    userId: params.userId
  }
  
  if (params.pageNum !== undefined && params.pageNum !== null) {
    requestParams.pageNum = params.pageNum
  }
  if (params.pageSize !== undefined && params.pageSize !== null) {
    requestParams.pageSize = params.pageSize
  }
  if (params.coinKey !== undefined && params.coinKey !== null && params.coinKey !== '') {
    requestParams.coinKey = params.coinKey
  }
  if (params.chain !== undefined && params.chain !== null && params.chain !== '') {
    requestParams.chain = params.chain
  }
  if (params.keyword !== undefined && params.keyword !== null && params.keyword.trim() !== '') {
    requestParams.keyword = params.keyword.trim()
  }
  
  return clientRequest.get<AddressListResponse>('/operation/coin/coin/address-list', {
    params: requestParams
  })
}

// ==================== 出金审核列表 ====================

/**
 * 出金审核列表项
 */
export interface CoinWithdrawalListItem {
  id: number                // 交易ID
  time: string              // 交易时间
  userId: number            // 客户ID
  sourceCustomer: CustomerInfo  // 发起方客户信息
  targetCustomer: CustomerInfo  // 接受方客户信息
  coinKey: string           // 币种
  chain: string             // 链
  amount: number            // 金额
  direction: string         // 方向：inflow/outflow/collection
  directionLabel: string    // 方向标签
  fromAddress: string       // 来源地址
  toAddress: string         // 目标地址
  fromLabel: string         // 来源标签
  toLabel: string           // 目标标签
  fee: number               // 手续费
  confirmations: number     // 确认数
  status: string            // 状态：completed/failed/pending
  statusLabel: string       // 状态标签
  txHash: string            // 交易哈希
  createdAt: number         // 创建时间戳
  operatorId: number        // 操作员ID
  operatorName: string      // 操作员名称
  operatorIp: string        // 操作员IP
  operatorType: number      // 发起方类型：1=客户发起，2=后台发起
}

/**
 * 出金审核列表响应
 */
export interface CoinWithdrawalListResponse {
  total: number
  list: CoinWithdrawalListItem[]
}

/**
 * 获取出金审核列表
 * POST /admin-api/operation/coin/coin/coin-withdrawal-list
 */
export const getCoinWithdrawalList = (params?: {
  pageNum?: number          // 页码
  pageSize?: number         // 每页数量
  userId?: number           // 客户ID
  coinKey?: string          // 币种
  chain?: string            // 链
  direction?: string        // 方向：inflow入金，outflow出金，collection归集
  status?: string           // 状态：completed完成，failed失败，pending待处理
  operatorType?: number     // 发起类型：1用户，2管理员
  startTime?: string        // 开始时间
  endTime?: string          // 结束时间
  minAmount?: string        // 最小金额
  maxAmount?: string        // 最大金额
  addressLabel?: string     // 地址标签
  source?: string           // 来源：customer客户，backend后台，system系统
  keyword?: string          // 关键词（交易哈希、地址）
}) => {
  // 过滤掉空值，只传有值的参数
  const cleanParams: any = {}
  
  if (params?.pageNum !== undefined && params.pageNum !== null) {
    cleanParams.pageNum = params.pageNum
  }
  if (params?.pageSize !== undefined && params.pageSize !== null) {
    cleanParams.pageSize = params.pageSize
  }
  if (params?.userId !== undefined && params.userId !== null) {
    cleanParams.userId = params.userId
  }
  if (params?.coinKey !== undefined && params.coinKey !== null && params.coinKey !== '' && params.coinKey !== 'all') {
    cleanParams.coinKey = params.coinKey
  }
  if (params?.chain !== undefined && params.chain !== null && params.chain !== '' && params.chain !== 'all') {
    cleanParams.chain = params.chain
  }
  if (params?.direction !== undefined && params.direction !== null && params.direction !== '' && params.direction !== 'all') {
    cleanParams.direction = params.direction
  }
  if (params?.status !== undefined && params.status !== null && params.status !== '' && params.status !== 'all') {
    cleanParams.status = params.status
  }
  if (params?.operatorType !== undefined && params.operatorType !== null) {
    cleanParams.operatorType = params.operatorType
  }
  if (params?.startTime !== undefined && params.startTime !== null && params.startTime !== '') {
    cleanParams.startTime = params.startTime
  }
  if (params?.endTime !== undefined && params.endTime !== null && params.endTime !== '') {
    cleanParams.endTime = params.endTime
  }
  if (params?.minAmount !== undefined && params.minAmount !== null && params.minAmount !== '') {
    cleanParams.minAmount = params.minAmount
  }
  if (params?.maxAmount !== undefined && params.maxAmount !== null && params.maxAmount !== '') {
    cleanParams.maxAmount = params.maxAmount
  }
  if (params?.addressLabel !== undefined && params.addressLabel !== null && params.addressLabel !== '') {
    cleanParams.addressLabel = params.addressLabel
  }
  if (params?.source !== undefined && params.source !== null && params.source !== '' && params.source !== 'all') {
    cleanParams.source = params.source
  }
  if (params?.keyword !== undefined && params.keyword !== null && params.keyword.trim() !== '') {
    cleanParams.keyword = params.keyword.trim()
  }
  
  return clientRequest.post<CoinWithdrawalListResponse>('/operation/coin/coin/coin-withdrawal-list', cleanParams)
}

/**
 * 数字币出金审核通过
 * POST /admin-api/operation/coin/coin/coin-withdrawal-approve
 */
export const coinWithdrawalApprove = (params: {
  id: number  // 出金记录ID
}) =>
  clientRequest.post('/operation/coin/coin/coin-withdrawal-approve', params)

/**
 * 数字币出金审核拒绝
 * POST /admin-api/operation/coin/coin/coin-withdrawal-reject
 */
export const coinWithdrawalReject = (params: {
  id: number  // 出金记录ID
}) =>
  clientRequest.post('/operation/coin/coin/coin-withdrawal-reject', params)

