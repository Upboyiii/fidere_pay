'use client'
// React Imports
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
// Icon Imports
import { Eye, FileText, Key } from 'lucide-react'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { getUserManagementTable, updateMemberStatus } from '@server/userManagementTable'
// Component Imports
import TableFilters from './TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import RouterLinkSkip from '@/@menu/components/RouterLinkSkip'
import TableComponent, { TableInstance } from '@components/table'
import Grid from '@mui/material/Grid2'
import { getInitials } from '@/utils/getInitials'
import UserCards from './userCards'
import { useTranslate } from '@/contexts/DictionaryContext'
import { toast } from 'react-toastify'
import ResetPasswordDialog from './components/ResetPasswordDialog'

// Column Definitions
const columnHelper = createColumnHelper<any>()

const UserManagementTable = () => {
  const t = useTranslate()
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [topData, setTopData] = useState<any>()
  const [statusChangingIds, setStatusChangingIds] = useState<Set<number>>(new Set())
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
      setTopData(res?.data?.stat ?? {})
    } catch (error) {
      console.error(error)
      setTopData(null)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理状态切换
   * @param id 用户ID
   * @param currentStatus 当前状态
   * @param checked 是否启用
   */
  const handleStatusChange = useCallback(
    async (id: number, currentStatus: number, checked: boolean) => {
      const newStatus = checked ? 1 : 3
      // 如果状态没有变化，直接返回
      if (currentStatus === newStatus) {
        return
      }

      // 设置 loading 状态
      setStatusChangingIds(prev => new Set(prev).add(id))

      try {
        await updateMemberStatus(id, newStatus)
        toast.success(t('messages.success.updated'))
        // 刷新当前页数据
        const currentPage = tableRef?.current?.getState().pagination.pageIndex ?? 0
        const pageSize = tableRef?.current?.getState().pagination.pageSize ?? 10
        await requestgetUserManagementTable({
          ...searchParams,
          pageNum: currentPage + 1,
          pageSize
        })
      } catch (error: any) {
        console.error('状态更新失败:', error)
        toast.error(error?.message || t('messages.error.updateFailed'))
      } finally {
        // 清除 loading 状态
        setStatusChangingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    },
    [searchParams, t]
  )
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: t('userManagement.customerInfo'), // 客户信息
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
        header: t('userManagement.applicationType'), // 申请类型
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-textSecondary' />
            <Typography>{row.original.accountTypeLabel}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('approvalTime', {
        header: t('userManagement.approvalTime'), // 通过时间
        cell: ({ row }) => (
          <Typography>{row.original.kycTime ? formatDate(row.original.kycTime, 'yyyy-MM-dd hh:mm') : '-'}</Typography>
        )
      }),
      columnHelper.accessor('accountStatus', {
        header: t('userManagement.accountStatus'), // 账户状态
        cell: ({ row }) => {
          const isChanging = statusChangingIds.has(row.original.id)
          return (
            <Switch
              checked={row.original.status === 1}
              onChange={e => handleStatusChange(row.original.id, row.original.status, e.target.checked)}
              disabled={isChanging}
              color='primary'
            />
          )
        }
      }),
      columnHelper.accessor('lastActivity', {
        header: t('userManagement.lastActivity'), // 最后活动
        cell: ({ row }) => (
          <Typography>
            {row.original.lastLogin ? formatDate(row.original.lastLogin, 'yyyy-MM-dd hh:mm') : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: t('userManagement.action'), // 操作
        cell: ({ row }) => {
          // 方案1: 文字按钮（当前方案）- 适合需要明确说明操作的场景
          return (
            <div className='flex items-center gap-2'>
              <RouterLinkSkip href={`/kyc/userManagement/${row.original.id}`} className='flex'>
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
                  {t('userManagement.viewDetails')} {/* 查看详情 */}
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
    [t, handleStatusChange, statusChangingIds]
  )

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserCards data={topData} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title={t('userManagement.title')} subheader={t('userManagement.subtitle')} />{' '}
          {/* 审核通过用户 已通过KYC审核的活跃用户账户 */}
          <TableFilters onSearchChange={handleSearchChange} params={searchParams} />
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
          // 密码修改成功后可以刷新列表（可选）
          const currentPage = tableRef?.current?.getState().pagination.pageIndex ?? 0
          const pageSize = tableRef?.current?.getState().pagination.pageSize ?? 10
          requestgetUserManagementTable({
            ...searchParams,
            pageNum: currentPage + 1,
            pageSize
          })
        }}
      />
    </Grid>
  )
}

export default UserManagementTable
