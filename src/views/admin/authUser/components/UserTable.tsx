'use client'

// React Imports
import { useMemo, useRef } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
export interface UserData {
  id: string
  userId?: string
  userNickname: string
  userName: string
  department: string
  role: string
  mobile: string
  userStatus: boolean
  createdAt: string
  dept: {
    deptName: string
  }
  roleInfo: {
    name: string
  }[]
}

interface UserTableProps {
  /** 用户数据 */
  data: UserData[]
  /** 加载状态 */
  loading?: boolean
  /** 总条数 */
  total: number
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 修改用户回调 */
  onEdit?: (user: UserData) => void
  /** 删除用户回调 */
  onDelete?: (user: UserData) => void
  /** 停用/启用用户回调 */
  onStatusChange?: (user: UserData, userStatus: boolean) => void
  /** 重置密码回调 */
  onResetPassword?: (user: UserData) => void
  /** 可选的 table 实例 ref，用于将 table 实例暴露给外层组件，便于外层控制表格 */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<UserData>()

/**
 * 用户表格组件
 * @param data - 用户数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param onEdit - 修改用户回调
 * @param onDelete - 删除用户回调
 * @param onResetPassword - 重置密码回调
 * @param onStatusChange - 状态切换回调
 */
const UserTable = ({
  data,
  loading = false,
  total,
  onPageChange,
  onEdit,
  onDelete,
  onResetPassword,
  onStatusChange,
  tableRef
}: UserTableProps) => {
  const t = useTranslate()
  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<UserData, any>[]>(
    () => [
      columnHelper.accessor('userName', {
        header: t('admin.accountName'),
        cell: ({ row }) => <Typography color='text.primary'>{row.original?.userName}</Typography>
      }),
      columnHelper.accessor('userNickname', {
        header: t('admin.userNicknameHeader'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original?.userNickname}
          </Typography>
        )
      }),
      columnHelper.accessor('department', {
        header: t('admin.dept'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original?.dept?.deptName}
          </Typography>
        )
      }),
      columnHelper.accessor('role', {
        header: t('admin.roleHeader'),
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row?.original?.roleInfo?.length ? row?.original?.roleInfo?.map((item: any) => item?.name)?.join(',') : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('mobile', {
        header: t('admin.phone'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.mobile}
          </Typography>
        )
      }),
      columnHelper.accessor('userStatus', {
        header: t('admin.userStatus'),
        cell: ({ row }) => (
          <Switch
            checked={row.original.userStatus}
            onChange={e => {
              onStatusChange?.(row.original, e.target.checked)
            }}
            color='primary'
          />
        ),
        meta: {
          className: 'w-24'
        }
      }),
      columnHelper.accessor('createdAt', {
        header: t('admin.createTime'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {formatDate(row.original?.createdAt, 'yyyy-MM-dd hh:mm')}
          </Typography>
        )
      }),
      {
        id: 'actions',
        header: t('admin.actions'),
        cell: ({ row }) => (
          <Box className='flex items-center gap-2'>
            <Link component='button' variant='body2' onClick={() => onEdit?.(row.original)} className='cursor-pointer'>
              {t('admin.edit')}
            </Link>
            <Link
              component='button'
              variant='body2'
              color='error'
              onClick={() => onDelete?.(row.original)}
              className='cursor-pointer'
            >
              {t('admin.delete')}
            </Link>
            <Link
              component='button'
              variant='body2'
              color='primary'
              onClick={() => onResetPassword?.(row.original)}
              className='cursor-pointer'
            >
              {t('admin.reset')}
            </Link>
          </Box>
        ),
        meta: {
          className: 'w-32'
        }
      }
    ],
    [onEdit, onDelete, onResetPassword, onStatusChange, t]
  )

  return (
    <Box sx={{ p: 4, pt: 0 }}>
      <TableComponent
        data={data}
        columns={columns}
        loading={loading}
        total={total}
        pageChange={onPageChange || (() => {})}
        tableRef={tableRef}
      />
    </Box>
  )
}

export default UserTable
