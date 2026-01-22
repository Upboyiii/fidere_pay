/**
 * 文件管理工具函数
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
  appId: '',
  kind: '',
  drive: '',
  ext: '',
  name: '',
  status: undefined as boolean | undefined
}

/**
 * 格式化文件大小
 * @param bytes - 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 获取上传类型选项
 */
export const UPLOAD_TYPE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '图片', value: 'image' },
  { label: '文档', value: 'doc' },
  { label: '音频', value: 'audio' },
  { label: '视频', value: 'video' },
  { label: '压缩包', value: 'zip' },
  { label: '其它', value: 'other' }
]

/**
 * 获取上传驱动选项
 */
export const UPLOAD_DRIVE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '本地上传', value: '0' }
]
