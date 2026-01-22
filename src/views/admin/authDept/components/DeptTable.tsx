'use client'

// React Imports
import { useMemo, useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import { ChevronDown, ChevronRight } from 'lucide-react'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { FlatDeptData } from './utils'

interface DeptTableProps {
  /** 部门数据 */
  data: FlatDeptData[]
  /** 加载状态 */
  loading?: boolean
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 新增子部门回调 */
  onAdd?: (dept: FlatDeptData) => void
  /** 修改部门回调 */
  onEdit?: (dept: FlatDeptData) => void
  /** 删除部门回调 */
  onDelete?: (dept: FlatDeptData) => void
  /** 可选的 table 实例 ref */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<FlatDeptData>()

/**
 * 部门表格组件
 * @param data - 部门数据
 * @param loading - 加载状态
 * @param onPageChange - 分页变化回调
 * @param onAdd - 新增子部门回调
 * @param onEdit - 修改部门回调
 * @param onDelete - 删除部门回调
 * @param tableRef - 表格实例 ref
 */
const DeptTable = ({ data, loading = false, onPageChange, onAdd, onEdit, onDelete, tableRef }: DeptTableProps) => {
  const t = useTranslate()
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())

  /**
   * 初始化时展开所有节点
   */
  useEffect(() => {
    const allIds = new Set<string | number>()
    data.forEach(item => {
      const hasChildren = data.some(d => d.parentId === item.deptId)
      if (hasChildren) {
        allIds.add(item.deptId)
      }
    })
    setExpandedIds(allIds)
  }, [data])

  /**
   * 切换展开/收起
   */
  const toggleExpand = (deptId: string | number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(deptId)) {
        newSet.delete(deptId)
      } else {
        newSet.add(deptId)
      }
      return newSet
    })
  }

  /**
   * 过滤后的数据（只显示展开节点的子节点）
   */
  const filteredData = useMemo(() => {
    /**
     * 检查节点是否应该显示（所有祖先节点都已展开）
     */
    const shouldShowNode = (node: FlatDeptData): boolean => {
      if (!node.parentId) {
        // 根节点始终显示
        return true
      }

      // 检查所有祖先节点是否都已展开
      const checkAncestors = (currentNode: FlatDeptData): boolean => {
        if (!currentNode.parentId) {
          return true
        }

        const parent = data.find(item => item.deptId === currentNode.parentId)
        if (!parent) {
          return true
        }

        // 如果父节点未展开，则不显示
        if (!expandedIds.has(parent.deptId)) {
          return false
        }

        // 递归检查祖先节点
        return checkAncestors(parent)
      }

      return checkAncestors(node)
    }

    return data.filter(item => shouldShowNode(item))
  }, [data, expandedIds])

  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<FlatDeptData, any>[]>(
    () => [
      columnHelper.accessor('deptName', {
        header: t('admin.deptName'),
        cell: ({ row }) => {
          const level = row.original.level
          const hasChildren = data.some(item => item.parentId === row.original.deptId)
          const isExpanded = expandedIds.has(row.original.deptId)

          return (
            <Box className='flex items-center gap-2' style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <Box
                  className='cursor-pointer'
                  onClick={e => {
                    e.stopPropagation()
                    toggleExpand(row.original.deptId)
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className='text-textSecondary' />
                  ) : (
                    <ChevronRight size={16} className='text-textSecondary' />
                  )}
                </Box>
              ) : (
                <Box className='w-4' />
              )}
              <Typography variant='body2' color='text.primary'>
                {row.original.deptName}
              </Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: t('admin.deptStatus'),
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
      columnHelper.accessor('orderNum', {
        header: t('admin.sort'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.orderNum}
          </Typography>
        ),
        meta: {
          className: 'w-20'
        }
      }),
      columnHelper.accessor('createTime', {
        header: t('admin.createTime'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.createTime ? formatDate(row.original.createTime, 'yyyy-MM-dd HH:mm:ss') : '-'}
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
            <Link component='button' variant='body2' onClick={() => onAdd?.(row.original)} className='cursor-pointer'>
              {t('admin.add')}
            </Link>
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
    [data, expandedIds, onAdd, onEdit, onDelete, t]
  )

  return (
    <Box sx={{ p: 4, pt: 0 }}>
      <TableComponent
        data={filteredData}
        columns={columns}
        loading={loading}
        total={0}
        pageChange={onPageChange || (() => {})}
        tableRef={tableRef}
        isPagination={false}
      />
    </Box>
  )
}

export default DeptTable
