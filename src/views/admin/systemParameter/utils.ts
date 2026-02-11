/**
 * 系统参数配置工具函数
 */
export const formatDateToString = (date: Date | null): string | undefined => {
  if (!date) return undefined
  return date.toISOString().split('T')[0]
}

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

export const FORM_DEFAULT_VALUES = {
  configName: '',
  configKey: '',
  configValue: '',
  configType: '0',
  remark: ''
}

export const SEARCH_PARAMS_DEFAULT = {
  configName: '',
  configKey: '',
  configType: '',
  startDate: null as Date | null,
  endDate: null as Date | null
}
