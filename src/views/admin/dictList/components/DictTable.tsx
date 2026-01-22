'use client'

// React Imports
import { useMemo, useCallback, memo } from 'react'

// MUI Imports
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
export interface DictData {
  /** 字典编码 */
  dictCode: number
  /** 字典标签 */
  dictLabel: string
  /** 字典键值 */
  dictValue: string
  /** 字典排序 */
  dictSort: number
  /** 字典类型 */
  dictType: string
  /** 创建时间 */
  createdAt?: string
  /** 字典状态（1-启用，0-禁用） */
  status: number
  /** 备注 */
  remark?: string
}

interface DictTableProps {
  /** 字典数据 */
  data: DictData[]
  /** 加载状态 */
  loading?: boolean
  /** 总条数 */
  total: number
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 修改字典回调 */
  onEdit?: (dict: DictData) => void
  /** 删除字典回调 */
  onDelete?: (dict: DictData) => void
  /** 可选的 table 实例 ref，用于将 table 实例暴露给外层组件，便于外层控制表格 */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<DictData>()

/**
 * 字典表格组件
 * @param data - 字典数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param onEdit - 修改字典回调
 * @param onDelete - 删除字典回调
 * @param tableRef - 表格实例 ref
 */
const DictTable = memo(({ data, loading = false, total, onPageChange, onEdit, onDelete, tableRef }: DictTableProps) => {
  const t = useTranslate()
  /**
   * 渲染文本单元格
   */
  const renderTextCell = useCallback((value: string | number, fallback = '-') => {
    return (
      <Typography variant='body2' color='text.primary'>
        {value !== null && value !== undefined && value !== '' ? String(value) : fallback}
      </Typography>
    )
  }, [])

  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<DictData, any>[]>(
    () => [
      columnHelper.accessor('dictCode', {
        header: t('admin.dictCode'),
        cell: ({ row }) => renderTextCell(row.original.dictCode)
      }),
      columnHelper.accessor('dictLabel', {
        header: t('admin.dictLabel'),
        cell: ({ row }) => renderTextCell(row.original.dictLabel)
      }),
      columnHelper.accessor('dictValue', {
        header: t('admin.dictValue'),
        cell: ({ row }) => renderTextCell(row.original.dictValue)
      }),
      columnHelper.accessor('dictSort', {
        header: t('admin.dictSort'),
        cell: ({ row }) => renderTextCell(row.original.dictSort)
      }),
      columnHelper.accessor('dictType', {
        header: t('admin.dictType'),
        cell: ({ row }) => renderTextCell(row.original.dictType)
      }),
      columnHelper.accessor('createdAt', {
        header: t('admin.createTime'),
        cell: ({ row }) => renderTextCell(row.original.createdAt ? row?.original?.createdAt : '')
      }),
      columnHelper.accessor('status', {
        header: t('admin.dictStatus'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.status === 1 ? t('admin.enabled') : t('admin.disabled')}
            size='small'
            color={row.original.status === 1 ? 'success' : 'default'}
          />
        )
      }),
      {
        id: 'actions',
        header: t('admin.actions'),
        cell: ({ row }) => (
          <Box className='flex items-center gap-2'>
            <Link component='button' variant='body2' onClick={() => onEdit?.(row.original)} className='text-primary'>
              {t('admin.edit')}
            </Link>
            <Link component='button' variant='body2' onClick={() => onDelete?.(row.original)} className='text-error'>
              {t('admin.delete')}
            </Link>
          </Box>
        ),
        meta: {
          className: 'w-32'
        },
        enableSorting: false
      }
    ],
    [onEdit, onDelete, renderTextCell, t]
  )

  return (
    <TableComponent
      data={data}
      columns={columns}
      loading={loading}
      total={total}
      pageChange={onPageChange}
      tableRef={tableRef}
      tableProps={{
        getRowId: (row: DictData) => String(row.dictCode),
        initialState: {
          pagination: {
            pageSize: 10
          }
        }
      }}
    />
  )
})

DictTable.displayName = 'DictTable'

export default DictTable
