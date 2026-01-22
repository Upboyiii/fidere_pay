'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import { X } from 'lucide-react'
import TableComponent from '@/components/table'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns/format'

// API Imports
import { getSysJobLogList, clearSysJobLog } from '@server/admin'
import { toast } from 'react-toastify'

// Type Imports
import type { JobData } from './JobTable'

interface JobDetailDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 任务数据 */
  jobData?: JobData | null
}

interface JobLogData {
  /** 日志ID */
  id: number
  /** 执行方法 */
  targetName: string
  /** 执行日期 */
  createdAt: string
  /** 执行结果（包含执行状态和详细信息） */
  result: string
}

/**
 * 任务详情对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param jobData - 任务数据
 */
const JobDetailDialog = ({ open, onClose, jobData }: JobDetailDialogProps) => {
  const [logData, setLogData] = useState<JobLogData[]>([])
  const [logLoading, setLogLoading] = useState(false)
  const [logTotal, setLogTotal] = useState(0)

  /**
   * 加载执行日志
   */
  const loadJobLogs = useCallback(async () => {
    if (!jobData?.invokeTarget) return

    try {
      setLogLoading(true)
      const res = await getSysJobLogList({ targetName: jobData.invokeTarget, pageNum: 1, pageSize: 10 })
      const list = res.data?.list || res.data?.rows || res.data || []
      const total = res.data?.total || list.length
      setLogData(list as JobLogData[])
      setLogTotal(total)
    } catch (error) {
      console.error('加载执行日志失败:', error)
      toast.error('加载日志失败')
    } finally {
      setLogLoading(false)
    }
  }, [jobData])

  /**
   * 清空日志
   */
  const handleClearLog = async () => {
    if (!jobData?.invokeTarget) return

    try {
      await clearSysJobLog({ targetName: jobData.invokeTarget })
      toast.success('清空成功')
      loadJobLogs()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || '清空失败')
    }
  }

  useEffect(() => {
    if (open && jobData) {
      loadJobLogs()
    }
  }, [open, jobData, loadJobLogs])

  /**
   * 获取状态显示文本（从result中判断）
   */
  const getStatusText = (result: string) => {
    return result?.includes('执行失败') ? '执行失败' : '执行成功'
  }

  /**
   * 获取状态颜色（从result中判断）
   */
  const getStatusColor = (result: string) => {
    return result?.includes('执行失败') ? 'error.main' : 'success.main'
  }

  const columnHelper = createColumnHelper<JobLogData>()

  /**
   * 日志表格列定义
   */
  const logColumns: ColumnDef<JobLogData, any>[] = [
    columnHelper.accessor('id', {
      header: '日志ID',
      cell: ({ row }) => (
        <Typography variant='body2' color='text.primary'>
          {row.original.id}
        </Typography>
      )
    }),
    columnHelper.accessor('targetName', {
      header: '执行方法',
      cell: ({ row }) => (
        <Typography variant='body2' color='text.primary'>
          {row.original.targetName}
        </Typography>
      )
    }),
    columnHelper.accessor('createdAt', {
      header: '执行日期',
      cell: ({ row }) => (
        <Typography variant='body2' color='text.primary'>
          {row.original.createdAt ? formatDate(row.original.createdAt, 'yyyy-MM-dd HH:mm:ss') : '-'}
        </Typography>
      )
    }),
    columnHelper.accessor('result', {
      header: '执行结果',
      cell: ({ row }) => {
        const result = row.original.result || ''
        return (
          <Box>
            <Typography variant='body2' color={getStatusColor(result)}>
              {getStatusText(result)}
            </Typography>
            {result && (
              <Typography variant='caption' color='text.secondary' className='block mt-1'>
                {result}
              </Typography>
            )}
          </Box>
        )
      }
    })
  ]

  if (!jobData) return null

  return (
    <Dialog fullWidth maxWidth='lg' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        定时任务详情
        <IconButton size='small' onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 6 }}>
        <Box className='flex flex-col gap-8'>
          {/* 任务详情 */}
          <Box>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box className='flex flex-col gap-6'>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      任务ID
                    </Typography>
                    <Typography variant='h6' className='font-semibold'>
                      {jobData.jobId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      参数
                    </Typography>
                    <Typography variant='body1' className='text-base'>
                      {jobData.jobMessage || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      任务方法
                    </Typography>
                    <Typography variant='body1' className='text-base '>
                      {jobData.invokeTarget}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      计划执行策略
                    </Typography>
                    <Typography variant='body1' className='text-base'>
                      {jobData.misfirePolicy === 1 ? '重复执行' : '执行一次'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      创建者
                    </Typography>
                    <Typography variant='body1' className='text-base'>
                      -
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      备注信息
                    </Typography>
                    <Typography variant='body1' className='text-base'>
                      {jobData.remark || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box className='flex flex-col gap-6'>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      任务名称
                    </Typography>
                    <Typography variant='h6' className='font-semibold'>
                      {jobData.jobName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      任务组名
                    </Typography>
                    <Typography variant='body1' className='text-base'>
                      {jobData.jobGroup}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      cron执行表达式
                    </Typography>
                    <Typography
                      variant='body1'
                      className='text-base font-mono bg-gray-50 px-3 py-2 rounded inline-block'
                    >
                      {jobData.cronExpression}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      状态
                    </Typography>
                    <Typography
                      variant='body1'
                      className='text-base font-semibold'
                      sx={{ color: jobData.status === 0 ? 'success.main' : 'warning.main' }}
                    >
                      {jobData.status === 0 ? '正常' : '暂停'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      更新者
                    </Typography>
                    <Typography variant='body1' className='text-base'>
                      -
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary' className='block mb-2 text-xs'>
                      创建时间
                    </Typography>
                    <Typography variant='body1' className='text-base'>
                      -
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* 任务执行日志 */}
          <Box>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h6'>任务执行日志</Typography>
              <Button variant='outlined' color='error' size='small' onClick={handleClearLog}>
                清空日志
              </Button>
            </Box>
            <TableComponent data={logData} columns={logColumns} loading={logLoading} total={logTotal} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  )
}

export default JobDetailDialog
