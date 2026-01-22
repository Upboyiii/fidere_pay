'use client'
// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'
// Icon Imports
import { Eye, FileText, Key } from 'lucide-react'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
// Type Imports
import type { ThemeColor } from '@core/types'
import { getUserManagementTable } from '@server/userManagementTable'
// Component Imports
import TabFilters, { SearchData } from '@components/table/tableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
import TableComponent, { TableInstance } from '@components/table'
import { getInitials } from '@/utils/getInitials'
import { useTranslate } from '@/contexts/DictionaryContext'
import classnames from 'classnames'
import ResetPasswordDialog from '@/views/kyc/userManagement/components/ResetPasswordDialog'

const getAccountStatusColor = (status: number): ThemeColor => {
  switch (status) {
    case 1:
      return 'success'
    case 3:
      return 'error'
    default:
      return 'primary'
  }
}

// Column Definitions
const columnHelper = createColumnHelper<any>()

export default function ClientsPage() {
  const t = useTranslate()
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [stat, setStat] = useState<any>({
    approvedCount: 0,
    enableCount: 0,
    disableCount: 0
  })
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<any>({
    keyword: '',
    status: ''
  })
  const tableRef = useRef<TableInstance>(null)
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean
    userId: number | null
    userName?: string
  }>({
    open: false,
    userId: null
  })

  // 统计卡片数据
  const stats = [
    {
      title: '通过总数',
      stats: stat.approvedCount?.toString() || '0',
      avatarIcon: 'ri-group-line',
      avatarColor: 'primary' as const,
      trend: 'positive' as 'positive' | 'negative',
      trendNumber: '',
      subtitle: 'Total Clients'
    },
    {
      title: '活跃账户',
      stats: stat.enableCount?.toString() || '0',
      avatarIcon: 'ri-user-follow-line',
      avatarColor: 'success' as const,
      trend: 'positive' as 'positive' | 'negative',
      trendNumber: '',
      subtitle: 'Active Accounts'
    },
    {
      title: '暂停账户',
      stats: stat.disableCount?.toString() || '0',
      avatarIcon: 'ri-pause-circle-line',
      avatarColor: 'error' as const,
      trend: 'positive' as 'positive' | 'negative',
      trendNumber: '',
      subtitle: 'Suspended'
    }
  ]

  // 处理搜索变化
  const handleSearchChange = (data: any) => {
    setSearchParams(data)
    tableRef?.current?.resetPage?.()
    requestgetUserManagementTable({
      ...data,
      pageNum: 1,
      pageSize: tableRef?.current?.getState().pagination.pageSize
    })
  }

  const pageChange = (data: any) => {
    requestgetUserManagementTable({
      ...data,
      ...searchParams
    })
  }

  useEffect(() => {
    requestgetUserManagementTable({ ...searchParams, pageNum: 1, pageSize: 10 })
  }, [])

  const requestgetUserManagementTable = async (params: any) => {
    setLoading(true)
    try {
      const res = await getUserManagementTable(params)
      setData(res.data?.list ?? [])
      setTotal(res.data?.total ?? 0)
      setStat(res.data?.stat ?? {
        approvedCount: 0,
        enableCount: 0,
        disableCount: 0
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 筛选配置
  const searchData: SearchData[] = [
    {
      name: 'keyword',
      type: 'input',
      label: t('userManagement.searchPlaceholder'),
      placeholder: t('userManagement.searchPlaceholder')
    },
    {
      name: 'status',
      type: 'select',
      label: t('userManagement.accountStatus'),
      placeholder: t('userManagement.selectAccountStatus'),
      options: [
        { label: t('userManagement.allStatus'), value: '' },
        { label: t('userManagement.enabled'), value: '1' },
        { label: t('userManagement.disabled'), value: '3' }
      ]
    }
  ] as const

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: t('userManagement.customerInfo'),
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' size={34}>
              {getInitials(row.original.nickName)}
            </CustomAvatar>
            <div className='flex flex-col gap-1'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.nickName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ID: {row.original.id}
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
      columnHelper.accessor('type', {
        header: t('userManagement.applicationType'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-textSecondary' />
            <Typography>{row.original.accountTypeLabel}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('approvalTime', {
        header: t('userManagement.approvalTime'),
        cell: ({ row }) => (
          <Typography>{row.original.kycTime ? formatDate(row.original.kycTime, 'yyyy-MM-dd hh:mm') : '-'}</Typography>
        )
      }),
      columnHelper.accessor('accountStatus', {
        header: t('userManagement.accountStatus'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.statusLabel}
            size='small'
            color={getAccountStatusColor(row.original.status)}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('lastActivity', {
        header: t('userManagement.lastActivity'),
        cell: ({ row }) => (
          <Typography>
            {row.original.lastLogin ? formatDate(row.original.lastLogin, 'yyyy-MM-dd hh:mm') : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: t('userManagement.action'),
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              <RouterLinkSkip href={`/kyc/userManagement/${row.original.id}?from=operation/clients`} className='flex'>
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
                  {t('userManagement.viewDetails')}
                </Button>
              </RouterLinkSkip>
              <Button
                variant='outlined'
                size='small'
                startIcon={<Key size={16} />}
                onClick={() => {
                  setResetPasswordDialog({
                    open: true,
                    userId: row.original.id,
                    userName: row.original.nickName || row.original.email
                  })
                }}
                sx={{
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5
                }}
              >
                修改密码
              </Button>
            </div>
          )
        },
        enableSorting: false
      })
    ],
    [t]
  )

  return (
    <>
      {/* Statistics Cards */}
      <Grid container spacing={6} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card>
              <CardContent className='flex justify-between gap-1'>
                <div className='flex flex-col gap-1 flex-grow'>
                  <Typography color='text.primary'>{stat.title}</Typography>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <Typography variant='h4'>{stat.stats}</Typography>
                    {stat.trendNumber && stat.trend && (
                      <Typography color={stat.trend === 'negative' ? 'error.main' : 'success.main'}>
                        {`(${stat.trend === 'negative' ? '-' : '+'}${stat.trendNumber})`}
                      </Typography>
                    )}
                  </div>
                  {stat.subtitle && <Typography variant='body2'>{stat.subtitle}</Typography>}
                </div>
                <CustomAvatar color={stat.avatarColor} skin='light' variant='rounded' size={42}>
                  <i className={classnames(stat.avatarIcon, 'text-[26px]')} />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title={t('userManagement.title')} subheader={t('userManagement.subtitle')} />
          <TabFilters params={searchParams} onSearchChange={handleSearchChange} searchData={searchData as unknown as any[]} />
          <Box sx={{ p: 4, pt: 0 }}>
            <Divider sx={{ px: 2 }} />
            <Box sx={{ pt: 4 }}>
              <TableComponent
                data={data}
                columns={columns}
                loading={loading}
                total={total}
                pageChange={pageChange}
                tableRef={tableRef}
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* 修改密码对话框 */}
      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onClose={() => {
          setResetPasswordDialog({ open: false, userId: null })
        }}
        userId={resetPasswordDialog.userId || 0}
        userName={resetPasswordDialog.userName}
        onSuccess={() => {
          // 密码修改成功后刷新列表
          const currentPage = tableRef?.current?.getState().pagination.pageIndex ?? 0
          const pageSize = tableRef?.current?.getState().pagination.pageSize ?? 10
          requestgetUserManagementTable({
            ...searchParams,
            pageNum: currentPage + 1,
            pageSize
          })
        }}
      />
    </>
  )
}
