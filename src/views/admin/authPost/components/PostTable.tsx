'use client'

// React Imports
import { useMemo, useRef, useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
export interface PostData {
  /** 岗位ID */
  postId: number
  /** 岗位编码 */
  postCode: string
  /** 岗位名称 */
  postName: string
  /** 排序 */
  postSort: number
  /** 岗位状态 0-禁用 1-启用 */
  status: string
  /** 岗位描述 */
  remark?: string
  /** 创建时间 */
  createdAt: string
}

interface PostTableProps {
  /** 岗位数据 */
  data: PostData[]
  /** 加载状态 */
  loading?: boolean
  /** 总条数 */
  total: number
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 修改岗位回调 */
  onEdit?: (post: PostData) => void
  /** 删除岗位回调 */
  onDelete?: (post: PostData) => void
  /** 可选的 table 实例 ref，用于将 table 实例暴露给外层组件，便于外层控制表格 */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<PostData>()

/**
 * 岗位表格组件
 * @param data - 岗位数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param onEdit - 修改岗位回调
 * @param onDelete - 删除岗位回调
 * @param tableRef - 表格实例 ref
 */
const PostTable = ({ data, loading = false, total, onPageChange, onEdit, onDelete, tableRef }: PostTableProps) => {
  const t = useTranslate()
  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<PostData, any>[]>(
    () => [
      columnHelper.accessor('postCode', {
        header: t('admin.postCode'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.postCode}
          </Typography>
        )
      }),
      columnHelper.accessor('postName', {
        header: t('admin.postName'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.postName}
          </Typography>
        )
      }),
      columnHelper.accessor('postSort', {
        header: t('admin.sort'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.postSort}
          </Typography>
        ),
        meta: {
          className: 'w-20'
        }
      }),
      columnHelper.accessor('status', {
        header: t('admin.postStatus'),
        cell: ({ row }) => {
          const status = String(row.original.status)
          const isEnabled = status === '1'
          return (
            <Chip
              label={isEnabled ? t('admin.enabled') : t('admin.disabled')}
              color={isEnabled ? 'success' : 'default'}
              size='small'
              variant='outlined'
            />
          )
        },
        meta: {
          className: 'w-24'
        }
      }),
      columnHelper.accessor('remark', {
        header: t('admin.postDescription'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.remark || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: t('admin.createTime'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row?.original?.createdAt ?? ''}
          </Typography>
        ),
        meta: {
          className: 'w-40'
        }
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
          </Box>
        ),
        meta: {
          className: 'w-32'
        }
      }
    ],
    [onEdit, onDelete, t]
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

export default PostTable
