/**
 * OTC资产管理相关API接口
 * 包含管理员和普通用户的接口
 */

import { clientRequest } from '@server/http'

// ==================== 管理员接口 ====================

// 1. 查看用户资产列表
export interface AdminAssetListParams {
  userId?: number
  userName?: string // 用户名(模糊搜索)
  userNickname?: string // 用户昵称(模糊搜索)
  pageNum?: number
  pageSize?: number
}

export interface AdminAssetListItem {
  userId: number
  userName?: string
  userNickname?: string
  currencyCode: string
  balance: number
  frozenBalance: number
  availableBalance: number
  [key: string]: any
}

export interface AdminAssetListResponse {
  total: number
  list: AdminAssetListItem[]
}

export const getAdminAssetList = (params?: AdminAssetListParams) =>
  clientRequest.get<AdminAssetListResponse>('/api/v1/biz/asset/list', { params })

// 2. 调整用户资产
export interface AdjustAssetRequest {
  userId: number // 用户ID
  currencyCode: string // 币种编码
  adjustType: 1 | 2 // 调整类型 1-增加 2-扣减
  amount: number // 调整金额
  remark?: string // 调整原因/备注
}

export const adjustAsset = (data: AdjustAssetRequest) =>
  clientRequest.post('/api/v1/biz/asset/adjust', data)

// 3. 资产调整记录列表
export interface AssetAdjustLogListParams {
  pageNum?: number
  pageSize?: number
  userId?: number // 用户ID
  userName?: string // 用户名(模糊搜索)
  userNickname?: string // 用户昵称(模糊搜索)
  adjustType?: number // 调整类型 0-全部 1-增加 2-扣减
  startTime?: number // 开始时间
  endTime?: number // 结束时间
}

export interface AssetAdjustLogListItem {
  id: number
  userId: number
  userName?: string
  userNickname?: string
  currencyCode: string
  adjustType: number // 1-增加 2-扣减
  amount: number
  balanceBefore: number // 调整前余额
  balanceAfter: number // 调整后余额
  remark?: string
  operatorId?: number // 操作人ID
  operatorName?: string // 操作人名称
  createdAt: number
  [key: string]: any
}

export interface AssetAdjustLogListResponse {
  total: number
  list: AssetAdjustLogListItem[]
}

export const getAssetAdjustLogList = (params?: AssetAdjustLogListParams) =>
  clientRequest.get<AssetAdjustLogListResponse>('/api/v1/biz/asset/adjust-log/list', { params })

// 4. 回调记录列表
export interface CallbackListParams {
  pageNum?: number
  pageSize?: number
  userId?: number
  callbackType?: number // 0-全部
  callbackStatus?: number // -1-全部
  startTime?: number
  endTime?: number
}

export interface CallbackListItem {
  id: number
  userId: number
  callbackType: number
  callbackStatus: number
  callbackUrl: string
  requestData: string
  responseData: string
  retryCount: number
  createdAt: number
  updatedAt: number
  [key: string]: any
}

export interface CallbackListResponse {
  total: number
  list: CallbackListItem[]
}

export const getCallbackList = (params?: CallbackListParams) =>
  clientRequest.get<CallbackListResponse>('/api/v1/biz/callback/list', { params })

// 3. 重试回调
export interface RetryCallbackRequest {
  id: number
}

export const retryCallback = (data: RetryCallbackRequest) =>
  clientRequest.post('/api/v1/biz/callback/retry', data)

// 4. 初始化默认币种
export const initCurrency = () =>
  clientRequest.post('/api/v1/biz/currency/init', {})

// 5. 获取币种列表
export interface CurrencyListParams {
  currencyType?: number // 0-全部 1-法币 2-数字货币
  status?: number // -1-全部 0-禁用 1-启用
}

export interface CurrencyListItem {
  id: number
  currencyCode: string // 币种编码，如 USD, USDT-TRC20
  currencyName: string // 币种名称，如 美元, USDT-TRC20
  currencyType: number // 币种类型 1-法币 2-数字货币
  symbol: string // 货币符号，如 $
  chain: string // 链名称，如 TRC20
  contract: string // 合约地址
  decimals: number // 小数位数
  iconUrl: string // 图标URL
  sort: number // 排序
  status: number // 状态 0-禁用 1-启用
  createTime: number // 创建时间（时间戳）
  updateTime: number // 更新时间（时间戳）
  [key: string]: any
}

export interface CurrencyListResponse {
  list: CurrencyListItem[]
}

export const getCurrencyList = (params?: CurrencyListParams) =>
  clientRequest.get<CurrencyListResponse>('/api/v1/biz/currency/list', { params })

// 6. 删除手续费配置
export interface DeleteFeeConfigRequest {
  userId: number
}

export const deleteFeeConfig = (data: DeleteFeeConfigRequest) =>
  clientRequest.del('/api/v1/biz/fee-config/delete', { params: { userId: data.userId } })

// 7. 手续费配置列表
export interface FeeConfigListParams {
  pageNum?: number
  pageSize?: number
  userId?: number
  status?: number // -1-全部
}

export interface FeeConfigListItem {
  id: number
  userId: number
  fixedFee: number
  ratioFee: number
  status: number
  remark: string
  createdAt: number
  updatedAt: number
  [key: string]: any
}

export interface FeeConfigListResponse {
  total: number
  list: FeeConfigListItem[]
}

export const getFeeConfigList = (params?: FeeConfigListParams) =>
  clientRequest.get<FeeConfigListResponse>('/api/v1/biz/fee-config/list', { params })

// 8. 设置手续费配置
export interface SetFeeConfigRequest {
  userId: number
  fixedFee?: number
  ratioFee?: number // 比例手续费(0.001=0.1%)
  status?: number // 0-禁用 1-启用
  remark?: string
}

export const setFeeConfig = (data: SetFeeConfigRequest) =>
  clientRequest.post('/api/v1/biz/fee-config/set', data)

// 9. 充值记录列表（管理员）
export interface AdminRechargeListParams {
  pageNum?: number
  pageSize?: number
  userId?: number
  status?: number // -1-全部
  currencyCode?: string
  rechargeNo?: string
  startTime?: number
  endTime?: number
}

export interface AdminRechargeListItem {
  id: number
  userId: number
  rechargeNo: string
  currencyCode: string
  amount: number
  status: number
  createdAt: number
  updatedAt: number
  [key: string]: any
}

export interface AdminRechargeListResponse {
  total: number
  list: AdminRechargeListItem[]
}

export const getAdminRechargeList = (params?: AdminRechargeListParams) =>
  clientRequest.get<AdminRechargeListResponse>('/api/v1/biz/recharge/list', { params })

// 10. 手动确认充值
export interface ManualConfirmRechargeRequest {
  rechargeNo: string
}

export const manualConfirmRecharge = (data: ManualConfirmRechargeRequest) =>
  clientRequest.post('/api/v1/biz/recharge/manual-confirm', data)

// 11. 资金流水列表（管理员）
export interface AdminTransactionListParams {
  pageNum?: number
  pageSize?: number
  userId?: number
  userName?: string
  currencyCode?: string
  bizType?: number
  direction?: number
  startTime?: number
  endTime?: number
}

export interface AdminTransactionListItem {
  id: number
  orderNo: string
  userId: number
  userName: string
  userNickname: string
  currencyCode: string
  bizType: number // 业务类型 1-充值 2-提现 3-转账 5-管理员调整
  bizId: number
  direction: number // 方向 1-入账 2-出账
  changeAmount: number // 变动金额
  availableBalanceBefore: number // 调整前可用余额
  availableBalanceAfter: number // 调整后可用余额
  frozenBalanceBefore: number // 调整前冻结余额
  frozenBalanceAfter: number // 调整后冻结余额
  remark: string
  createTime: number
  [key: string]: any
}

export interface AdminTransactionListResponse {
  total: number
  list: AdminTransactionListItem[]
}

export const getAdminTransactionList = (params?: AdminTransactionListParams) =>
  clientRequest.get<AdminTransactionListResponse>('/api/v1/biz/transaction/list', { params })

// 12. 审核转账申请
export interface AuditTransferRequest {
  applyNo: string
  status: number // 1-通过 3-驳回
  auditRemark?: string
}

export const auditTransfer = (data: AuditTransferRequest) =>
  clientRequest.post('/api/v1/biz/transfer/audit', data)

// 13. 完成转账
export interface CompleteTransferRequest {
  applyNo: string
  receiptUrl?: string
}

export const completeTransfer = (data: CompleteTransferRequest) =>
  clientRequest.post('/api/v1/biz/transfer/complete', data)

// 14. 转账申请列表（管理员）
export interface AdminTransferListParams {
  pageNum?: number
  pageSize?: number
  userId?: number
  userName?: string
  status?: number // -1-全部
  applyNo?: string
  startTime?: number
  endTime?: number
}

export interface AdminTransferListItem {
  id: number
  applyNo: string
  userId: number
  userName: string
  payeeId: number
  payeeName: string
  currencyCode: string // 转账币种
  receiveCurrencyCode: string // 接收币种
  transferAmount: number // 转账金额
  receiveAmount: number // 接收金额
  exchangeRate: number // 汇率
  feeAmount: number // 手续费
  remitType: number // 汇款类型
  status: number // 0-待审核 1-处理中 2-已完成 3-已驳回 4-失败
  createTime: number
  auditTime: number
  completeTime: number
  [key: string]: any
}

export interface AdminTransferListResponse {
  total: number
  list: AdminTransferListItem[]
}

export const getAdminTransferList = (params?: AdminTransferListParams) =>
  clientRequest.get<AdminTransferListResponse>('/api/v1/biz/transfer/list', { params })

// ==================== 普通用户接口 ====================

// 15. 创建API Key
export interface CreateApiKeyRequest {
  apiName: string
  ipWhitelist?: string // IP白名单(逗号分隔)
  callbackUrl?: string
  remark?: string
}

export interface ApiKeyItem {
  id: number
  apiName: string
  apiKey: string
  apiSecret: string
  ipWhitelist: string
  callbackUrl: string
  status: number
  remark: string
  createdAt: number
  updatedAt: number
  [key: string]: any
}

export interface CreateApiKeyResponse {
  data: ApiKeyItem
}

export const createApiKey = (data: CreateApiKeyRequest) =>
  clientRequest.post<CreateApiKeyResponse>('/api/v1/biz/user/api-key/create', data)

// 16. 删除API Key
export interface DeleteApiKeyRequest {
  id: number
}

export const deleteApiKey = (data: DeleteApiKeyRequest) =>
  clientRequest.delete('/api/v1/biz/user/api-key/delete', undefined, { params: { id: data.id } })

// 17. 获取我的API Key列表
export interface ApiKeyListResponse {
  list: ApiKeyItem[]
}

export const getApiKeyList = () =>
  clientRequest.get<ApiKeyListResponse>('/api/v1/biz/user/api-key/list')

// 18. 重新生成API Secret
export interface RegenerateApiSecretRequest {
  id: number
}

export interface RegenerateApiSecretResponse {
  apiSecret: string
}

export const regenerateApiSecret = (data: RegenerateApiSecretRequest) =>
  clientRequest.post<RegenerateApiSecretResponse>('/api/v1/biz/user/api-key/regenerate', data)

// 19. 设置API Key状态
export interface SetApiKeyStatusRequest {
  id: number
  status: number // 0-禁用 1-启用
}

export const setApiKeyStatus = (data: SetApiKeyStatusRequest) =>
  clientRequest.post('/api/v1/biz/user/api-key/set-status', data)

// 20. 更新API Key
export interface UpdateApiKeyRequest {
  id: number
  apiName?: string
  ipWhitelist?: string
  callbackUrl?: string
  remark?: string
}

export const updateApiKey = (data: UpdateApiKeyRequest) =>
  clientRequest.put('/api/v1/biz/user/api-key/update', data)

// 21. 获取所有充值地址
export interface DepositAddressItem {
  currencyCode: string
  address: string
  chain?: string
  [key: string]: any
}

export interface DepositAddressListResponse {
  list: DepositAddressItem[]
}

export const getAllDepositAddresses = () =>
  clientRequest.get<DepositAddressListResponse>('/api/v1/biz/user/asset/address-list')

// 22. 获取充值地址(按需创建)
export interface GetDepositAddressParams {
  currencyCode: string
  chain?: string
}

export interface GetDepositAddressResponse {
  address: string
  chain?: string
  currencyCode: string
}

export const getDepositAddress = (params: GetDepositAddressParams) =>
  clientRequest.get<GetDepositAddressResponse>('/api/v1/biz/user/asset/deposit-address', { params })

// 23. 获取我的资产列表
export interface UserAssetListItem {
  id?: number
  userId?: number
  currencyCode: string
  availableBalance: number // 可用余额
  frozenBalance: number // 冻结余额
  createTime?: number
  updateTime?: number
  version?: number
  balance?: number // 总余额（前端计算：availableBalance + frozenBalance）
  [key: string]: any
}

export interface UserAssetListResponse {
  list: UserAssetListItem[]
}

export const getUserAssetList = () =>
  clientRequest.get<UserAssetListResponse>('/api/v1/biz/user/asset/list')

// 24. 添加收款人
export interface AddPayeeRequest {
  accountType: number // 1-公司 2-个人
  companyName?: string
  firstName?: string
  lastName?: string
  remitType: number // 1-SWIFT 2-本地
  country: string
  countryCode: string
  state: string
  city: string
  address: string
  postalCode?: string
  araeCode?: string
  phone?: string
  email?: string
  accountName: string
  accountNo: string
  swiftCode?: string
  bankName: string
  bankCountry: string
  bankCountryCode: string
  bankState?: string
  bankCity?: string
  bankAddress?: string
  purpose?: string
  purposeDesc?: string
  remark?: string
}

export interface PayeeItem {
  id: number
  accountType: number
  companyName?: string
  firstName?: string
  lastName?: string
  remitType: number
  country: string
  countryCode: string
  state: string
  city: string
  address: string
  postalCode?: string
  araeCode?: string
  phone?: string
  email?: string
  accountName: string
  accountNo: string
  swiftCode?: string
  bankName: string
  bankCountry: string
  bankCountryCode: string
  bankState?: string
  bankCity?: string
  bankAddress?: string
  purpose?: string
  purposeDesc?: string
  remark?: string
  status: number
  createdAt: number
  updatedAt: number
  [key: string]: any
}

export const addPayee = (data: AddPayeeRequest) =>
  clientRequest.post<{ data: PayeeItem }>('/api/v1/biz/user/payee/add', data)

// 25. 删除收款人
export interface DeletePayeeRequest {
  id: number
}

export const deletePayee = (data: DeletePayeeRequest) =>
  clientRequest.del('/api/v1/biz/user/payee/delete', { params: { id: data.id } })

// 26. 获取收款人详情
export interface GetPayeeDetailParams {
  id: number
}

export interface GetPayeeDetailResponse {
  data: PayeeItem
}

export const getPayeeDetail = (params: GetPayeeDetailParams) =>
  clientRequest.get<GetPayeeDetailResponse>('/api/v1/biz/user/payee/detail', { params })

// 27. 编辑收款人
export interface EditPayeeRequest {
  id: number
  accountType: number
  companyName?: string
  firstName?: string
  lastName?: string
  remitType: number
  country: string
  countryCode: string
  state: string
  city: string
  address: string
  postalCode?: string
  araeCode?: string
  phone?: string
  email?: string
  accountName: string
  accountNo: string
  swiftCode?: string
  bankName: string
  bankCountry: string
  bankCountryCode: string
  bankState?: string
  bankCity?: string
  bankAddress?: string
  purpose?: string
  purposeDesc?: string
  remark?: string
}

export const editPayee = (data: EditPayeeRequest) =>
  clientRequest.put('/api/v1/biz/user/payee/edit', data)

// 28. 获取收款人列表
export interface PayeeListParams {
  pageNum?: number
  pageSize?: number
  remitType?: number // 0-全部 1-SWIFT 2-本地
  accountType?: number // 账户类型 1-公司 2-个人
  status?: number // -1-全部 0-禁用 1-启用
  searchKey?: string
}

export interface PayeeListResponse {
  total: number
  list: PayeeItem[]
}

export const getPayeeList = (params?: PayeeListParams) =>
  clientRequest.get<PayeeListResponse>('/api/v1/biz/user/payee/list', { params })

// 29. 获取充值详情
export interface GetRechargeDetailParams {
  rechargeNo: string
}

export interface RechargeDetailItem {
  id: number
  rechargeNo: string
  userId: number
  currencyCode: string
  amount: number
  status: number
  address: string
  txHash?: string
  createdAt: number
  updatedAt: number
  [key: string]: any
}

export interface GetRechargeDetailResponse {
  data: RechargeDetailItem
}

export const getRechargeDetail = (params: GetRechargeDetailParams) =>
  clientRequest.get<GetRechargeDetailResponse>('/api/v1/biz/user/recharge/detail', { params })

// 30. 获取我的充值记录
export interface UserRechargeListParams {
  pageNum?: number
  pageSize?: number
  status?: number // -1-全部 0-待确认 1-已到账 2-失败 3-已取消
  currencyCode?: string
  rechargeNo?: string
  startTime?: number
  endTime?: number
}

export interface UserRechargeListResponse {
  total: number
  list: RechargeDetailItem[]
}

export const getUserRechargeList = (params?: UserRechargeListParams) =>
  clientRequest.get<UserRechargeListResponse>('/api/v1/biz/user/recharge/list', { params })

// 31. 绑定谷歌验证
export interface BindGoogleAuthRequest {
  secret: string
  code: string
}

export const bindGoogleAuth = (data: BindGoogleAuthRequest) =>
  clientRequest.post('/api/v1/biz/user/security/google-auth/bind', data)

// 32. 生成谷歌验证密钥
export interface GenerateGoogleAuthResponse {
  secret: string
  qrCodeUrl: string
}

export const generateGoogleAuth = () =>
  clientRequest.post<GenerateGoogleAuthResponse>('/api/v1/biz/user/security/google-auth/generate', {})

// 33. 获取谷歌验证绑定状态
export interface GoogleAuthStatusResponse {
  bound: boolean
}

export const getGoogleAuthStatus = () =>
  clientRequest.get<GoogleAuthStatusResponse>('/api/v1/biz/user/security/google-auth/status')

// 34. 解绑谷歌验证
export interface UnbindGoogleAuthRequest {
  code: string
}

export const unbindGoogleAuth = (data: UnbindGoogleAuthRequest) =>
  clientRequest.post('/api/v1/biz/user/security/google-auth/unbind', data)

// 35. 验证谷歌验证码
export interface VerifyGoogleAuthRequest {
  code: string
}

export const verifyGoogleAuth = (data: VerifyGoogleAuthRequest) =>
  clientRequest.post('/api/v1/biz/user/security/google-auth/verify', data)

// 36. 重置支付密码
export interface ResetPayPasswordRequest {
  newPassword: string
  googleCode?: string
}

export const resetPayPassword = (data: ResetPayPasswordRequest) =>
  clientRequest.post('/api/v1/biz/user/security/pay-password/reset', data)

// 37. 设置支付密码
export interface SetPayPasswordRequest {
  password: string
}

export const setPayPassword = (data: SetPayPasswordRequest) =>
  clientRequest.post('/api/v1/biz/user/security/pay-password/set', data)

// 38. 获取支付密码设置状态
export interface PayPasswordStatusResponse {
  isSet: boolean
}

export const getPayPasswordStatus = () =>
  clientRequest.get<PayPasswordStatusResponse>('/api/v1/biz/user/security/pay-password/status')

// 39. 验证支付密码
export interface VerifyPayPasswordRequest {
  password: string
}

export const verifyPayPassword = (data: VerifyPayPasswordRequest) =>
  clientRequest.post('/api/v1/biz/user/security/pay-password/verify', data)

// 40. 获取我的资金流水
export interface UserTransactionListParams {
  pageNum?: number
  pageSize?: number
  currencyCode?: string
  bizType?: number // 0-全部
  direction?: number // 0-全部 1-入账 2-出账
  startTime?: number
  endTime?: number
}

export interface UserTransactionListItem {
  id: number
  orderNo: string // 订单号
  userId: number
  currencyCode: string
  bizType: number // 业务类型 1-充值 2-提现 3-转账 5-管理员调整
  bizId: number
  direction: number // 方向 1-入账 2-出账
  changeAmount: number // 变动金额
  availableBalanceBefore: number // 调整前可用余额
  availableBalanceAfter: number // 调整后可用余额
  frozenBalanceBefore: number // 调整前冻结余额
  frozenBalanceAfter: number // 调整后冻结余额
  remark?: string // 备注
  createTime: string // 创建时间 "2026-02-02 14:52:59"
  // 兼容字段
  amount?: number // 兼容旧版本 amount
  balance?: number // 兼容旧版本 balance
  createdAt?: number // 兼容旧版本 createdAt（时间戳）
  [key: string]: any
}

export interface UserTransactionListResponse {
  total: number
  list: UserTransactionListItem[]
}

export const getUserTransactionList = (params?: UserTransactionListParams) =>
  clientRequest.get<UserTransactionListResponse>('/api/v1/biz/user/transaction/list', { params })

// 41. 计算转账手续费
export interface CalculateTransferFeeRequest {
  transferAmount: number
}

export interface CalculateTransferFeeResponse {
  fee: number
  totalAmount: number
  fixedFee?: number // 固定费用
  feeRate?: number // 收费比例（百分比，如0.25表示0.25%）
  exchangeRate?: number // 汇率
}

export const calculateTransferFee = (data: CalculateTransferFeeRequest) =>
  clientRequest.post<CalculateTransferFeeResponse>('/api/v1/biz/user/transfer/calculate-fee', data)

// 42. 创建转账申请
export interface CreateTransferRequest {
  payeeId: number
  currencyCode: string
  receiveCurrencyCode: string
  transferAmount: number
  exchangeRate: number
  purposeType: string
  purposeDesc?: string
  memo?: string
  transactionMaterial?: string
  payPassword: string
  googleCode?: string
}

export interface CreateTransferResponse {
  applyNo: string
}

export const createTransfer = (data: CreateTransferRequest) =>
  clientRequest.post<CreateTransferResponse>('/api/v1/biz/user/transfer/create', data)

// 43. 获取转账详情
export interface GetTransferDetailParams {
  applyNo: string
}

export interface TransferDetailItem {
  id: number
  applyNo: string
  userId: number
  payeeId: number
  currencyCode: string
  receiveCurrencyCode: string
  transferAmount: number
  exchangeRate: number
  fee: number
  status: number
  purposeType: string
  purposeDesc?: string
  memo?: string
  transactionMaterial?: string
  createdAt: number
  updatedAt: number
  [key: string]: any
}

export interface GetTransferDetailResponse {
  data: TransferDetailItem
}

export const getTransferDetail = (params: GetTransferDetailParams) =>
  clientRequest.get<GetTransferDetailResponse>('/api/v1/biz/user/transfer/detail', { params })

// 44. 下载转账记录PDF
export interface DownloadTransferPdfParams {
  applyNo: string
}

export const downloadTransferPdf = (params: DownloadTransferPdfParams) =>
  clientRequest.get('/api/v1/biz/user/transfer/download-pdf', { params })

// 45. 获取我的转账列表
export interface UserTransferListParams {
  pageNum?: number
  pageSize?: number
  status?: number // -1-全部 0-待审核 1-处理中 2-已完成 3-已驳回 4-失败
  applyNo?: string
  startTime?: number
  endTime?: number
}

export interface UserTransferListResponse {
  total: number
  list: TransferDetailItem[]
}

export const getUserTransferList = (params?: UserTransferListParams) =>
  clientRequest.get<UserTransferListResponse>('/api/v1/biz/user/transfer/list', { params })

// 46. 上传文件
export interface UploadFileResponse {
  size: number
  path: string
  fullPath: string
  name: string
  type: string
}

export const uploadSingleFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return clientRequest.post<UploadFileResponse>('/api/v1/system/upload/singleFile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ==================== 公共接口 ====================

// 46. Cregis充值回调
export interface CregisDepositCallbackRequest {
  pid?: number
  address?: string
  chain_id?: string
  token_id?: string
  currency?: string
  amount?: string
  txid?: string
  block_height?: string
  block_time?: string
  status?: number
  alias?: string
  sign?: string
}

export const cregisDepositCallback = (data: CregisDepositCallbackRequest) =>
  clientRequest.post('/api/v1/pub/callback/cregis/deposit', data)
