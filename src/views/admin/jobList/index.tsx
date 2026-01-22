'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

// Component Imports
import SearchFilters from './components/SearchFilters'
import JobTable, { type JobData } from './components/JobTable'
import JobDialog from './components/JobDialog'
import JobDetailDialog from './components/JobDetailDialog'
import { TableInstance } from '@/components/table'
import { toast } from 'react-toastify'

// API Imports
import {
  getSysJobList,
  addSysJobApi,
  editSysJobApi,
  deleteSysJobApi,
  startSysJob,
  stopSysJob,
  executeSysJobOnce
} from '@server/admin'

// Utils Imports
import { cleanRequestParams, SEARCH_PARAMS_DEFAULT } from './utils'

/**
 * 任务管理页面
 */
export default function JobList() {
  // States
  const [searchParams, setSearchParams] = useState(SEARCH_PARAMS_DEFAULT)
  const [jobData, setJobData] = useState<JobData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<number | null>(null)
  const [viewingJob, setViewingJob] = useState<JobData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteJob, setDeleteJob] = useState<JobData | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)

  /**
   * 获取当前分页大小
   */
  const getPageSize = useCallback(() => {
    return tableRef?.current?.getState()?.pagination?.pageSize || 10
  }, [])

  /**
   * 加载任务数据
   */
  const loadJobData = useCallback(
    async (params = {}) => {
      setLoading(true)
      setJobData([])
      try {
        // 构建请求参数
        const requestParams = {
          ...searchParams,
          ...params
        }

        // 清理空值
        const cleanedParams = cleanRequestParams(requestParams)

        const res = await getSysJobList(cleanedParams)

        // 处理返回数据
        const list = res.data?.list || res.data?.rows || res.data || []
        const total = res.data?.total || list.length

        setJobData(list as JobData[])
        setTotal(total)
      } catch (error) {
        toast.error('加载数据失败')
      } finally {
        setLoading(false)
      }
    },
    [searchParams]
  )

  /**
   * 搜索变化
   */
  const handleSearchChange = useCallback(
    (params: typeof searchParams) => {
      setSearchParams(params)
      tableRef?.current?.resetPage?.()
      loadJobData({ pageNum: 1, pageSize: getPageSize(), ...params })
    },
    [loadJobData, getPageSize]
  )

  /**
   * 重置搜索
   */
  const handleReset = useCallback(() => {
    setSearchParams(SEARCH_PARAMS_DEFAULT)
    tableRef?.current?.resetPage?.()
    loadJobData({ pageNum: 1, pageSize: getPageSize(), ...SEARCH_PARAMS_DEFAULT })
  }, [loadJobData, getPageSize])

  /**
   * 新增任务
   */
  const handleAddJob = useCallback(() => {
    setEditingJob(null)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑任务
   */
  const handleEditJob = useCallback((job: JobData) => {
    setEditingJob(job.jobId)
    setDialogOpen(true)
  }, [])

  /**
   * 查看详情
   */
  const handleViewDetail = useCallback((job: JobData) => {
    setViewingJob(job)
    setDetailDialogOpen(true)
  }, [])

  /**
   * 执行一次
   */
  const handleExecuteOnce = useCallback(async (job: JobData) => {
    try {
      await executeSysJobOnce({ jobId: job.jobId })
      toast.success('执行成功')
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || '执行失败')
    }
  }, [])

  /**
   * 删除任务
   */
  const handleDeleteJob = useCallback((job: JobData) => {
    setDeleteJob(job)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除任务
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteJob) return

    try {
      setBtnLoading(true)
      await deleteSysJobApi({ jobIds: [deleteJob.jobId] })
      setDeleteDialogOpen(false)
      setDeleteJob(null)
      toast.success('删除成功')
      loadJobData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || '删除失败')
    } finally {
      setBtnLoading(false)
    }
  }, [deleteJob, loadJobData, searchParams, getPageSize])

  /**
   * 状态变化
   */
  const handleStatusChange = useCallback(
    async (job: JobData, status: number) => {
      try {
        // 根据目标状态调用不同的接口
        // 0=启用，1=禁用
        if (status === 0) {
          // 启用任务
          await startSysJob({ jobId: job.jobId })
        } else {
          // 禁用任务
          await stopSysJob({ jobId: job.jobId })
        }
        toast.success('操作成功')
        loadJobData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
      } catch (error: any) {
        console.error(error)
        toast.error(error?.message || '操作失败')
        // 恢复状态
        loadJobData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
      }
    },
    [loadJobData, getPageSize, searchParams]
  )

  /**
   * 保存任务
   */
  const handleSaveJob = useCallback(
    async (data: Partial<JobData>) => {
      try {
        if (data.jobId) {
          await editSysJobApi(data)
        } else {
          await addSysJobApi(data)
        }

        setDialogOpen(false)
        setEditingJob(null)
        toast.success('操作成功')
        loadJobData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
      } catch (error: any) {
        toast.error(error?.message || '操作失败')
      }
    },
    [loadJobData, searchParams, getPageSize]
  )

  /**
   * 分页变化
   */
  const handlePageChange = useCallback(
    (params: { pageNum: number; pageSize: number }) => {
      loadJobData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
    },
    [loadJobData, searchParams]
  )

  // 初始化加载数据
  useEffect(() => {
    loadJobData({ pageNum: 1, pageSize: 10 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          {/* 搜索筛选栏 */}
          <SearchFilters
            params={searchParams}
            onSearchChange={handleSearchChange}
            onReset={handleReset}
            onAdd={handleAddJob}
          />
          <Box sx={{ p: 4, pt: 0 }}>
            <Divider sx={{ px: 2 }} />
            <Box sx={{ pt: 4 }}>
              {/* 任务表格 */}
              <JobTable
                data={jobData}
                loading={loading}
                total={total}
                onPageChange={handlePageChange}
                onViewDetail={handleViewDetail}
                onEdit={handleEditJob}
                onExecute={handleExecuteOnce}
                onDelete={handleDeleteJob}
                onStatusChange={handleStatusChange}
                tableRef={tableRef}
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* 任务编辑/新增对话框 */}
      <JobDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingJob(null)
        }}
        onSave={handleSaveJob}
        jobId={editingJob}
      />

      {/* 任务详情对话框 */}
      <JobDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false)
          setViewingJob(null)
        }}
        jobData={viewingJob}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>{deleteJob && `确定要删除任务 "${deleteJob.jobName}" 吗？此操作不可恢复。`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error' disabled={btnLoading}>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
