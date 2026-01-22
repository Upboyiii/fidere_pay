import { clientRequest } from '@server/http'

// OTC费率配置项类型定义
export interface OtcRateItem {
  id: number
  userId: number
  email: string
  nick_name: string
  faitToCoin: string // 法币兑换数字币费率
  coinToFait: string // 数字币兑换法币费率
}

// OTC费率配置列表响应
export interface OtcRateListResponse {
  total: number
  list: OtcRateItem[]
}

// 获取OTC费率配置列表
// API: GET /admin-api/operation/otc-rate/list
export const getOtcRateList = (params?: {
  pageNum?: number
  pageSize?: number
  userId?: number
  email?: string
}) =>
  clientRequest.get<OtcRateListResponse>('/operation/otc-rate/list', { params })

// 新增OTC费率配置请求参数
export interface CreateOtcRateRequest {
  userId: number // 客户ID
  faitToCoin: string // 法币兑换数字币费率
  coinToFait: string // 数字币兑换法币费率
}

// 新增OTC费率配置
// API: POST /admin-api/operation/otc-rate/create
export const createOtcRate = (data: CreateOtcRateRequest) =>
  clientRequest.post('/operation/otc-rate/create', data)

// 更新OTC费率配置请求参数
export interface UpdateOtcRateRequest {
  id: number // 记录ID
  userId: number // 客户ID
  faitToCoin: string // 法币兑换数字币费率
  coinToFait: string // 数字币兑换法币费率
}

// 更新OTC费率配置
// API: POST /admin-api/operation/otc-rate/update
export const updateOtcRate = (data: UpdateOtcRateRequest) =>
  clientRequest.post('/operation/otc-rate/update', data)

// 删除OTC费率配置请求参数
export interface DeleteOtcRateRequest {
  ids: number[] // 记录ID集合
}

// 删除OTC费率配置
// API: POST /admin-api/operation/otc-rate/delete
export const deleteOtcRate = (data: DeleteOtcRateRequest) =>
  clientRequest.post('/operation/otc-rate/delete', data)


