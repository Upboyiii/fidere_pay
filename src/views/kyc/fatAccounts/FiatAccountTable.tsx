'use client'

// React Imports
import { useState, useMemo, useEffect, useRef } from 'react'

// Icon Imports
import { Eye, ArrowUp, ArrowDown } from 'lucide-react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'

import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import TableComponent, { TableInstance } from '@/components/table'

import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { formatDate } from 'date-fns/format'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import TableFilters from './TableFilters'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
// Util Imports
import { getInitials } from '@/utils/getInitials'
import { useTranslate } from '@/contexts/DictionaryContext'

type FiatAccountTableProps = {
  tableData: any[]
  stats: any
  total: number
  loading?: boolean
  requestgetFatAccounts: (params: any) => void
}

const FiatAccountTable = ({ tableData, total, loading = false, requestgetFatAccounts }: FiatAccountTableProps) => {
  const t = useTranslate()
  const [currentTab, setCurrentTab] = useState(0)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [searchParams, setSearchParams] = useState({ keyword: '' })
  const tabRef = useRef<TableInstance | null>(null)
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
        header: t('fatAccounts.accountId'), // 账户ID
        cell: ({ row }) => (
          <Typography className='font-medium' variant='body2' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('userName', {
        header: t('fatAccounts.customerInfo'), // 客户信息
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original?.memberNickName)}
            </CustomAvatar>
            <div className='flex flex-col gap-1'>
              <Typography className='font-medium' color='text.primary' variant='body1'>
                {row.original?.memberNickName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ID: {row.original?.userId}
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
      columnHelper.accessor('bankName', {
        header: t('fatAccounts.bankInstitution'), // 银行/机构
        cell: ({ row }) => <Typography variant='body1'>{row.original.bankName}</Typography>
      }),
      columnHelper.accessor('accountNumber', {
        header: t('fatAccounts.accountNumber'), // 账号
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <Typography variant='body1' sx={{ fontFamily: 'monospace' }}>
              {row.original.bankAccount}
            </Typography>
            {row.original.swiftCode && (
              <Typography variant='caption' color='text.secondary'>
                SWIFT: {row.original.swiftCode}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('accountHolder', {
        header: t('fatAccounts.accountHolder'), // 持有人
        cell: ({ row }) => <Typography variant='body1'>{row.original.accountHolder}</Typography>
      }),
      // columnHelper.accessor('riskLevel', {
      //   header: '风险等级',
      //   cell: ({ row }) => (
      //     <Chip
      //       label={getRiskText(row.original.riskLevel)}
      //       size='small'
      //       color={getRiskColor(row.original.riskLevel)}
      //       variant='outlined'
      //     />
      //   )
      // }),
      columnHelper.accessor('submittedDate', {
        header: t('fatAccounts.submittedDate'), // 提交时间
        cell: ({ row }) => (
          <Typography variant='body1'>{formatDate(row.original.createdAt, 'yyyy-MM-dd hh:mm')}</Typography>
        )
      }),
      columnHelper.accessor('reviewedBy', {
        header: t('fatAccounts.reviewInfo'), // 审核信息
        cell: ({ row }) => (
          <Box>
            <Typography variant='body1'>{row.original.reviewUserName || ''}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {(!!row.original.reviewTime && formatDate(row.original.reviewTime, 'yyyy-MM-dd hh:mm')) || ''}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('rejectionReason', {
        header: t('fatAccounts.rejectionReason'), // 拒绝原因
        cell: ({ row }) => (
          <Typography variant='body1' color='error'>
            {row.original.reviewRemark || '-'}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'action',
        header: t('fatAccounts.action'), // 操作
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <RouterLinkSkip href={`/kyc/fatAccounts/${row.original.id}`} className='flex'>
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
                {t('fatAccounts.viewDetails')} {/* 查看详情 */}
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
  }, [])

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
        <CardHeader title={t('fatAccounts.title')} subheader={t('fatAccounts.subtitle')} />{' '}
        {/* 法币账户审核 审核客户提交的法币转账账户信息 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => {
              setCurrentTab(newValue)
              tabRef?.current?.resetPage?.()
              requestgetFatAccounts({
                status: newValue,
                pageNum: 1,
                pageSize: tabRef?.current?.getState()?.pagination?.pageSize,
                ...searchParams
              })
            }}
          >
            <Tab label={t('fatAccounts.pending')} /> {/* 待审核 */}
            <Tab label={t('fatAccounts.approved')} /> {/* 已通过 */}
            <Tab label={t('fatAccounts.rejected')} /> {/* 已拒绝 */}
          </Tabs>
        </Box>
        <TableFilters
          params={searchParams}
          onSearchChange={(data: any) => {
            // 搜索时重置到第一页
            tabRef?.current?.resetPageIndex()
            setSearchParams(data)
            requestgetFatAccounts({
              ...data,
              status: currentTab,
              pageNum: 1,
              pageSize: tabRef?.current?.getState()?.pagination?.pageSize
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
            tableRef={tabRef}
            tableProps={{
              state: { columnVisibility },
              onColumnVisibilityChange: setColumnVisibility
            }}
          />
        </Box>
      </Card>
    </>
  )
}

export default FiatAccountTable
