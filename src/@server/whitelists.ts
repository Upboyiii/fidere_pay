import { clientRequest } from '@server/http'

export const getWhitelists = (data: { pageSize: number; pageNum: number; [x: string]: any }) =>
  clientRequest.post('/member/walletWhitelist/list', data)
export const getWhitelistDetail = (data: { id: string }) =>
  clientRequest.get(`/member/walletWhitelist/detail`, { params: data })
// 审核通过法币出金账户
export const approveWhitelist = (data: { id: string; remark?: string }) =>
  clientRequest.post('/member/walletWhitelist/approve', data)
// 审核拒绝法币出金账户
export const rejectWhitelist = (data: { id: string; remark?: string }) =>
  clientRequest.post('/member/walletWhitelist/reject', data)
export const getCoinTypes = () => clientRequest.get('/member/walletWhitelist/coin_type')
