'use client'

// React Imports
import { useState, useMemo, useEffect, useRef } from 'react'

// Icon Imports
import { Eye, ArrowUp, ArrowDown } from 'lucide-react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import TableComponent, { TableInstance } from '@/components/table'

import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import TableFilters from './TableFilters'
import CopyButton from '@/components/options/CopyButton'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { formatDate } from 'date-fns/format'
import { useTranslate } from '@/contexts/DictionaryContext'

type WhitelistTableProps = {
  tableData: any[]
  total: number
  loading?: boolean
  requestgetFatAccounts: (params: any) => void
}

const WhitelistTable = ({ tableData, total, loading = false, requestgetFatAccounts }: WhitelistTableProps) => {
  const t = useTranslate()
  // States
  const [currentTab, setCurrentTab] = useState(0)
  const [columnVisibility, setColumnVisibility] = useState({})
  const tableRef = useRef<TableInstance | null>(null)
  const [searchParams, setSearchParams] = useState({ keyword: '', coinType: '' })
  // 根据当前标签页控制列的可见性
  useEffect(() => {
    const newVisibility: Record<string, boolean> = {}
    if (currentTab === 0) {
      // 待审核状态时隐藏审核信息列
      newVisibility.reviewedBy = false
      newVisibility.rejectionReason = false
    } else if (currentTab === 1) {
      // 已通过状态时显示审核信息，隐藏拒绝原因
      newVisibility.reviewedBy = true
      newVisibility.rejectionReason = false
    } else {
      // 已拒绝状态时显示所有列
      newVisibility.reviewedBy = true
      newVisibility.rejectionReason = true
    }
    setColumnVisibility(newVisibility)
  }, [currentTab])

  // Column Definitions
  const columnHelper = createColumnHelper<any>()

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    const baseColumns = [
      columnHelper.accessor('id', {
        header: t('kycWhitelists.whitelistId'), // 白名单ID
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('userName', {
        header: t('kycWhitelists.customerInfo'), // 客户信息
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original.memberNickName)}
            </CustomAvatar>
            <div className='flex flex-col gap-1'>
              <Typography className='font-medium' color='text.primary' variant='body1'>
                {row.original.memberNickName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ID: {row.original.userId}
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
      columnHelper.accessor('addressType', {
        header: t('kycWhitelists.addressType'), // 地址类型
        cell: ({ row }) => <Chip label={row.original.coinName} size='small' variant='outlined' />
      }),
      columnHelper.accessor('address', {
        header: t('kycWhitelists.address'), // 地址
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant='body2'
              sx={{
                fontFamily: 'monospace',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {row.original.walletAddress}
            </Typography>
            <CopyButton text={row.original.walletAddress} size='small' sx={{ p: 0.5 }} />
          </Box>
        )
      }),
      columnHelper.accessor('statusLabel', {
        header: t('kycWhitelists.status'), // 状态
        cell: ({ row }) => (
          <Chip label={row.original.statusLabel} size='small' color={row.original.status ? 'success' : 'error'} />
        )
      }),
      columnHelper.accessor('label', {
        header: t('kycWhitelists.label'), // 标签
        cell: ({ row }) => <Typography variant='body1'>{row.original.remark}</Typography>
      }),
      columnHelper.accessor('network', {
        header: t('kycWhitelists.network'), // 网络
        cell: ({ row }) => <Chip label={row.original.blockChain} size='small' />
      }),
      columnHelper.accessor('submittedDate', {
        header: t('kycWhitelists.submittedDate'), // 提交时间
        cell: ({ row }) => (
          <Typography variant='body1'>{formatDate(row.original.createdAt, 'yyyy-MM-dd hh:mm')}</Typography>
        )
      }),
      columnHelper.accessor('reviewedBy', {
        header: t('kycWhitelists.reviewInfo'), // 审核信息
        cell: ({ row }) => (
          <Box>
            <Typography variant='body1'>{row.original.reviewUserName || '-'}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {(!!row.original.reviewTime && formatDate(row.original.reviewTime, 'yyyy-MM-dd hh:mm')) || '-'}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('rejectionReason', {
        header: t('kycWhitelists.rejectionReason'), // 拒绝原因
        cell: ({ row }) => (
          <Typography variant='body1' color='error'>
            {row.original.reviewRemark || '-'}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'action',
        header: t('kycWhitelists.action'), // 操作
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <RouterLinkSkip href={`/kyc/whitelists/${row.original.id}`} className='flex'>
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
                {t('kycWhitelists.viewDetails')} {/* 查看详情 */}
              </Button>
            </RouterLinkSkip>
          </div>
        ),
        enableSorting: false,
        meta: {
          style: { width: '140px', minWidth: '140px', maxWidth: '140px' }
        }
      })
    ]

    return baseColumns
  }, [t])

  const pageChange = (data: any) => {
    requestgetFatAccounts({
      ...data,
      ...searchParams,
      status: currentTab
    })
  }
  return (
    <>
      <Card>
        <CardHeader title={t('kycWhitelists.title')} subheader={t('kycWhitelists.subtitle')} />{' '}
        {/* 数字资产地址审核 审核客户提交的数字资产转账地址 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => {
              setCurrentTab(newValue)
              tableRef?.current?.resetPage?.()
              requestgetFatAccounts({
                status: newValue,
                pageNum: 1,
                pageSize: tableRef?.current?.getState()?.pagination?.pageSize,
                ...searchParams
              })
            }}
          >
            <Tab label={t('kycWhitelists.pending')} /> {/* 待审核 */}
            <Tab label={t('kycWhitelists.approved')} /> {/* 已通过 */}
            <Tab label={t('kycWhitelists.rejected')} /> {/* 已拒绝 */}
          </Tabs>
        </Box>
        <Box sx={{ p: 3, pt: 0, px: 2 }}>
          <TableFilters
            params={searchParams}
            onSearchChange={(data: any) => {
              tableRef?.current?.resetPageIndex()
              setSearchParams(data)
              requestgetFatAccounts({
                ...data,
                status: currentTab,
                pageNum: 1,
                pageSize: tableRef?.current?.getState()?.pagination?.pageSize
              })
            }}
          />
          <Box sx={{ p: 4, pt: 0 }}>
            <TableComponent
              data={tableData}
              columns={columns}
              total={total}
              loading={loading}
              pageChange={pageChange}
              tableRef={tableRef}
              tableProps={{
                state: { columnVisibility },
                onColumnVisibilityChange: setColumnVisibility
              }}
            />
          </Box>
        </Box>
      </Card>
    </>
  )
}

export default WhitelistTable
