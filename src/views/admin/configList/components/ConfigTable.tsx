'use client'

// React Imports
import { useMemo, useCallback } from 'react'

// MUI Imports
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
export interface ConfigData {
  /** 参数主键 */
  configId: number
  /** 参数名称 */
  configName: string
  /** 参数键名 */
  configKey: string
  /** 参数键值 */
  configValue: string
  /** 系统内置（1-是，0-否） */
  configType: string
  /** 备注 */
  remark?: string
  /** 创建时间 */
  createTime?: string
}

interface ConfigTableProps {
  /** 参数数据 */
  data: ConfigData[]
  /** 加载状态 */
  loading?: boolean
  /** 总条数 */
  total: number
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 修改参数回调 */
  onEdit?: (config: ConfigData) => void
  /** 删除参数回调 */
  onDelete?: (config: ConfigData) => void
  /** 可选的 table 实例 ref，用于将 table 实例暴露给外层组件，便于外层控制表格 */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<ConfigData>()

/**
 * 参数表格组件
 * @param data - 参数数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param onEdit - 修改参数回调
 * @param onDelete - 删除参数回调
 * @param tableRef - 表格实例 ref
 */
const ConfigTable = ({ data, loading = false, total, onPageChange, onEdit, onDelete, tableRef }: ConfigTableProps) => {
  const t = useTranslate()
  /**
   * 渲染文本单元格
   */
  const renderTextCell = useCallback((value: string, fallback = '-') => {
    return (
      <Typography variant='body2' color='text.primary'>
        {value || fallback}
      </Typography>
    )
  }, [])

  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<ConfigData, any>[]>(
    () => [
      columnHelper.accessor('configId', {
        header: t('admin.configId'),
        cell: ({ row }) => renderTextCell(String(row.original.configId))
      }),
      columnHelper.accessor('configName', {
        header: t('admin.configName'),
        cell: ({ row }) => renderTextCell(row.original.configName)
      }),
      columnHelper.accessor('configKey', {
        header: t('admin.configKey'),
        cell: ({ row }) => renderTextCell(row.original.configKey)
      }),
      columnHelper.accessor('configValue', {
        header: t('admin.configValue'),
        cell: ({ row }) => renderTextCell(row.original.configValue)
      }),
      columnHelper.accessor('configType', {
        header: t('admin.systemBuiltIn'),
        cell: ({ row }) => renderTextCell(row.original.configType === '1' ? t('admin.yes') : t('admin.no'))
      }),
      columnHelper.accessor('remark', {
        header: t('admin.remark'),
        cell: ({ row }) => renderTextCell(row.original.remark || '')
      }),
      columnHelper.accessor('createTime', {
        header: t('admin.createTime'),
        cell: ({ row }) =>
          renderTextCell(row.original.createTime ? formatDate(row.original.createTime, 'yyyy-MM-dd HH:mm') : '')
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
        initialState: {
          pagination: {
            pageSize: 10
          }
        }
      }}
    />
  )
}

export default ConfigTable
