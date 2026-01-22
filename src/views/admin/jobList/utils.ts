/**
 * 任务管理工具函数
 */

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
 * 搜索参数默认值
 */
export const SEARCH_PARAMS_DEFAULT = {
  jobName: '',
  jobGroup: '',
  status: ''
}

/**
 * 任务组名选项
 */
export const JOB_GROUP_OPTIONS = [
  { label: '全部', value: '' },
  { label: '默认', value: 'DEFAULT' },
  { label: '系统', value: 'SYSTEM' }
]

/**
 * 状态选项
 * 0=启用/正常，1=禁用/暂停
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '正常', value: '0' },
  { label: '暂停', value: '1' }
]

/**
 * 计划执行策略选项
 */
export const MISFIRE_POLICY_OPTIONS = [
  { label: '重复执行', value: '1' },
  { label: '执行一次', value: '0' }
]

/**
 * 状态选项（用于表单）
 * 0=启用/正常，1=禁用/暂停
 */
export const STATUS_FORM_OPTIONS = [
  { label: '正常', value: '0' },
  { label: '暂停', value: '1' }
]

/**
 * Cron表达式示例
 */
export const CRON_EXAMPLES = [
  { expression: '*/5 * * * * ?', description: '每隔5秒执行一次' },
  { expression: '20 */1 * * * ?', description: '每隔1分钟执行一次' },
  { expression: '30 0 23 * * ?', description: '每天23点执行一次' },
  { expression: '0 0 1 * * ?', description: '每天凌晨1点执行一次' },
  { expression: '0 0 1 1 * ?', description: '每月1号凌晨1点执行一次' }
]
