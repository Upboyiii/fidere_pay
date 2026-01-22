'use client'

// React Imports
import { useMemo, useState } from 'react'

// Icon Imports
import { Eye, Trash2 } from 'lucide-react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Tooltip from '@mui/material/Tooltip'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Component Imports
import TableFilters from './TableFilters'
import TableComponent, { TableInstance } from '@components/table'
import AuditLogDetailDialog from './AuditLogDetailDialog'
import { useTranslate } from '@/contexts/DictionaryContext'
import { deleteAuditLog } from '@server/auditLogs'
import { toast } from 'react-toastify'

// Column Definitions
const columnHelper = createColumnHelper<any>()

type AuditLogTableProps = {
  tableData: any[]
  total: number
  loading: boolean
  searchParams: any
  onSearchChange: (data: any) => void
  tableRef: React.MutableRefObject<TableInstance | null>
  requestgetAuditLogsList: (params: any) => void
  pageChange: (data: any) => void
}

/**
 * 审计日志表格组件
 */
const AuditLogTable = ({
  tableData,
  total,
  loading,
  searchParams,
  onSearchChange,
  tableRef,
  requestgetAuditLogsList,
  pageChange
}: AuditLogTableProps) => {
  const t = useTranslate()
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedOperId, setSelectedOperId] = useState<string | number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteOperId, setDeleteOperId] = useState<string | number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  /**
   * 查看详情
   */
  const handleViewDetails = (operId: string | number) => {
    setSelectedOperId(operId)
    setDetailDialogOpen(true)
  }

  /**
   * 打开删除确认对话框
   */
  const handleDelete = (operId: string | number) => {
    setDeleteOperId(operId)
    setDeleteDialogOpen(true)
  }

  /**
   * 确认删除
   */
  const handleConfirmDelete = async () => {
    if (!deleteOperId) return
    setDeleteLoading(true)
    try {
      await deleteAuditLog({ operId: deleteOperId })
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setDeleteOperId(null)
      // 重新加载数据
      const currentPage = tableRef?.current?.getState()?.pagination?.pageIndex ?? 0
      const currentPageSize = tableRef?.current?.getState()?.pagination?.pageSize ?? 10
      requestgetAuditLogsList({
        ...searchParams,
        pageNum: currentPage + 1,
        pageSize: currentPageSize
      })
    } catch (error) {
      console.error(error)
      toast.error('删除失败')
    } finally {
      setDeleteLoading(false)
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

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('operId', {
        header: t('auditLogs.logId'), // 日志编号
        cell: ({ row }) => (
          <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'text.primary' }}>
            {row.original.operId}
          </Typography>
        )
      }),
      columnHelper.accessor('title', {
        header: t('auditLogs.systemModule'), // 系统模块
        cell: ({ row }) => (
          <Typography variant='body2' sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
            {row.original.title || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('requestMethod', {
        header: t('auditLogs.requestMethod'), // 请求方式
        cell: ({ row }) => (
          <Typography variant='body2' sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
            {getRequestMethodLabel(row.original.requestMethod || '')}
          </Typography>
        )
      }),
      columnHelper.accessor('operName', {
        header: t('auditLogs.operator'), // 操作人员
        cell: ({ row }) => (
          <Typography variant='body2' sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}>
            {row.original.operName || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('deptName', {
        header: t('auditLogs.departmentName'), // 部门名称
        cell: ({ row }) => (
          <Typography variant='body2' sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
            {row.original.deptName || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('operUrl', {
        header: t('auditLogs.requestUrl'), // 请求URL
        cell: ({ row }) => {
          const url = row.original.operUrl || '-'
          return (
            <Tooltip title={url} placement='top' arrow>
              <Typography
                variant='body2'
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  fontFamily: 'monospace',
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {url}
              </Typography>
            </Tooltip>
          )
        }
      }),
      columnHelper.accessor('operIp', {
        header: t('auditLogs.hostAddress'), // 主机地址
        cell: ({ row }) => {
          const ip = row.original.operIp || '-'
          return (
            <Tooltip title={ip} placement='top' arrow>
              <Typography
                variant='body2'
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  fontFamily: 'monospace',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {ip}
              </Typography>
            </Tooltip>
          )
        }
      }),
      columnHelper.accessor('operLocation', {
        header: t('auditLogs.operationLocation'), // 操作地点
        cell: ({ row }) => (
          <Typography variant='body2' sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
            {row.original.operLocation || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('operTime', {
        header: t('auditLogs.operationTime'), // 操作时间
        cell: ({ row }) => (
          <Typography variant='body2' sx={{ fontSize: '0.875rem', color: 'text.primary', fontFamily: 'monospace' }}>
            {row.original.operTime || '-'}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'action',
        header: t('auditLogs.action'), // 操作
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Button
              variant='outlined'
              size='small'
              startIcon={<Eye size={16} />}
              onClick={() => handleViewDetails(row.original.operId)}
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                px: 1.5
              }}
            >
              {t('auditLogs.details')} {/* 详情 */}
            </Button>
            {/* <Button
              variant='outlined'
              size='small'
              color='error'
              startIcon={<Trash2 size={16} />}
              onClick={() => handleDelete(row.original.operId)}
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                px: 1.5
              }}
            >
              {t('auditLogs.delete')}
            </Button> */}
          </div>
        ),
        enableSorting: false,
        meta: {
          style: { width: '120px', minWidth: '120px', maxWidth: '120px' }
        }
      })
    ],
    [t]
  )

  return (
    <>
      <Card>
        <CardHeader title={t('auditLogs.title')} subheader={t('auditLogs.subtitle')} />
        <TableFilters onSearchChange={onSearchChange} params={searchParams} />
        <Box sx={{ p: 4, pt: 0 }}>
          <Divider sx={{ px: 2 }} />
          <Box sx={{ pt: 4 }}>
            <TableComponent
              data={tableData}
              columns={columns}
              loading={loading}
              total={total}
              tableRef={tableRef}
              pageChange={pageChange}
            />
          </Box>
        </Box>
      </Card>

      {/* 详情弹窗 */}
      <AuditLogDetailDialog open={detailDialogOpen} setOpen={setDetailDialogOpen} operId={selectedOperId} />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('auditLogs.delete')}</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这条日志吗？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error' disabled={deleteLoading}>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AuditLogTable
