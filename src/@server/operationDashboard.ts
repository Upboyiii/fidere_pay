import { clientRequest } from '@server/http'

// 法币资产总览数据类型定义
export interface FiatOverviewResponse {
  aum: {
    title: string
    amount: number
    currency: string
    changePercent: number
    changeValue: number
  }
  todayNetInflow: {
    title: string
    amount: number
    currency: string
    changePercent: number
    changeValue: number
  }
  pendingClaim: {
    title: string
    amount: number
    currency: string
    changePercent: number
    changeValue: number
  }
  pendingApproval: {
    title: string
    amount: number
    currency: string
    changePercent: number
    changeValue: number
  }
  unmatchedIncoming: {
    title: string
    amount: number
    currency: string
    changePercent: number
    changeValue: number
  }
  discrepancies: {
    title: string
    amount: number
    currency: string
    changePercent: number
    changeValue: number
  }
  assetDistribution: {
    totalAmount: number
    items: Array<{
      label: string
      amount: number
      percent: number
      category: string
      color: string
      todayInflow?: number  // 今日入金
      todayOutflow?: number  // 今日出金
      available?: number  // 可用资产
    }>
  }
  aumTrend: {
    range: string
    unit: string
    current: number
    change: number
    series: Array<{
      date: string
      value: number
    }>
  }
  fundFlow: {
    range: string
    unit: string
    inflow: Array<{
      date: string
      value: number
    }>
    outflow: Array<{
      date: string
      value: number
    }>
    totalInflow: number
    totalOutflow: number
  }
  recentActivities: Array<{
    channel: string
    // id?: string // TODO: 后端补充 - 交易ID
    typeLabel: string
    type: string // 需要确认是 "in" | "out"
    customer: string
    email: string
    // accountId?: string // TODO: 后端补充 - 账户ID
    amount: number
    currency: string
    // channel?: string // TODO: 后端补充 - 渠道
    // counterparty?: string // TODO: 后端补充 - 对手方
    // reference?: string // TODO: 后端补充 - 参考号
    status: string
    statusTag: string
    timeDesc: string
    // hasAttachment?: boolean // TODO: 后端补充 - 是否有附件
  }>
  todoList: Array<{
    label: string
    count: number
    type: string
    color: string
  }>
  channelStats: Array<{
    channel: string       // "wire" | "fps" | "swift" | "other"
    label: string         // "电汇" | "FPS" | "SWIFT" | "其他"
    totalCount: number    // 总计交易数
    todayCount: number    // 今日交易数
  }>
}

// 客户资产列表类型定义
  // lastActivityTime: string
  // changePercent: number
  // currencyDetails: never[]
  // totalAssetUSD: number
export interface CustomerAssetItem {
  userId: number
  customerName: string
  customerEmail: string
  currency: string
  balance: number
  frozenBalance: number
  inTransit: number
  totalDeposit: number
  totalWithdrawal: number
  lastReconciliation: string
  deposit7Days: number
  withdrawal7Days: number
}

export interface CustomerAssetsResponse {
  total: number
  list: CustomerAssetItem[]
}

// 获取法币资产总览数据
export const getFiatOverview = () => 
  clientRequest.get<FiatOverviewResponse>('/operation/fiat/fiat/overview')

// 获取客户资产列表
export const getCustomerAssets = (params?: {
  pageNum?: number      // 页码
  pageSize?: number     // 每页数量
  keyword?: string      // 关键词（客户ID、邮箱、姓名）
  currency?: string     // 币种（USD、HKD）
}) => 
  clientRequest.get<CustomerAssetsResponse>('/operation/fiat/fiat/customer-assets', { params })

// 资金流水查询类型定义
export interface TransactionFlowItem {
  id: number
  userId: number
  customerName: string
  type: number              // 类型：1现金入金，2现金出金
  typeLabel: string
  amount: number
  amountType: number        // 资金类型：1美金，2港币
  currency: string
  status: number            // 状态：0待处理，2处理中，1处理完成，-3处理失败，-1客户取消
  statusLabel: string
  matchStatus: number
  matchStatusLabel: string
  referenceNo: string
  remark: string
  recordType: number
  createdAt: number         // 时间戳
  updatedAt: number         // 时间戳
}

export interface TransactionFlowResponse {
  total: number
  list: TransactionFlowItem[]
}

// 获取资金流水查询
export const getTransactionFlow = (params?: {
  pageNum?: number          // 页码
  pageSize?: number         // 每页数量
  userId?: number           // 客户ID
  type?: number             // 类型：1现金入金，2现金出金
  amountType?: number       // 资金类型：1美金，2港币
  status?: number           // 状态：0待处理，2处理中，1处理完成，-3处理失败，-1客户取消
  startTime?: string        // 开始时间
  endTime?: string          // 结束时间
  keyword?: string          // 关键词（参考号、备注）
}) => 
  clientRequest.get<TransactionFlowResponse>('/operation/fiat/fiat/transaction-flow', { params })

// 客户最近交易记录类型定义
export interface CustomerRecentTransaction {
  id: number
  time: string
  currency: string
  amount: number
  direction: string           // in/out
  directionLabel: string
  channel: string
  status: string
  statusLabel: string
}

export interface CustomerRecentTransactionsResponse {
  list: CustomerRecentTransaction[]
}

// 获取客户最近3笔交易
export const getCustomerRecentTransactions = (userId: number) => 
  clientRequest.get<CustomerRecentTransactionsResponse>('/operation/fiat/fiat/customer-recent-transactions', { 
    params: { userId } 
  })

// 入账认领列表类型定义
export interface DepositClaimItem {
  id: number
  arrivalTime: string          // 到账时间
  amount: number
  amountType: number           // 资金类型：1美金，2港币
  currency: string
  payer: string                // 付款人（保留兼容）
  accountHolderName?: string   // 账户持有人姓名（付款人）
  channel: string
  referenceNo: string          // 参考号
  matchStatus: number          // 匹配状态：0未匹配，1已匹配
  matchStatusLabel: string
  status: number               // 状态：0待处理，2处理中，1处理完成，-3处理失败
  statusLabel: string
  userId: number
  customerName: string
  createdAt: number            // 时间戳
}

export interface DepositClaimListResponse {
  total: number
  list: DepositClaimItem[]
}

// 获取入账认领列表
export const getDepositClaimList = (params?: {
  pageNum?: number             // 页码
  pageSize?: number            // 每页数量
  status?: number              // 状态：0待处理，2处理中，1处理完成，-3处理失败
  matchStatus?: number         // 匹配状态：0未匹配，1已匹配
  startTime?: string           // 开始时间
  endTime?: string             // 结束时间
  keyword?: string             // 关键词（参考号、付款人、备注）
}) => 
  clientRequest.get<DepositClaimListResponse>('/operation/fiat/fiat/deposit-claim-list', { params })

// 入账认领操作请求参数
export interface DepositClaimRequest {
  id: number                   // 交易记录ID
  userId?: number              // 客户ID（匹配时必填，认领时必填）
  action: 'approve' | 'reject' | 'match'  // 操作：approve批准认领，reject拒绝，match匹配客户
  remark: string               // 认领备注
  voucherUrl?: string          // 凭证URL（可选）
}

// 入账认领操作
export const depositClaim = (data: DepositClaimRequest) => 
  clientRequest.post('/operation/fiat/fiat/deposit-claim', data)

// 批量入账认领请求参数
export interface BatchDepositClaimRequest {
  ids: number[]                // 交易记录ID列表
  userId: number               // 客户ID
  remark: string               // 认领备注
}

// 批量入账认领操作
export const batchDepositClaim = (data: BatchDepositClaimRequest) => 
  clientRequest.post('/operation/fiat/fiat/batch-deposit-claim', data)

// ==================== 对账管理 ====================

// 对账统计响应
export interface ReconciliationStatsResponse {
  matchedCount: number          // 已匹配数量
  unmatchedCount: number        // 未匹配数量
  totalCount: number            // 总数量
  matchedPercent: number        // 已匹配百分比
  unmatchedPercent: number      // 未匹配百分比
}

// 获取对账统计
export const getReconciliationStats = (params: {
  startTime?: string
  endTime?: string
}) => clientRequest.get<ReconciliationStatsResponse>('/operation/fiat/fiat/reconciliation-stats', { params })

// 对账列表项
export interface ReconciliationItem {
  id: number                    // ID
  date: string                  // 日期
  currency: string              // 币种
  amount: number                // 金额
  amountType: number            // 金额类型
  referenceNo: string           // 参考号
  type: string                  // 类型
  typeLabel: string             // 类型标签
  remark: string                // 备注
  matchStatus: number           // 匹配状态：0未匹配，1已匹配
  createdAt: number             // 创建时间戳
}

// 对账列表响应
export interface ReconciliationListResponse {
  total: number                 // 总数
  list: ReconciliationItem[]    // 列表
}

// 获取对账列表
export const getReconciliationList = (params: {
  pageNum?: number
  pageSize?: number
  matchStatus?: number           // 匹配状态：0未匹配，1已匹配（不传则查询全部）
  startTime?: string
  endTime?: string
  keyword?: string               // 关键词（参考号、备注）
}) => clientRequest.get<ReconciliationListResponse>('/operation/fiat/fiat/reconciliation-list', { params })

// ==================== 出金审批 ====================

// 出金审批列表项
export interface WithdrawApprovalItem {
  id: number                    // ID
  applicationTime: string       // 申请时间
  userId: number                // 用户ID
  customerName: string          // 客户名称
  customerEmail: string         // 客户邮箱
  currency: string              // 币种
  amount: number                // 金额
  amountType: number            // 金额类型
  recipient: string             // 收款人
  purpose: string               // 用途
  status: number                // 状态：0待处理，2处理中，1处理完成，-3处理失败，-1客户取消
  statusLabel: string           // 状态标签
  hasAttachment: boolean        // 是否有附件
  createdAt: number             // 创建时间戳
  paymentBank?: string          // 打款银行（审批后才有）
  paymentChannel?: string       // 打款渠道（审批后才有，值为字典值如 "1", "2", "3", "4"）
  voucherUrl?: string           // 打款凭证URL（审批后才有）
}

// 出金审批列表响应
export interface WithdrawApprovalListResponse {
  total: number                 // 总数
  list: WithdrawApprovalItem[]  // 列表
}

// 获取出金审批列表
export const getWithdrawApprovalList = (params: {
  pageNum?: number
  pageSize?: number
  status?: number                // 状态：0待处理，2处理中，1处理完成，-3处理失败，-1客户取消（不传则查询全部）
  keyword?: string               // 关键词（客户、收款人等）
  startTime?: string
  endTime?: string
}) => clientRequest.get<WithdrawApprovalListResponse>('/operation/fiat/fiat/withdraw-approval-list', { params })

// 出金审批请求参数
export interface WithdrawApprovalRequest {
  id: number                     // 交易记录ID
  action: 'approve' | 'reject'   // 操作：approve批准，reject拒绝
  paymentChannel?: string        // 打款渠道（批准时必填）
  paymentBank?: string           // 打款银行（批准时必填）
  voucherUrl?: string            // 打款凭证URL（批准时必填）
  remark?: string                // 审批备注
}

// 出金审批操作
export const withdrawApproval = (data: WithdrawApprovalRequest) => 
  clientRequest.post('/operation/fiat/fiat/withdraw-approval', data)

// ==================== 字典数据 ====================

// 字典项类型
export interface DictItem {
  dictLabel: string    // 标签（显示文本）
  dictValue: string    // 值
}

// 获取打款渠道列表
export const getChannelList = () => 
  clientRequest.get<DictItem[]>('/operation/fiat/fiat/channel-list')

// 获取打款银行列表
export const getBankList = () => 
  clientRequest.get<DictItem[]>('/operation/fiat/fiat/bank-list')

// ==================== 成员搜索 ====================

// 成员搜索项
export interface MemberSearchItem {
  id: number                 // 用户ID
  name: string               // 客户名称
  email: string              // 邮箱
}

// 成员搜索响应
export interface MemberSearchResponse {
  list: MemberSearchItem[]   // 成员列表
}

// 成员搜索
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

// ==================== 快捷操作 ====================

// 手动入金请求参数
export interface ManualDepositRequest {
  userId: number                 // 客户ID
  amountType: 1 | 2              // 资金类型：1美金，2港币
  amount: number                 // 入金金额
  channel?: number               // 打款渠道（数字类型）
  referenceNo?: string           // 参考号
  remark: string                 // 备注说明（必填，用于审计追踪）
  voucherUrl?: string            // 凭证URL（可选）
}

// 手动入金操作
export const manualDeposit = (data: ManualDepositRequest) => 
  clientRequest.post('/operation/fiat/fiat/manual-deposit', data)

// 手动出金请求参数
export interface ManualWithdrawRequest {
  userId: number                 // 客户ID
  amountType: 1 | 2              // 资金类型：1美金，2港币
  amount: number                 // 出金金额
  bankAccountId: number          // 银行账户ID（客户的提现银行卡）
  fee: number                    // 手续费
  paymentChannel?: string         // 打款渠道
  paymentBank?: string            // 打款银行
  referenceNo?: string           // 参考号
  remark: string                 // 备注说明（必填，用于审计追踪）
  voucherUrl?: string            // 凭证URL（可选）
}

// 手动出金操作
export const manualWithdraw = (data: ManualWithdrawRequest) => 
  clientRequest.post('/operation/fiat/fiat/manual-withdraw', data)

// 银行账号白名单响应
export interface BankAccountItem {
  id: number
  accountHolderName: string
  bankName: string
  bankAccount: string
  bankAddress: string
  swiftCode: string
  transferBankName: string
  routingNo: string
  country: string
  city: string
  postalCode: string
  bankCountry: string
  stateProvince: string
  address: string
  transferSwift: string
  createdAt: string
}

export interface BankAccountListResponse {
  list: BankAccountItem[]
}

// 获取客户银行账号白名单
// API: GET /admin-api/operation/fiat/fiat/bank-account-list
// 参数: userId (客户ID)
export const getBankAccountList = (params: { userId: number }) =>
  clientRequest.get<BankAccountListResponse>('/operation/fiat/fiat/bank-account-list', { params })

// 出金手续费响应
export interface OutCashFeeResponse {
  currencyType: string
  fee: string
}

// 获取出金手续费
export const getOutCashFee = (params: { currencyType: string }) =>
  clientRequest.get<OutCashFeeResponse>('/operation/fiat/fiat/out-cash-fee', { params })

// ==================== 文件上传 ====================

// 图片上传响应
export interface UploadImageResponse {
  size: number                // 文件大小（字节）
  path: string                // 相对路径
  fullPath: string            // 完整路径/URL
  name: string                // 文件名
  type: string                // 文件类型
}

// 上传单张图片（旧接口，保留用于兼容）
export const uploadSingleImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  console.log('📤 准备上传文件:')
  console.log('  - 文件名:', file.name)
  console.log('  - 文件大小:', (file.size / 1024).toFixed(2), 'KB')
  console.log('  - 文件类型:', file.type)
  
  // 注意：不要手动设置 Content-Type，让浏览器自动设置（会包含 boundary 参数）
  return clientRequest.post<UploadImageResponse>('/system/upload/singleImg', formData)
}

// 上传单个文件（新接口）
export const uploadSingleFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  console.log('📤 准备上传文件:')
  console.log('  - 文件名:', file.name)
  console.log('  - 文件大小:', (file.size / 1024).toFixed(2), 'KB')
  console.log('  - 文件类型:', file.type)
  
  // 注意：不要手动设置 Content-Type，让浏览器自动设置（会包含 boundary 参数）
  return clientRequest.post<UploadImageResponse>('/system/upload/singleFile', formData)
}

// ==================== 概览页面 ====================

// 趋势卡片项
export interface TrendCard {
  title: string              // 标题
  assetKey: string           // 资产键
  amount: number             // 金额
  currency: string           // 币种
  changePercent: number      // 变化百分比
  dateAxis: string[]         // 日期轴
  values: number[]           // 数值数组
  desc: string               // 描述
}

// 资产饼图项
export interface AssetPieItem {
  label: string              // 标签
  amount: number             // 金额
  percent: number            // 百分比
  category: string           // 分类
  color: string              // 颜色
}

// 资产饼图
export interface AssetPie {
  totalAmount: number        // 总金额
  items: AssetPieItem[]      // 项列表
}

// AUM 趋势数据点
export interface AumTrendSeries {
  date: string               // 日期
  value: number              // 数值
}

// 7天或30天趋势数据
export interface AumTrendPeriod {
  dateAxis: string[]         // 日期轴
  values: number[]            // 数值数组
}

// AUM 趋势
export interface AumTrend {
  unit: string               // 单位
  today: number              // 今日值
  monthlyChange: number       // 月度变化
  sevenDays: AumTrendPeriod   // 7天数据
  thirtyDays: AumTrendPeriod  // 30天数据
}

// 待办事项项
export interface TodoItem {
  label: string              // 标签
  count: number              // 数量
  type: string               // 类型
  color: string              // 颜色
}

// 最近活动项
export interface RecentActivity {
  typeLabel: string          // 类型标签
  type: string               // 类型
  customer: string           // 客户
  email: string              // 邮箱
  userId?: number            // 用户ID
  amount: number             // 金额（兼容字段）
  currency: string           // 币种
  status: string             // 状态
  statusTag: string          // 状态标签
  timeDesc: string           // 时间描述
  detail?: {                 // 详情（可选）
    amount: number           // 金额（在 detail 中）
    currency?: string       // 币种（在 detail 中）
    status?: string         // 状态（在 detail 中）
    statusLabel?: string    // 状态标签（在 detail 中）
    time?: string           // 时间（在 detail 中）
  }
  color?: string             // 类型颜色
}

// 币种分布项
export interface CurrencyBar {
  currency: string           // 币种
  amount: number             // 金额
  percent: number            // 百分比
  color: string              // 颜色
}

// 概览响应
export interface DashboardOverviewResponse {
  trendCards: TrendCard[]    // 趋势卡片列表
  assetPie: AssetPie         // 资产饼图
  aumTrend: AumTrend         // AUM 趋势
  todoList: TodoItem[]       // 待办事项列表
  recentActivities: RecentActivity[]  // 最近活动列表
  currencyBars: CurrencyBar[] // 币种分布列表
}

// 获取概览数据
export const getDashboardOverview = (range: "7d" | "30d" = "7d") =>
  clientRequest.get<DashboardOverviewResponse>('/operation/dashboard/overview', {
    params: { range }
  })

// ==================== OTC交易统计 ====================

// OTC卡片数据
export interface OtcCardData {
  title: string
  amount: number
  icon: string
}

// 币种分布项
export interface CurrencyDistributionItem {
  currency: string
  amount: number
}

// OTC交易统计响应
export interface OtcOverviewResponse {
  statTime: string
  totalTransactions: OtcCardData
  successTransactions: OtcCardData
  buyTransactions: OtcCardData
  sellTransactions: OtcCardData
  currencyDistribution: CurrencyDistributionItem[]
}

// 获取OTC交易统计数据
// API: GET /admin-api/operation/otc/otc/overview
// 参数: statTime (统计时间，格式：当日/指定日期范围)
export const getOtcOverview = (params: { statTime?: string }) =>
  clientRequest.get<OtcOverviewResponse>('/operation/otc/otc/overview', { params })

// ==================== OTC交易列表 ====================

// OTC交易列表项
export interface OtcTransactionItem {
  id: number
  userId: number
  userEmail: string
  userName: string
  tradeRefId: string
  tradeType: string
  tradeTypeLabel: string
  sourceAsset: string
  sourceAmount: string
  destinationAsset: string
  destinationAmount: string
  tradeTime: string
  tradeStatus: string
  tradeStatusLabel: string
  sourceCoinType: string
  destinationCoinType: string
  sourceQuotePrice: string
  destinationQuotePrice: string
  sourceCoinKey: string
  destinationCoinKey: string
  quoteBeginTime: string
  quoteEndTime: string
  note: string
}

// OTC交易列表响应
export interface OtcTransactionListResponse {
  total: number
  list: OtcTransactionItem[]
}

// 获取OTC交易列表
// API: GET /admin-api/operation/otc/otc/transaction-list
// 参数: pageNum, pageSize, userEmail, startTime, endTime, tradeType
export const getOtcTransactionList = (params?: {
  pageNum?: number
  pageSize?: number
  userEmail?: string
  startTime?: string  // 格式：YYYY-MM-DD
  endTime?: string     // 格式：YYYY-MM-DD
  tradeType?: string   // buy/sell
}) =>
  clientRequest.get<OtcTransactionListResponse>('/operation/otc/otc/transaction-list', { params })

// ==================== OTC交易详情 ====================

// OTC交易详情响应
export interface OtcTransactionDetailResponse {
  id: number
  userId: number
  userEmail: string
  userName: string
  tradeRefId: string
  tradeType: string
  tradeTypeLabel: string
  sourceCoinType: string
  destinationCoinType: string
  sourceQuotePrice: string
  destinationQuotePrice: string
  sourceCoinKey: string
  destinationCoinKey: string
  sourceTxAmount: string
  destinationTxAmount: string
  quoteBeginTime: string
  quoteEndTime: string
  tradeTime: string
  tradeStatus: string
  tradeStatusLabel: string
  note: string
}

// 获取OTC交易详情
// API: GET /admin-api/operation/otc/otc/transaction-detail
// 参数: id (交易ID)
export const getOtcTransactionDetail = (params: { id: number }) =>
  clientRequest.get<OtcTransactionDetailResponse>('/operation/otc/otc/transaction-detail', { params })

// ==================== 法币手续费管理 ====================

// 法币手续费列表项类型
export interface FiatFeeManageItem {
  id: number
  currencyType: string
  currencyName: string
  currencyFullName: string
  fee: string
  isWithdrawFee: number // 0 或 1
}

// 法币手续费列表响应类型
export interface FiatFeeManageListResponse {
  total: number
  pageSize: number
  currentPage: number
  list: FiatFeeManageItem[]
}

// 法币手续费列表请求参数
export interface FiatFeeManageListParams {
  pageSize?: number
  currentPage?: number
  coinName?: string // 币种名称（currencyType）
}

// 法币手续费修改请求参数
export interface FiatFeeManageEditRequest {
  id: number
  fee: string
  is_withdraw_fee: number // 0 或 1
}

/**
 * GET /admin-api/operation/fee-manage/fiat/list
 * 获取法币手续费列表
 */
export const getFiatFeeManageList = (params?: FiatFeeManageListParams) =>
  clientRequest.get<FiatFeeManageListResponse>('/operation/fee-manage/fiat/list', { params })

/**
 * POST /admin-api/operation/fee-manage/fiat/edit
 * 修改法币手续费
 */
export const editFiatFeeManage = (data: FiatFeeManageEditRequest) =>
  clientRequest.post('/operation/fee-manage/fiat/edit', data)

// ==================== 数字币手续费管理 ====================

// 数字币手续费列表项类型
export interface CoinFeeManageItem {
  id: number
  coinKey: string
  coinFullName: string
  coinName: string
  logoUrl?: string
  symbol: string
  fee: string
  feeCoinKey: string
  feeUnit: string
  feeDecimal: number
  blockChain: string
  network: string
  blockchainType: string
}

// 数字币手续费列表响应类型
export interface CoinFeeManageListResponse {
  total: number
  pageSize: number
  currentPage: number
  list: CoinFeeManageItem[]
}

// 数字币手续费列表请求参数
export interface CoinFeeManageListParams {
  pageSize?: number
  currentPage?: number
  coinName?: string // 币种名称（coinName）
}

// 数字币手续费修改请求参数
export interface CoinFeeManageEditRequest {
  id: number
  fee?: string
  feecoinkey?: string
  feeunit?: string
  feedecimal?: number
}

/**
 * GET /admin-api/operation/fee-manage/coin/list
 * 获取数字币手续费列表
 */
export const getCoinFeeManageList = (params?: CoinFeeManageListParams) =>
  clientRequest.get<CoinFeeManageListResponse>('/operation/fee-manage/coin/list', { params })

/**
 * POST /admin-api/operation/fee-manage/coin/edit
 * 修改数字币手续费
 */
export const editCoinFeeManage = (data: CoinFeeManageEditRequest) =>
  clientRequest.post('/operation/fee-manage/coin/edit', data)
