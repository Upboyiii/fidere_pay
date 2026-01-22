'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Icon Imports
import { Play, Download, FileText, Eye } from 'lucide-react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid2'

import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'

import Box from '@mui/material/Box'

import CustomAvatar from '@core/components/mui/Avatar'

import TableFilters from './tableFilters'
// Util Imports
import { getInitials } from '@/utils/getInitials'
import TabCard from './tabCard'
// Style Imports
import { getProcessingList } from '@server/processingReviews'
import TableComponent, { TableInstance } from '@/components/table'
import { useTranslate } from '@/contexts/DictionaryContext'
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}
import { formatDate } from 'date-fns/format'
// Column Definitions
const columnHelper = createColumnHelper<any>()

export default function ProcessingReviewsPage() {
  const t = useTranslate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useState({ keyword: '', status: '' })
  const tableRef = useRef<TableInstance | null>(null)
  useEffect(() => {
    requestgetPendingTableData({ pageNum: 1, pageSize: 10 })
  }, [])

  const requestgetPendingTableData = async (params: any) => {
    setLoading(true)
    try {
      const res = await getProcessingList(params)
      setData(res.data?.list ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  // Hooks
  const { lang: locale } = useParams()
  /**
   * 获取审核状态对应的颜色配置
   * @param status 状态值
   * @returns 返回包含文字颜色和背景色的对象
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#f57c00', bg: '#fff3e0' }
      case 'in_review':
        return { color: '#1976d2', bg: '#e3f2fd' }
      case 'approved':
        return { color: '#388e3c', bg: '#e8f5e9' }
      case 'rejected':
        return { color: '#d32f2f', bg: '#ffebee' }
      default:
        return { color: '#616161', bg: '#f5f5f5' }
    }
  }

  // 处理搜索变化
  const handleSearchChange = (data: any) => {
    setSearchParams(data)
    tableRef?.current?.resetPage?.()
    requestgetPendingTableData({
      ...data,
      pageNum: 1,
      pageSize: tableRef?.current?.getState().pagination.pageSize
    })
  }

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('client', {
        header: t('processingReviews.customerInfo'), // 客户信息
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original?.nick_name)}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original?.nick_name}
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
      columnHelper.accessor('reviewType', {
        header: t('processingReviews.reviewType'), // 审核类型
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-textSecondary' />
            <Typography>{t('processingReviews.personalAccountReview')}</Typography> {/* 个人开户审核 */}
          </div>
        )
      }),

      columnHelper.accessor('currentStep', {
        header: t('processingReviews.currentStep'), // 当前步骤
        cell: ({ row }) => (
          <div className='flex flex-col gap-3'>
            <Typography className='font-medium' color='text.primary' variant='body1'>
              {row.original.stage_label}
            </Typography>
            <Chip
              variant='tonal'
              label={row.original?.current_statusLabel}
              size='small'
              sx={{
                backgroundColor: getStatusColor(row.original.current_status).bg,
                color: getStatusColor(row.original.current_status).color,
                fontWeight: 500,
                width: 'fit-content',
                minWidth: 'auto'
              }}
            />
          </div>
        )
      }),
      columnHelper.accessor('created_at', {
        header: t('processingReviews.reviewTime'), // 审核时间
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography>
              {!!Number(row.original.created_at) ? formatDate(Number(row.original.created_at), 'yyyy-MM-dd hh:mm') : ''}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('progress', {
        header: t('processingReviews.progress'), // 进度
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <div className='w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className={`h-full transition-all duration-300 ${
                  row.original.progress_rate >= 80
                    ? 'bg-green-500'
                    : row.original.progress_rate >= 50
                      ? 'bg-blue-500'
                      : 'bg-orange-500'
                }`}
                style={{ width: `${row.original.progress_rate}%` }}
              />
            </div>
            <Typography className='font-medium min-w-[35px]'>{row.original.progress_rate || 0}%</Typography>
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: t('processingReviews.action'), // 操作
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
                {t('processingReviews.viewDetails')} {/* 查看详情 */}
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
                {t('processingReviews.startProcessing')} {/* 开始处理 */}
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
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <TabCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader sx={{ pb: 0 }} title={t('processingReviews.title')} subheader={t('processingReviews.subtitle')} />{' '}
          {/* 处理中审核 管理和跟踪正在处理中的客户审核任务 */}
          <Box sx={{ p: 4, pt: 0 }}>
            <TableFilters onSearchChange={handleSearchChange} params={searchParams} />
            <Divider sx={{ px: 2 }} />
            <div className='flex justify-between pb-4 pt-4 px-1 gap-4 flex-col items-start sm:flex-row sm:items-center'>
              <Button
                color='primary'
                variant='contained'
                startIcon={<Download className='w-5 h-5' />}
                className='max-sm:is-full'
              >
                {t('processingReviews.exportCSV')} {/* 导出 CSV */}
              </Button>
            </div>
            <Box>
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
        </Card>
      </Grid>
    </Grid>
  )
}
