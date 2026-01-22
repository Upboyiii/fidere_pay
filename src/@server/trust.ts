import { clientRequest } from '@server/http'

/**
 * 信托列表项类型
 */
export interface TrustListItem {
  /** 信托记录id */
  trustId: number
  /** 信托所属用户id */
  userId: number
  /** 信托名称 */
  trustName: string
  /** 信托编号 */
  trustNumber: string
  /** 信托UUID */
  trustUuid: string
  /** 用户名称 */
  userName: string
  /** 用户邮箱 */
  userEmail: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 受益人总数 */
  beneficiaryCount: number
  /** 待审核受益人数 */
  pendingBeneficiaryCount: number
  /** 文件总数 */
  documentCount: number
  /** 待签文件数 */
  pendingDocumentCount: number
}

/**
 * 信托统计数据类型
 */
export interface TrustListStat {
  /** 信托总数 */
  trustTotal: number
  /** 待审核受益人数量 */
  pendingBeneficiary: number
  /** 待签署文件数量 */
  pendingSign: number
  /** 受益人总数 */
  beneficiaryTotal: number
}

/**
 * 信托列表响应类型
 */
export interface TrustListResponse {
  /** 当前页码 */
  currentPage: number
  /** 总条数 */
  total: number
  /** 信托列表 */
  list: TrustListItem[]
  /** 统计数据 */
  stat: TrustListStat
}

/**
 * 获取信托列表请求参数
 */
export interface GetTrustListParams {
  /** 页码 */
  pageNum?: number
  /** 每页条数 */
  pageSize?: number
  /** 关键词搜索 */
  keyword?: string
}

/**
 * 获取信托列表
 * @param params - 查询参数
 * @returns 信托列表响应数据
 */
export const getTrustList = (params: GetTrustListParams) =>
  clientRequest.post<TrustListResponse>('/member/trust/trust/list', params)

/**
 * 信托详情数据
 */
export interface TrustDetailData {
  /** 信托记录id */
  trustId: number
  /** 信托所属用户id */
  userId: number
  /** 信托名称 */
  trustName: string
  /** 信托编号 */
  trustNumber: string
  /** 信托UUID */
  trustUuid: string
  /** 用户名称 */
  userName: string
  /** 用户邮箱 */
  userEmail: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/**
 * 信托详情响应类型
 */
export interface TrustDetailResponse {
  /** 信托详情数据 */
  detail: TrustDetailData
}

/**
 * 获取信托详情请求参数
 */
export interface GetTrustDetailParams {
  /** 信托ID */
  trustId: number | string
}

/**
 * 获取信托详情
 * @param params - 查询参数
 * @returns 信托详情响应数据
 */
export const getTrustDetail = (params: GetTrustDetailParams) =>
  clientRequest.get<TrustDetailResponse>('/member/trust/trust/detail', { params })

/**
 * 受益人列表项类型
 */
export interface BeneficiaryListItem {
  /** 受益人记录id */
  id: number
  /** 信托所属用户id */
  userId: number
  /** 信托记录id */
  trustId: number
  /** 受益人姓名 */
  name: string
  /** 受益人邮箱 */
  email: string
  /** 受益人手机号 */
  phone: string
  /** 受益人联系地址 */
  address: string
  /** 与信托所属人关系 */
  relation: number
  /** 证件类型 */
  idDocumentType: number
  /** 证件号码 */
  idDocumentNumber: string
  /** 审核状态 0待审核 1通过 2拒绝 */
  status: number
  /** 状态文案 */
  statusLabel: string
  /** 受益比例 */
  benefitRatio: number
  /** 受益比例类型 FIXED/VARIABLE */
  ratioType: string
  /** 受益比例类型文案 */
  ratioTypeLabel: string
  /** 生效日期 */
  effectiveDate: string
  /** 结束日期 */
  terminationDate: string
  /** 受益顺位 */
  benefitPriority: number
  /** 受益人类型 0个人 1机构 */
  beneficiaryType: number
  /** 是否主受益人 1是 */
  isPrimaryBen: number
  /** 提交时间 */
  submitTime: string
  /** 证件类型文案 */
  idDocumentTypeLabel: string
  /** 关系文案 */
  relationLabel: string
  /** 驳回原因 */
  remark?: string
}

/**
 * 受益人列表响应类型
 */
export interface BeneficiaryListResponse {
  /** 受益人列表 */
  list: BeneficiaryListItem[]
}

/**
 * 获取受益人列表请求参数
 */
export interface GetBeneficiaryListParams {
  /** 信托ID */
  trustId: number | string
}

/**
 * 获取受益人列表
 * @param params - 查询参数
 * @returns 受益人列表响应数据
 */
export const getBeneficiaryList = (params: GetBeneficiaryListParams) =>
  clientRequest.get<BeneficiaryListResponse>('/member/trust/trust/beneficiaries', { params })

/**
 * 信托文档列表项类型
 */
export interface TrustDocumentListItem {
  /** 文档记录id */
  id: number
  /** 信托所属用户id */
  userId: number
  /** 文件类型 1证明 2信托 */
  type: string
  /** 使用场景编码 */
  scene: string
  /** 使用场景文案 */
  sceneLabel: string
  /** 文件标题 */
  title: string
  /** 签署状态 */
  status: number
  /** 签署状态文案 */
  statusLabel: string
  /** 创建时间 */
  createTime: string
  /** 签署时间 */
  signatureTime: string
  /** 预览链接 */
  previewUrl: string
  /** 下载链接 */
  downloadUrl: string
}

/**
 * 信托文档列表响应类型
 */
export interface TrustDocumentListResponse {
  /** 文档列表 */
  list: TrustDocumentListItem[]
}

/**
 * 获取信托文档列表请求参数
 */
export interface GetTrustDocumentListParams {
  /** 信托ID */
  trustId: number | string
}

/**
 * 获取信托文档列表
 * @param params - 查询参数
 * @returns 信托文档列表响应数据
 */
export const getTrustDocumentList = (params: GetTrustDocumentListParams) =>
  clientRequest.get<TrustDocumentListResponse>('/member/trust/trust/documents', { params })

/**
 * 受益人审核请求参数
 */
export interface BeneficiaryAuditParams {
  /** 受益人ID */
  beneficiaryId: number | string
  /** 操作类型 approve-通过 reject-驳回 */
  action: 'approve' | 'reject'
  /** 备注（驳回时可选） */
  remark?: string
}

/**
 * 受益人审核（通过或驳回）
 * @param params - 请求参数
 * @returns 响应数据
 */
export const beneficiaryAudit = (params: BeneficiaryAuditParams) =>
  clientRequest.post('/member/trust/trust/beneficiary/audit', params)

/**
 * 通过受益人审核请求参数
 */
export interface ApproveBeneficiaryParams {
  /** 受益人ID */
  id: number | string
}

/**
 * 通过受益人审核
 * @param params - 请求参数
 * @returns 响应数据
 */
export const approveBeneficiary = (params: ApproveBeneficiaryParams) =>
  beneficiaryAudit({ beneficiaryId: params.id, action: 'approve' })

/**
 * 驳回受益人请求参数
 */
export interface RejectBeneficiaryParams {
  /** 受益人ID */
  id: number | string
  /** 驳回原因 */
  reason: string
}

/**
 * 驳回受益人
 * @param params - 请求参数
 * @returns 响应数据
 */
export const rejectBeneficiary = (params: RejectBeneficiaryParams) =>
  beneficiaryAudit({ beneficiaryId: params.id, action: 'reject', remark: params.reason })
