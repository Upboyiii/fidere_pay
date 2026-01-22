'use client'

// React Imports
import { useMemo, useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import { ChevronDown, ChevronRight, Edit, Trash2, Shield } from 'lucide-react'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'
import { formatDate } from 'date-fns/format'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { RoleData } from './utils'

interface RoleTableProps {
  /** 角色数据 */
  data: RoleData[]
  /** 加载状态 */
  loading?: boolean
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 修改角色回调 */
  onEdit?: (role: RoleData) => void
  /** 授权角色回调 */
  onAuth?: (role: RoleData) => void
  /** 删除角色回调 */
  onDelete?: (role: RoleData) => void
  /** 可选的 table 实例 ref */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<RoleData>()

/**
 * 角色表格组件
 * @param data - 角色数据
 * @param loading - 加载状态
 * @param total - 总条数
 * @param onPageChange - 分页变化回调
 * @param onEdit - 修改角色回调
 * @param onAuth - 授权角色回调
 * @param onDelete - 删除角色回调
 * @param tableRef - 表格实例 ref
 */
const RoleTable = ({ data, loading = false, onPageChange, onEdit, onAuth, onDelete, tableRef }: RoleTableProps) => {
  const t = useTranslate()
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())

  /**
   * 初始化时展开所有节点
   */
  useEffect(() => {
    const allIds = new Set<string | number>()
    data.forEach(item => {
      const roleId = item.roleId ?? item.id
      const parentId = item.parentId ?? item.pid
      if (!roleId) return

      const hasChildren = data.some(d => {
        const dParentId = d.parentId ?? d.pid
        return dParentId === roleId
      })
      if (hasChildren) {
        allIds.add(roleId)
      }
    })
    setExpandedIds(allIds)
  }, [data])

  /**
   * 切换展开/收起
   */
  const toggleExpand = (roleId: string | number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roleId)) {
        newSet.delete(roleId)
      } else {
        newSet.add(roleId)
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
    const shouldShowNode = (node: RoleData): boolean => {
      const parentId = node.parentId ?? node.pid
      if (!parentId) {
        // 根节点始终显示
        return true
      }

      // 检查所有祖先节点是否都已展开
      const checkAncestors = (currentNode: RoleData): boolean => {
        const currentParentId = currentNode.parentId ?? currentNode.pid
        if (!currentParentId) {
          return true
        }

        const parent = data.find(item => {
          const itemRoleId = item.roleId ?? item.id
          return itemRoleId === currentParentId
        })
        if (!parent) {
          return true
        }

        const parentRoleId = parent.roleId ?? parent.id
        // 如果父节点未展开，则不显示
        if (!parentRoleId || !expandedIds.has(parentRoleId)) {
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
  const columns = useMemo<ColumnDef<RoleData, any>[]>(
    () => [
      columnHelper.accessor('roleName', {
        header: t('admin.roleName'),
        cell: ({ row }) => {
          const roleId = row.original.roleId ?? row.original.id
          const roleName = row.original.roleName ?? row.original.name ?? ''
          const parentId = row.original.parentId ?? row.original.pid

          const hasChildren = data.some(item => {
            const itemParentId = item.parentId ?? item.pid
            return itemParentId === roleId
          })
          const isExpanded = roleId ? expandedIds.has(roleId) : false

          return (
            <Box className='flex items-center gap-2'>
              {hasChildren ? (
                <Box
                  className='cursor-pointer'
                  onClick={e => {
                    e.stopPropagation()
                    if (roleId) toggleExpand(roleId)
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
                {roleName}
              </Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('roleSort', {
        header: t('admin.sort'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.roleSort ?? row.original.listOrder ?? 0}
          </Typography>
        ),
        meta: {
          className: 'w-20'
        }
      }),
      columnHelper.accessor('userCount', {
        header: t('admin.userCount'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.userCount ?? row.original.userCnt ?? 0}
          </Typography>
        ),
        meta: {
          className: 'w-24'
        }
      }),
      columnHelper.accessor('status', {
        header: t('admin.roleStatus'),
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
        header: t('admin.roleDescription'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.remark || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('createTime', {
        header: t('admin.createTime'),
        cell: ({ row }) => {
          const createTime = row.original.createTime ?? row.original.createdAt
          return (
            <Typography variant='body2' color='text.primary'>
              {createTime ? formatDate(new Date(createTime), 'yyyy-MM-dd HH:mm:ss') : '-'}
            </Typography>
          )
        },
        meta: {
          className: 'w-40'
        }
      }),
      {
        id: 'actions',
        header: t('admin.actions'),
        cell: ({ row }) => (
          <Box className='flex items-center gap-2'>
            <Link
              component='button'
              variant='body2'
              onClick={() => onEdit?.(row.original)}
              className='cursor-pointer flex items-center gap-1'
            >
              {/* <Edit size={14} /> */}
              {t('admin.edit')}
            </Link>
            {/* <Link
              component='button'
              variant='body2'
              onClick={() => onAuth?.(row.original)}
              className='cursor-pointer flex items-center gap-1'
            >
              <Shield size={14} />
              {t('admin.authorize')}
            </Link> */}
            <Link
              component='button'
              variant='body2'
              color='error'
              onClick={() => onDelete?.(row.original)}
              className='cursor-pointer flex items-center gap-1'
            >
              {/* <Trash2 size={14} /> */}
              {t('admin.delete')}
            </Link>
          </Box>
        ),
        meta: {
          className: 'w-40'
        }
      }
    ],
    [data, expandedIds, onEdit, onAuth, onDelete, t]
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
      />
    </Box>
  )
}

export default RoleTable
