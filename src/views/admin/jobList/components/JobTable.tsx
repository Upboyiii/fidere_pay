'use client'

// React Imports
import { useMemo, useCallback } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'
import { Eye, Edit, Play, Trash2 } from 'lucide-react'

// Type Imports
export interface JobData {
  /** 任务ID */
  jobId: number
  /** 任务名称 */
  jobName: string
  /** 任务组名 */
  jobGroup: string
  /** 任务方法 */
  invokeTarget: string
  /** cron执行表达式 */
  cronExpression: string
  /** 计划执行策略（1-重复执行，0-执行一次） */
  misfirePolicy: number
  /** 状态（1-正常，0-暂停） */
  status: number
  /** 参数 */
  jobMessage?: string
  /** 备注信息 */
  remark?: string
}

interface JobTableProps {
  /** 任务数据 */
  data: JobData[]
  /** 加载状态 */
  loading?: boolean
  /** 总条数 */
  total: number
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 查看详情回调 */
  onViewDetail?: (job: JobData) => void
  /** 编辑任务回调 */
  onEdit?: (job: JobData) => void
  /** 执行一次回调 */
  onExecute?: (job: JobData) => void
  /** 删除任务回调 */
  onDelete?: (job: JobData) => void
  /** 状态变化回调 */
  onStatusChange?: (job: JobData, status: number) => void
  /** 可选的 table 实例 ref */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<JobData>()

/**
 * 任务表格组件
 * @param data - 任务数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param onViewDetail - 查看详情回调
 * @param onEdit - 编辑任务回调
 * @param onExecute - 执行一次回调
 * @param onDelete - 删除任务回调
 * @param onStatusChange - 状态变化回调
 * @param tableRef - 表格实例 ref
 */
const JobTable = ({
  data,
  loading = false,
  total,
  onPageChange,
  onViewDetail,
  onEdit,
  onExecute,
  onDelete,
  onStatusChange,
  tableRef
}: JobTableProps) => {
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
   * 获取计划执行策略显示文本
   */
  const getMisfirePolicyText = useCallback((policy: number) => {
    return policy === 1 ? '重复执行' : '执行一次'
  }, [])

  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<JobData, any>[]>(
    () => [
      columnHelper.accessor('jobId', {
        header: '任务ID',
        cell: ({ row }) => renderTextCell(String(row.original.jobId))
      }),
      columnHelper.accessor('jobName', {
        header: '任务名称',
        cell: ({ row }) => renderTextCell(row.original.jobName)
      }),
      columnHelper.accessor('jobGroup', {
        header: '任务组名',
        cell: ({ row }) => renderTextCell(row.original.jobGroup)
      }),
      columnHelper.accessor('invokeTarget', {
        header: '任务方法',
        cell: ({ row }) => renderTextCell(row.original.invokeTarget)
      }),
      columnHelper.accessor('cronExpression', {
        header: 'cron执行表达式',
        cell: ({ row }) => renderTextCell(row.original.cronExpression)
      }),
      columnHelper.accessor('misfirePolicy', {
        header: '计划执行策略',
        cell: ({ row }) => renderTextCell(getMisfirePolicyText(row.original.misfirePolicy))
      }),
      columnHelper.accessor('status', {
        header: '状态',
        cell: ({ row }) => (
          <Switch
            checked={row.original.status === 0}
            onChange={e => {
              onStatusChange?.(row.original, e.target.checked ? 0 : 1)
            }}
            color='primary'
          />
        ),
        meta: {
          className: 'w-24'
        }
      }),
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <Box className='flex items-center gap-1'>
            <Tooltip title='详情' arrow>
              <IconButton size='small' onClick={() => onViewDetail?.(row.original)}>
                <Eye size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title='修改' arrow>
              <IconButton size='small' onClick={() => onEdit?.(row.original)}>
                <Edit size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title='执行一次' arrow>
              <IconButton size='small' onClick={() => onExecute?.(row.original)}>
                <Play size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title='删除' arrow>
              <IconButton size='small' onClick={() => onDelete?.(row.original)} color='error'>
                <Trash2 size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        meta: {
          className: 'w-40'
        },
        enableSorting: false
      }
    ],
    [onViewDetail, onEdit, onExecute, onDelete, onStatusChange, renderTextCell, getMisfirePolicyText]
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

export default JobTable
