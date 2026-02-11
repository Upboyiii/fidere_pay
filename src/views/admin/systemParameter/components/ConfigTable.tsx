'use client'

import { useMemo, useCallback } from 'react'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'
import { formatDate } from 'date-fns/format'
import { useTranslate } from '@/contexts/DictionaryContext'
import type { ConfigData } from '../index'

interface ConfigTableProps {
  data: ConfigData[]
  loading?: boolean
  total: number
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  onEdit?: (config: ConfigData) => void
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<ConfigData>()

const ConfigTable = ({ data, loading = false, total, onPageChange, onEdit, tableRef }: ConfigTableProps) => {
  const t = useTranslate()
  const renderTextCell = useCallback((value: string, fallback = '-') => {
    return (
      <Typography variant='body2' color='text.primary'>
        {value || fallback}
      </Typography>
    )
  }, [])

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
        cell: ({ row }) => renderTextCell(row.original.configType === 1 || row.original.configType === '1' ? t('admin.yes') : t('admin.no'))
      }),
      columnHelper.accessor('remark', {
        header: t('admin.remark'),
        cell: ({ row }) => renderTextCell(row.original.remark || '')
      }),
      columnHelper.accessor(row => row.createTime || row.createdAt, {
        id: 'createTime',
        header: t('admin.createTime'),
        cell: ({ row }) =>
          renderTextCell(
            row.original.createTime || row.original.createdAt
              ? formatDate(row.original.createTime || row.original.createdAt!, 'yyyy-MM-dd HH:mm')
              : ''
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
          </Box>
        ),
        meta: { className: 'w-24' },
        enableSorting: false
      }
    ],
    [onEdit, renderTextCell, t]
  )

  return (
    <TableComponent
      data={data}
      columns={columns}
      loading={loading}
      total={total}
      pageChange={onPageChange}
      tableRef={tableRef}
      tableProps={{ initialState: { pagination: { pageSize: 10 } } }}
    />
  )
}

export default ConfigTable
