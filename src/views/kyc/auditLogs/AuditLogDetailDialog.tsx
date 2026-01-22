'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'

// Icon Imports
import { FileText, X } from 'lucide-react'

// Component Imports
import { getAuditLogDetail } from '@server/auditLogs'
import { useTranslate } from '@/contexts/DictionaryContext'

type AuditLogDetailDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  operId: string | number | null
}

/**
 * 审计日志详情弹窗组件
 * @param open 是否打开
 * @param setOpen 设置打开状态
 * @param operId 操作日志ID
 */
const AuditLogDetailDialog = ({ open, setOpen, operId }: AuditLogDetailDialogProps) => {
  const t = useTranslate()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    if (open && operId) {
      requestDetail()
    }
  }, [open, operId])

  /**
   * 处理弹窗关闭，延迟清除数据
   */
  const handleClose = () => {
    setOpen(false)
    // 延迟清除数据，等待弹窗关闭动画完成
    setTimeout(() => {
      setDetail(null)
    }, 300)
  }

  /**
   * 请求详情数据
   */
  const requestDetail = async () => {
    if (!operId) return
    setLoading(true)
    try {
      const res = await getAuditLogDetail({ operId })
      setDetail(res.data ?? null)
    } catch (error) {
      console.error(error)
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 格式化请求参数显示
   */
  const formatOperParam = (param: string) => {
    if (!param) return '-'
    try {
      const parsed = JSON.parse(param)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return param
    }
  }

  /**
   * 获取请求方式显示文本
   */
  const getRequestMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      POST: t('auditLogs.add'),
      GET: t('auditLogs.read'),
      PUT: t('auditLogs.update'),
      DELETE: t('auditLogs.deleteAction')
    }
    return methodMap[method] || method
  }

  /**
   * 渲染字段项
   */
  const renderField = (
    label: string,
    value: string | number,
    options?: { monospace?: boolean; wordBreak?: boolean }
  ) => {
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <div
          className='p-4 rounded-lg border'
          style={{
            backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
            borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
          }}
        >
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5, fontSize: '0.75rem' }}>
            {label}
          </Typography>
          <Typography
            variant='body1'
            sx={{
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'text.primary',
              fontFamily: options?.monospace ? 'monospace' : 'inherit',
              wordBreak: options?.wordBreak ? 'break-all' : 'normal'
            }}
          >
            {value || '-'}
          </Typography>
        </div>
      </Grid>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
        {t('auditLogs.viewDetails')}
        <IconButton onClick={handleClose} size='small' sx={{ ml: 2, mr: 2 }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <>
            {/* 标题区域骨架屏 */}
            <div className='flex items-center gap-2.5 mbe-6'>
              <Skeleton variant='rectangular' width={40} height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant='text' width={150} height={28} />
            </div>

            {/* 字段区域骨架屏 */}
            <Grid container spacing={3}>
              {Array.from({ length: 11 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6 }}>
                  <div
                    className='p-4 rounded-lg border'
                    style={{
                      backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                      borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                    }}
                  >
                    <Skeleton variant='text' width='40%' height={14} sx={{ mb: 1.5 }} />
                    <Skeleton variant='text' width='80%' height={20} />
                  </div>
                </Grid>
              ))}

              {/* 请求参数区域骨架屏 */}
              <Grid size={{ xs: 12 }}>
                <div
                  className='p-4 rounded-lg border'
                  style={{
                    backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                    borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                  }}
                >
                  <Skeleton variant='text' width='30%' height={14} sx={{ mb: 1.5 }} />
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      borderRadius: 1,
                      border: '1px solid var(--mui-palette-divider)',
                      maxHeight: '200px'
                    }}
                  >
                    <Skeleton variant='text' width='100%' height={16} sx={{ mb: 1 }} />
                    <Skeleton variant='text' width='90%' height={16} sx={{ mb: 1 }} />
                    <Skeleton variant='text' width='95%' height={16} />
                  </Box>
                </div>
              </Grid>
            </Grid>
          </>
        ) : detail ? (
          <>
            {/* 标题区域 */}
            <div className='flex items-center gap-2.5 mbe-6'>
              <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                <FileText size={20} className='text-primary' />
              </div>
              <Typography variant='h6' className='font-semibold'>
                操作日志详情
              </Typography>
            </div>

            {/* 字段区域 */}
            <Grid container spacing={3}>
              {renderField(t('auditLogs.logId'), detail.operId, { monospace: true })}
              {renderField(t('auditLogs.requestMethod'), getRequestMethodLabel(detail.requestMethod || ''))}
              {renderField(t('auditLogs.departmentName'), detail.deptName || '-')}
              {renderField(t('auditLogs.operationLocation'), detail.operLocation || '-')}
              {renderField(t('auditLogs.operationMethod'), detail.operUrl || '-', { monospace: true, wordBreak: true })}
              {renderField(t('auditLogs.errorMessage'), detail.errorMsg || '-')}
              {renderField(t('auditLogs.systemModule'), detail.title || '-')}
              {renderField(t('auditLogs.operator'), detail.operName || '-')}
              {renderField(t('auditLogs.hostAddress'), detail.operIp || '-', { monospace: true })}
              {renderField(t('auditLogs.operationTime'), detail.operTime || '-', { monospace: true })}
              {renderField(t('auditLogs.requestUrl'), detail.operUrl || '-', { monospace: true, wordBreak: true })}

              {/* 请求参数 - 单独一行 */}
              <Grid size={{ xs: 12 }}>
                <div
                  className='p-4 rounded-lg border'
                  style={{
                    backgroundColor: 'var(--mui-palette-customColors-infoCardBg)',
                    borderColor: 'var(--mui-palette-customColors-infoCardBorder)'
                  }}
                >
                  <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5, fontSize: '0.75rem' }}>
                    {t('auditLogs.requestParameters')}
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'var(--mui-palette-background-paper)',
                      borderRadius: 1,
                      border: '1px solid var(--mui-palette-divider)',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}
                  >
                    <Typography
                      variant='body2'
                      component='pre'
                      sx={{
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.75rem',
                        margin: 0,
                        wordBreak: 'break-all',
                        color: 'text.primary'
                      }}
                    >
                      {formatOperParam(detail.operParam)}
                    </Typography>
                  </Box>
                </div>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <Typography color='text.secondary'>暂无数据</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AuditLogDetailDialog
