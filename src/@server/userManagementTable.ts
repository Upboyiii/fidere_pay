import { clientRequest } from '@server/http'

export const getUserManagementTable = (data: { pageSize: number; pageNum: number; [x: string]: any }) =>
  clientRequest.post('/member/member/list', data)
export const getUserManagementDetail = (data: { id: string }) =>
  clientRequest.get('/member/member/get', { params: data })
export const editUserManagement = (data: any) => clientRequest.post('/member/member/edit', data)
/**
 * 更新用户状态
 * @param id 用户ID
 * @param status 状态值 1-启用 3-禁用
 */
export const updateMemberStatus = (id: number, status: number) => {
  const url = `/member/member/status?id=${id}&status=${status}`
  return clientRequest.post(url, {})
}
/**
 * 重置用户密码
 * @param userId 用户ID
 * @param newPassword 新密码
 * @param confirmNewPassword 确认新密码
 */
export const resetMemberPassword = (userId: number, newPassword: string, confirmNewPassword: string) => {
  return clientRequest.post('/member/member/resetPwd', {
    userId,
    newPassword,
    confirmNewPassword
  })
}
