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
import AttachmentTable, { type AttachmentData } from './components/AttachmentTable'
import UploadDialog from './components/UploadDialog'
import { TableInstance } from '@/components/table'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// API Imports
import {
  getSysAttachmentList,
  deleteSysAttachmentApi,
  updateSysAttachmentStatus,
  uploadSysAttachment
} from '@server/admin'

// Utils Imports
import { cleanRequestParams, SEARCH_PARAMS_DEFAULT } from './utils'

/**
 * 文件管理页面
 */
export default function SysAttachment() {
  const t = useTranslate()
  // States
  const [searchParams, setSearchParams] = useState(SEARCH_PARAMS_DEFAULT)
  const [attachmentData, setAttachmentData] = useState<AttachmentData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAttachment, setDeleteAttachment] = useState<AttachmentData | null>(null)
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)

  /**
   * 获取当前分页大小
   */
  const getPageSize = useCallback(() => {
    return tableRef?.current?.getState()?.pagination?.pageSize || 10
  }, [])

  /**
   * 加载文件数据
   */
  const loadAttachmentData = useCallback(
    async (params = {}) => {
      setLoading(true)
      setAttachmentData([])
      try {
        // 构建请求参数
        const requestParams = {
          ...searchParams,
          ...params
        }

        // 清理空值
        const cleanedParams = cleanRequestParams(requestParams)

        const res = await getSysAttachmentList(cleanedParams)

        // 处理返回数据
        const list = res.data?.list || res.data?.rows || res.data || []
        const total = res.data?.total || list.length

        setAttachmentData(list as AttachmentData[])
        setTotal(total)
      } catch (error) {
        console.error('加载文件数据失败:', error)
        toast.error(t('admin.loadAttachmentDataFailed'))
      } finally {
        setLoading(false)
      }
    },
    [searchParams, t]
  )

  /**
   * 搜索变化
   */
  const handleSearchChange = useCallback(
    (params: typeof searchParams) => {
      setSearchParams(params)
      tableRef?.current?.resetPage?.()
      loadAttachmentData({ pageNum: 1, pageSize: getPageSize(), ...params })
    },
    [loadAttachmentData, getPageSize]
  )

  /**
   * 重置搜索
   */
  const handleReset = useCallback(() => {
    setSearchParams(SEARCH_PARAMS_DEFAULT)
    tableRef?.current?.resetPage?.()
    loadAttachmentData({ pageNum: 1, pageSize: getPageSize(), ...SEARCH_PARAMS_DEFAULT })
  }, [loadAttachmentData, getPageSize])

  /**
   * 打开上传对话框
   */
  const handleOpenUpload = useCallback(() => {
    setUploadDialogOpen(true)
  }, [])

  /**
   * 上传成功
   */
  const handleUploadSuccess = useCallback(() => {
    loadAttachmentData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
    toast.success(t('admin.uploadSuccess'))
  }, [loadAttachmentData, getPageSize, searchParams, t])

  /**
   * 下载文件
   */
  const handleDownload = useCallback(
    (attachment: AttachmentData) => {
      // TODO: 实现文件下载逻辑
      console.log('下载文件:', attachment)
      toast.info(t('admin.downloadFeaturePending'))
    },
    [t]
  )

  /**
   * 删除文件
   */
  const handleDelete = useCallback((attachment: AttachmentData) => {
    setDeleteAttachment(attachment)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除文件
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteAttachment) return

    try {
      setBtnLoading(true)
      await deleteSysAttachmentApi({ ids: [deleteAttachment.id] })
      setDeleteDialogOpen(false)
      setDeleteAttachment(null)
      toast.success(t('admin.deleteSuccess'))
      loadAttachmentData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }, [deleteAttachment, loadAttachmentData, searchParams, getPageSize, t])

  /**
   * 状态变化
   */
  const handleStatusChange = useCallback(
    async (attachment: AttachmentData, status: boolean) => {
      try {
        await updateSysAttachmentStatus({ id: attachment.id, status })
        toast.success(t('admin.operationSuccess'))
        loadAttachmentData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
      } catch (error: any) {
        console.error(error)
        toast.error(error?.message || t('admin.operationFailed'))
        // 恢复状态
        loadAttachmentData({ pageNum: 1, pageSize: getPageSize(), ...searchParams })
      }
    },
    [loadAttachmentData, getPageSize, searchParams, t]
  )

  /**
   * 分页变化
   */
  const handlePageChange = useCallback(
    (params: { pageNum: number; pageSize: number }) => {
      loadAttachmentData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
    },
    [loadAttachmentData, searchParams]
  )

  // 初始化加载数据
  useEffect(() => {
    loadAttachmentData({ pageNum: 1, pageSize: 10 })
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
            onUpload={handleOpenUpload}
          />
          <Box sx={{ p: 4, pt: 0 }}>
            <Divider sx={{ px: 2 }} />
            <Box sx={{ pt: 4 }}>
              {/* 文件表格 */}
              <AttachmentTable
                data={attachmentData}
                loading={loading}
                total={total}
                onPageChange={handlePageChange}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                tableRef={tableRef}
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* 上传文件对话框 */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.confirmDeleteAttachment')}</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteAttachment &&
              `${t('admin.confirmDeleteAttachmentMessagePrefix')} "${deleteAttachment.name}" ${t('admin.confirmDeleteAttachmentMessageSuffix')}`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('admin.cancel')}</Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error' disabled={btnLoading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
