/**
 * 系统参数配置 API
 * GET /api/v1/system/config/list
 * POST /api/v1/system/config/add
 * GET /api/v1/system/config/get
 * PUT /api/v1/system/config/edit
 */
import { clientRequest } from '@server/http'

export interface SystemConfigItem {
  configId: number
  configName: string
  configKey: string
  configValue: string
  configType: number
  createBy?: number
  updateBy?: number
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface SystemConfigListParams {
  configName?: string
  configKey?: string
  configType?: string
  dateRange?: string[]
  pageNum?: number
  pageSize?: number
  orderBy?: string
}

export interface SystemConfigListResponse {
  list: SystemConfigItem[]
  currentPage: number
  total: number
}

export interface SystemConfigAddParams {
  configName: string
  configKey: string
  configValue: string
  configType: number
  remark?: string
}

export interface SystemConfigEditParams extends SystemConfigAddParams {
  configId: number
}

export const getSystemConfigList = (params?: SystemConfigListParams) =>
  clientRequest.get<SystemConfigListResponse>('/_api/v1/system/config/list', { params })

export const addSystemConfig = (data: SystemConfigAddParams) =>
  clientRequest.post('/_api/v1/system/config/add', data)

/** 获取系统参数详情，传 id（即 configId） */
export const getSystemConfig = (params: { id?: number; configId?: number }) => {
  const id = params.id ?? params.configId
  return clientRequest.get<SystemConfigItem>('/_api/v1/system/config/get', { params: id != null ? { id } : {} })
}

export const editSystemConfig = (data: SystemConfigEditParams) =>
  clientRequest.put('/_api/v1/system/config/edit', data)
