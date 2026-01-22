'use client'

// React Imports
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

import TableComponent, { TableInstance } from '@/components/table'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
import TableFilters from './tableFilters'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { getRejectedTableData, resetReview } from '@server/kycDashboard'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { formatDate } from 'date-fns/format'
import { toast } from 'react-toastify'
import { getLocalizedUrl } from '@/utils/i18n'
import { useTranslate } from '@/contexts/DictionaryContext'
// Icon Imports
import { Eye, RefreshCw, FileText, Download, Headphones, Loader2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
export default function PendingTablePage() {
  const t = useTranslate()
  const router = useRouter()
  const { lang: locale } = useParams()
  const rejectedColumnHelper = createColumnHelper<any>()
  const tableRef = useRef<TableInstance | null>(null)
  const [searchParams, setSearchParams] = useState({ keyword: '', coinType: '' })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  // 跟踪每个审核项的 loading 状态
  const [resetLoadingMap, setResetLoadingMap] = useState<Record<string, boolean>>({})
  useEffect(() => {
    requestgetPendingTableData({ pageNum: 1, pageSize: 10 })
  }, [])
  const requestgetPendingTableData = async (params: any) => {
    setLoading(true)
    try {
      const res = await getRejectedTableData(params)
      setData(res.data?.list ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }
  // 重置
  const resetReviewClick = useCallback(
    async (reviewId: string, userId: string) => {
      // 设置当前项的 loading 状态
      setResetLoadingMap(prev => ({ ...prev, [reviewId]: true }))
      try {
        const res = await resetReview({ review_id: reviewId, userId: userId })
        toast.success(res?.data?.message || t('kycDashboard.resetSuccess')) // 重置成功
        router.push(
          getLocalizedUrl(`/kyc/processingReviews/${userId}/process?reviewId=${reviewId}&type=1`, locale as string)
        )
      } catch (error) {
        toast.error((error as any)?.message)
        // 错误时清除 loading 状态
        setResetLoadingMap(prev => ({ ...prev, [reviewId]: false }))
      }
    },
    [router, locale, t]
  )

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      rejectedColumnHelper.accessor('name', {
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
      rejectedColumnHelper.accessor('type', {
        header: t('kycDashboard.applicationType'), // 申请类型
        cell: ({ row }) => <Chip label={t('kycDashboard.individual')} size='small' variant='outlined' /> // 个人
      }),
      rejectedColumnHelper.accessor('rejectReason', {
        header: t('kycDashboard.rejectReason'), // 拒绝原因
        cell: ({ row }) => (
          <Chip label={row.original.reject_reason_summary} size='small' color='error' variant='outlined' />
        )
      }),
      rejectedColumnHelper.accessor('completedTime', {
        header: t('kycDashboard.rejectTime'), // 拒绝时间
        cell: ({ row }) => (
          <div>
            <Typography className='mb-1'>
              {Number(row.original?.updated_at)
                ? formatDate(Number(row.original?.updated_at), 'yyyy-MM-dd hh:mm')
                : '-'}
            </Typography>
            {/* <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
              处理时长: {row.original.processingTime}
            </Typography> */}
          </div>
        )
      }),
      rejectedColumnHelper.accessor('reviewer', {
        header: t('kycDashboard.reviewer'), // 审核员
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original?.user_nickname)}
            </CustomAvatar>
            <Typography variant='body2'>{row.original?.user_nickname}</Typography>
          </div>
        )
      }),
      rejectedColumnHelper.accessor('action', {
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
            <Button
              variant='outlined'
              size='small'
              onClick={() => resetReviewClick(row.original.id, row?.original?.user_id)}
              disabled={resetLoadingMap[row.original.id]}
              startIcon={
                resetLoadingMap[row.original.id] ? (
                  <Loader2 size={16} className='animate-spin' />
                ) : (
                  <RefreshCw size={16} />
                )
              }
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                px: 1.5
              }}
            >
              {t('kycDashboard.reReview')} {/* 重新审核 */}
            </Button>
          </div>
        ),
        enableSorting: false,
        id: 'action',
        meta: {
          style: { width: '240px', minWidth: '240px', maxWidth: '240px' }
        }
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetLoadingMap, resetReviewClick, t]
  )
  const pageChange = () => {}
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
      <Divider />
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
