import { clientRequest } from '@server/http'

export const getKycDashboardData = () => clientRequest.get('/member/review/total')
export const getPendingTableData = (data: any) => clientRequest.post('/member/review/pending', data)
export const getRejectedTableData = (data: any) => clientRequest.post('/member/review/rejectList', data)
export const getReviewDetail = (data: any) => clientRequest.post('/member/review/process', data)
// 通过当前步骤
export const approveReview = (data: any) => clientRequest.post('/member/review/approve', data)
// 拒绝当前步骤
export const rejectReview = (data: any) => clientRequest.post('/member/review/reject', data)
// 重置审核步骤
export const resetReview = (data: any) => clientRequest.post('/member/review/reset', data)
// 重置审核步骤
export const getOverviewData = (params: any) => clientRequest.get('/member/review/overview', { params })
