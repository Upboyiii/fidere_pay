import { clientRequest } from '@server/http'

export const getFatAccounts = (data: { pageSize: number; pageNum: number; [x: string]: any }) =>
  clientRequest.post('/member/bankAccount/list', data)
export const getFatAccountDetail = (data: { id: string }) =>
  clientRequest.get(`/member/bankAccount/detail`, { params: data })
// 审核通过法币出金账户
export const approveFatAccount = (data: { id: string; remark?: string }) =>
  clientRequest.post('/member/bankAccount/approve', data)
// 审核拒绝法币出金账户
export const rejectFatAccount = (data: { id: string; remark?: string }) =>
  clientRequest.post('/member/bankAccount/reject', data)
