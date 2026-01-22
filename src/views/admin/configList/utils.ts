/**
 * 系统参数管理工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDateToString = (date: Date | null): string | undefined => {
  if (!date) return undefined
  return date.toISOString().split('T')[0]
}

/**
 * 清理请求参数，移除空值
 */
export const cleanRequestParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {}
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value
    }
  })
  return cleaned
}

/**
 * 表单默认值
 */
export const FORM_DEFAULT_VALUES = {
  configName: '',
  configKey: '',
  configValue: '',
  configType: '0',
  remark: ''
}

/**
 * 搜索参数默认值
 */
export const SEARCH_PARAMS_DEFAULT = {
  configName: '',
  configKey: '',
  configType: '',
  startDate: null as Date | null,
  endDate: null as Date | null
}
