'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import CustomAvatar from '@core/components/mui/Avatar'
import TableComponent, { TableInstance } from '@/components/table'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
import TableFilters from './tableFilters'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { getPendingTableData } from '@server/kycDashboard'
// Icon Imports
import { FileText, Download, Eye, Play } from 'lucide-react'
import { getInitials } from '@/utils/getInitials'
import { formatDate } from 'date-fns/format'
import { useTranslate } from '@/contexts/DictionaryContext'

export default function PendingTablePage() {
  const t = useTranslate()
  const pendingColumnHelper = createColumnHelper<any>()
  const tableRef = useRef<TableInstance | null>(null)
  const [searchParams, setSearchParams] = useState({ keyword: '' })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  useEffect(() => {
    requestgetPendingTableData({ pageNum: 1, pageSize: 10 })
  }, [])
  const requestgetPendingTableData = async (params: any) => {
    setLoading(true)
    try {
      const res = await getPendingTableData(params)
      setData(res.data?.list ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#1976d2', bg: '#e3f2fd', label: t('kycDashboard.pending') } // 待审核
      case 'in_review':
        return { color: '#f57c00', bg: '#fff3e0', label: t('kycDashboard.reviewing') } // 审核中
      default:
        return { color: '#666', bg: '#f5f5f5' }
    }
  }
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      pendingColumnHelper.accessor('client', {
        header: t('kycDashboard.customerInfo'), // 客户信息
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original.nick_name)}
            </CustomAvatar>
            <div className='flex flex-col gap-1'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.nick_name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ID: {row.original.user_id}
              </Typography>
              {row.original.email && (
                <Typography variant='body2' color='text.secondary' className='truncate max-w-[200px]'>
                  {row.original.email}
                </Typography>
              )}
            </div>
          </div>
        )
      }),
      pendingColumnHelper.accessor('reviewType', {
        header: t('kycDashboard.applicationType'), // 审核类型
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-textSecondary' />
            <Typography>{t('kycDashboard.personalAccountReview')}</Typography> {/* 个人开户审核 */}
            {/* <Typography>{row.original.reviewType}</Typography> */}
          </div>
        )
      }),
      pendingColumnHelper.accessor('dueDate', {
        header: t('kycDashboard.submitDate'), // 提交日期
        cell: ({ row }) => {
          return (
            <div>
              <Typography variant='body1'>
                {!!Number(row.original.created_at)
                  ? formatDate(Number(row.original.created_at), 'yyyy-MM-dd hh:mm')
                  : '-'}
              </Typography>
            </div>
          )
        }
      }),
      pendingColumnHelper.accessor('status', {
        header: t('kycDashboard.status'), // 状态
        cell: ({ row }) => {
          const obj = getStatusColor(row.original.current_status)
          return (
            <Chip
              variant='tonal'
              label={obj?.label}
              size='small'
              sx={{
                backgroundColor: obj?.bg,
                color: obj?.color,
                fontWeight: 500
              }}
            />
          )
        }
      }),
      pendingColumnHelper.accessor('action', {
        header: t('kycDashboard.action'), // 操作
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <RouterLinkSkip
              href={`/kyc/processingReviews/${row.original.user_id}?reviewId=${row.original.id}&type=1`}
              className='flex'
            >
              <Button
                variant='outlined'
                size='small'
                component='span'
                startIcon={<Eye size={16} />}
                sx={{
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5
                }}
              >
                {t('kycDashboard.viewDetails')} {/* 查看详情 */}
              </Button>
            </RouterLinkSkip>
            <RouterLinkSkip
              href={`/kyc/processingReviews/${row.original.user_id}/process?reviewId=${row.original.id}&type=1`}
              className='flex'
            >
              <Button
                variant='outlined'
                size='small'
                component='span'
                startIcon={<Play size={16} />}
                sx={{
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5
                }}
              >
                {t('kycDashboard.startProcessing')} {/* 开始处理 */}
              </Button>
            </RouterLinkSkip>
          </div>
        ),
        enableSorting: false,
        id: 'action',
        meta: {
          style: { width: '240px', minWidth: '240px', maxWidth: '240px' }
        }
      })
    ],
    [t]
  )
  const pageChange = (data: any) => {
    requestgetPendingTableData({
      ...data,
      ...searchParams
    })
  }
  return (
    <Box sx={{ p: 3, pt: 0 }}>
      <TableFilters
        params={searchParams}
        onSearchChange={(data: any) => {
          tableRef?.current?.resetPage?.()
          setSearchParams(data)
          requestgetPendingTableData({
            ...data,
            pageNum: 1,
            pageSize: tableRef?.current?.getState()?.pagination?.pageSize
          })
        }}
      />
      <Divider sx={{ px: 2 }} />
      <div className='flex justify-between p-4 px-2 gap-4 flex-col items-start sm:flex-row sm:items-center'>
        <Button
          color='primary'
          variant='contained'
          startIcon={<Download className='w-5 h-5' />}
          className='max-sm:is-full'
        >
          {t('kycDashboard.exportCSV')} {/* 导出 CSV */}
        </Button>
      </div>
      <Box sx={{ p: 4, pt: 0, px: 2 }}>
        <TableComponent
          data={data}
          columns={columns}
          total={total}
          loading={loading}
          pageChange={pageChange}
          tableRef={tableRef}
        />
      </Box>
    </Box>
  )
}
