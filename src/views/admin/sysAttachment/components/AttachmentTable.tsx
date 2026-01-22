'use client'

// React Imports
import { useMemo, useCallback } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Utils Imports
import { formatFileSize } from '../utils'

// Type Imports
export interface AttachmentData {
  /** 文件ID */
  id: number
  /** 应用ID */
  appId: string
  /** 上传驱动（0-本地上传） */
  drive: number
  /** 文件原始名 */
  name: string
  /** 上传类型 */
  kind: string
  /** 扩展类型 */
  ext: string
  /** 本地路径 */
  path: string
  /** 文件大小（字节） */
  size: number
  /** 状态 */
  status: boolean
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

interface AttachmentTableProps {
  /** 文件数据 */
  data: AttachmentData[]
  /** 加载状态 */
  loading?: boolean
  /** 总条数 */
  total: number
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 下载文件回调 */
  onDownload?: (attachment: AttachmentData) => void
  /** 删除文件回调 */
  onDelete?: (attachment: AttachmentData) => void
  /** 状态变化回调 */
  onStatusChange?: (attachment: AttachmentData, status: boolean) => void
  /** 可选的 table 实例 ref，用于将 table 实例暴露给外层组件，便于外层控制表格 */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<AttachmentData>()

/**
 * 文件表格组件
 * @param data - 文件数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param onDownload - 下载文件回调
 * @param onDelete - 删除文件回调
 * @param onStatusChange - 状态变化回调
 * @param tableRef - 表格实例 ref
 */
const AttachmentTable = ({
  data,
  loading = false,
  total,
  onPageChange,
  onDownload,
  onDelete,
  onStatusChange,
  tableRef
}: AttachmentTableProps) => {
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
   * 获取上传驱动显示文本
   */
  const getDriveText = useCallback(
    (drive: number) => {
      return drive === 0 ? t('admin.localUpload') : '-'
    },
    [t]
  )

  /**
   * 获取上传类型显示文本
   */
  const getKindText = useCallback(
    (kind: string) => {
      const kindMap: Record<string, string> = {
        image: t('admin.image'),
        document: t('admin.document'),
        audio: t('admin.audio'),
        video: t('admin.video'),
        compressed: t('admin.compressed'),
        other: t('admin.other')
      }
      return kindMap[kind] || kind
    },
    [t]
  )

  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<AttachmentData, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: t('admin.attachmentId'),
        cell: ({ row }) => renderTextCell(String(row.original.id))
      }),
      columnHelper.accessor('appId', {
        header: t('admin.appId'),
        cell: ({ row }) => renderTextCell(row.original.appId)
      }),
      columnHelper.accessor('drive', {
        header: t('admin.uploadDrive'),
        cell: ({ row }) => renderTextCell(getDriveText(row.original.drive))
      }),
      columnHelper.accessor('name', {
        header: t('admin.fileName'),
        cell: ({ row }) => renderTextCell(row.original.name)
      }),
      columnHelper.accessor('kind', {
        header: t('admin.uploadType'),
        cell: ({ row }) => renderTextCell(getKindText(row.original.kind))
      }),
      columnHelper.accessor('path', {
        header: t('admin.localPath'),
        cell: ({ row }) => {
          const path = row.original.path
          return (
            <Typography variant='body2' color={path ? 'text.primary' : 'error.main'}>
              {path || t('admin.loadFailed')}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('size', {
        header: t('admin.fileSize'),
        cell: ({ row }) => renderTextCell(formatFileSize(row.original.size))
      }),
      columnHelper.accessor('status', {
        header: t('admin.status'),
        cell: ({ row }) => (
          <Switch
            checked={row.original.status}
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
        header: t('admin.uploadTime'),
        cell: ({ row }) =>
          renderTextCell(row.original.createdAt ? formatDate(row.original.createdAt, 'yyyy-MM-dd HH:mm:ss') : '')
      }),
      {
        id: 'actions',
        header: t('admin.actions'),
        cell: ({ row }) => (
          <Box className='flex items-center gap-2'>
            <Link
              component='button'
              variant='body2'
              onClick={() => onDownload?.(row.original)}
              className='text-primary cursor-pointer'
            >
              {t('admin.download')}
            </Link>
            <Link
              component='button'
              variant='body2'
              onClick={() => onDelete?.(row.original)}
              className='text-error cursor-pointer'
            >
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
    [onDownload, onDelete, onStatusChange, renderTextCell, getDriveText, getKindText, t]
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

export default AttachmentTable
