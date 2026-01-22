'use client'

// React Imports
import { useMemo, useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'

// Third-party Imports
import classnames from 'classnames'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import TableComponent, { type TableInstance } from '@/components/table'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { MenuItemData } from './utils'

interface MenuTableProps {
  /** 菜单数据 */
  data: MenuItemData[]
  /** 加载状态 */
  loading?: boolean
  /** 分页变化回调 */
  onPageChange?: (params: { pageNum: number; pageSize: number }) => void
  /** 新增子菜单回调 */
  onAdd?: (menu: MenuItemData) => void
  /** 修改菜单回调 */
  onEdit?: (menu: MenuItemData) => void
  /** 删除菜单回调 */
  onDelete?: (menu: MenuItemData) => void
  /** 可选的 table 实例 ref */
  tableRef?: React.MutableRefObject<TableInstance | null>
}

const columnHelper = createColumnHelper<MenuItemData>()

/**
 * 菜单表格组件
 * @param data - 菜单数据
 * @param loading - 加载状态
 * @param onPageChange - 分页变化回调
 * @param onAdd - 新增子菜单回调
 * @param onEdit - 修改菜单回调
 * @param onDelete - 删除菜单回调
 * @param tableRef - 表格实例 ref
 */
const MenuTable = ({ data, loading = false, onPageChange, onAdd, onEdit, onDelete, tableRef }: MenuTableProps) => {
  const t = useTranslate()
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())

  /**
   * 切换展开/收起
   */
  const toggleExpand = (menuId: string | number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
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
    const shouldShowNode = (node: MenuItemData): boolean => {
      const parentId = node.pid
      if (!parentId) {
        // 根节点始终显示
        return true
      }

      // 检查所有祖先节点是否都已展开
      const checkAncestors = (currentNode: MenuItemData): boolean => {
        const currentParentId = currentNode.pid
        if (!currentParentId) {
          return true
        }

        const parent = data.find(item => item.id === currentParentId)
        if (!parent) {
          return true
        }

        // 如果父节点未展开，则不显示
        if (!expandedIds.has(parent.id!)) {
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
   * 获取菜单类型标签
   */
  const getMenuTypeLabel = (menuType: number | undefined): string => {
    switch (menuType) {
      case 0:
        return t('admin.directory')
      case 1:
        return t('admin.menu')
      case 2:
        return t('admin.button')
      default:
        return '-'
    }
  }

  /**
   * 获取菜单类型颜色
   */
  const getMenuTypeColor = (menuType: number | undefined): 'default' | 'primary' | 'success' | 'error' => {
    switch (menuType) {
      case 0:
        return 'error'
      case 1:
        return 'success'
      case 2:
        return 'primary'
      default:
        return 'default'
    }
  }

  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnDef<MenuItemData, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: t('admin.menuName'),
        cell: ({ row }) => {
          const menuId = row.original.id
          const menuName = row.original.title ?? row.original.name ?? ''
          const level = row.original.level ?? 0

          const hasChildren = data.some(item => {
            const itemParentId = item.pid
            return itemParentId === menuId
          })
          const isExpanded = menuId ? expandedIds.has(menuId) : false

          const icon = row.original.icon

          return (
            <Box className='flex items-center gap-2' style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <Box
                  className='cursor-pointer'
                  onClick={e => {
                    e.stopPropagation()
                    if (menuId) toggleExpand(menuId)
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
              {icon && <i className={classnames(icon, 'text-lg')} style={{ fontSize: '18px' }} />}
              <Typography variant='body2' color='text.primary'>
                {menuName}
              </Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('path', {
        header: t('admin.routePath'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.path || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('component', {
        header: t('admin.componentPath'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary' className='max-w-xs truncate'>
            {row.original.component || '-'}
          </Typography>
        )
      }),
      // columnHelper.accessor('name', {
      //   header: 'api接口',
      //   cell: ({ row }) => (
      //     <Typography variant='body2' color='text.primary' className='max-w-xs truncate'>
      //       {row.original.name || '-'}
      //     </Typography>
      //   )
      // }),
      columnHelper.accessor('weigh', {
        header: t('admin.sort'),
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.weigh ?? 0}
          </Typography>
        ),
        meta: {
          className: 'w-20'
        }
      }),
      columnHelper.accessor('menuType', {
        header: t('admin.type'),
        cell: ({ row }) => {
          const menuType = row.original.menuType
          return (
            <Chip
              label={getMenuTypeLabel(menuType)}
              color={getMenuTypeColor(menuType)}
              size='small'
              variant='outlined'
            />
          )
        },
        meta: {
          className: 'w-20'
        }
      }),
      columnHelper.accessor('isHide', {
        header: t('admin.displayStatus'),
        cell: ({ row }) => {
          const isHide = row.original.isHide
          const isDisplay = isHide === 0 || !isHide
          return (
            <Chip
              label={isDisplay ? t('admin.show') : t('admin.hide')}
              color={isDisplay ? 'success' : 'default'}
              size='small'
              variant='outlined'
            />
          )
        },
        meta: {
          className: 'w-24'
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
              onClick={() => onAdd?.(row.original)}
              className='cursor-pointer flex items-center gap-1'
            >
              <Plus size={14} />
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

export default MenuTable
