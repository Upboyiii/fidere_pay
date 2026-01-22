import { clientRequest } from '@server/http'
// 获取国家列表
export const getCountryList = () => clientRequest.get('/general/get-country')
// 获取 职业列表
export const getCareerList = () => clientRequest.get('/general/get-career')
