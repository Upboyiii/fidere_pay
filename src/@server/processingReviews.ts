import { clientRequest } from '@server/http'

export const getProcessingList = (data: any) => clientRequest.post('/member/review/processList', data)
export const getProcessingTotal = () => clientRequest.get('/member/review/processTotal')
