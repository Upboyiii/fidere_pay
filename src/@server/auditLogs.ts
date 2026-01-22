import { clientRequest } from '@server/http'

/**
 * 获取操作日志列表
 * @param data 查询参数
 */
export const getAuditLogsList = (data: { pageSize: number; pageNum: number; [x: string]: any }) =>
  clientRequest.get('/system/operLog/list', { params: data })

/**
 * 获取操作日志详情
 * @param data 查询参数
 */
export const getAuditLogDetail = (data: { operId: string | number }) =>
  clientRequest.get('/system/operLog/get', { params: data })

/**
 * 删除操作日志
 * @param data 删除参数
 */
export const deleteAuditLog = (data: { operId: string | number }) =>
  clientRequest.delete('/system/operLog/remove', data)
