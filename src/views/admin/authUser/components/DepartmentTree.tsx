'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'
import { Search, ChevronDown, ChevronRight } from 'lucide-react'

// Component Imports
import { TreeSkeleton } from '@/components/skeletons'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
export interface DepartmentNode {
  deptId: string
  deptName: string
  children?: DepartmentNode[]
}

interface DepartmentTreeProps {
  /** 部门数据 */
  data: DepartmentNode[]
  /** 选中的部门ID */
  selectedId?: string
  /** 选中变化回调 */
  onSelect?: (deptId: string, node: DepartmentNode) => void
  /** 加载状态 */
  loading?: boolean
}

/**
 * 部门树组件
 * @param data - 部门数据
 * @param selectedId - 选中的部门ID
 * @param onSelect - 选中变化回调
 * @param loading - 加载状态
 */
const DepartmentTree = ({ data, selectedId, onSelect, loading = false }: DepartmentTreeProps) => {
  const t = useTranslate()
  // States
  const [searchValue, setSearchValue] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  /**
   * 收集所有有子节点的节点ID
   */
  const getAllNodeIdsWithChildren = useMemo(() => {
    const ids = new Set<string>()
    const collectIds = (nodes: DepartmentNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          ids.add(node.deptId)
          collectIds(node.children)
        }
      })
    }
    collectIds(data)
    return ids
  }, [data])

  /**
   * 初始化时展开所有节点
   */
  useEffect(() => {
    setExpandedIds(new Set(getAllNodeIdsWithChildren))
  }, [getAllNodeIdsWithChildren])

  /**
   * 过滤部门数据
   */
  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return data

    const filterNode = (node: DepartmentNode): DepartmentNode | null => {
      const matchesSearch = node?.deptName.toLowerCase().includes(searchValue.toLowerCase())
      const filteredChildren = node.children?.map(filterNode).filter(Boolean) as DepartmentNode[] | undefined

      if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren
        }
      }

      return null
    }

    return data.map(filterNode).filter(Boolean) as DepartmentNode[]
  }, [data, searchValue])

  /**
   * 切换展开/收起
   */
  const toggleExpand = (deptId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      newSet.has(deptId) ? newSet.delete(deptId) : newSet.add(deptId)
      return newSet
    })
  }
  /**
   * 渲染树节点
   */
  const renderNode = (node: DepartmentNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedIds.has(node.deptId)
    const isSelected = selectedId == node.deptId

    return (
      <div key={node.deptId}>
        <Box
          className={classnames(
            'flex items-center gap-2 p-2 cursor-pointer rounded hover:bg-actionHover transition-colors',
            {
              'bg-primary/10': isSelected
            }
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(node.deptId)
            }
            onSelect?.(node.deptId, node)
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={16} className='text-textSecondary' />
            ) : (
              <ChevronRight size={16} className='text-textSecondary' />
            )
          ) : (
            <Box className='w-4' />
          )}
          <Typography
            className={classnames('flex-1', {
              'font-medium text-primary': isSelected
            })}
          >
            {node?.deptName}
          </Typography>
        </Box>
        {hasChildren && isExpanded && <Box>{node.children!.map(child => renderNode(child, level + 1))}</Box>}
      </div>
    )
  }

  return (
    <Card className='h-full flex flex-col'>
      <CardContent className='flex flex-col gap-4 flex-1 overflow-hidden'>
        <TextField
          fullWidth
          size='small'
          placeholder={t('admin.deptNamePlaceholder')}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <Box className='mie-2'>
                  <Search size={16} className='text-textSecondary' />
                </Box>
              )
            }
          }}
          className='flex-shrink-0'
        />
        <Box
          className='flex-1 overflow-y-auto min-h-0'
          sx={{
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.3)'
              }
            }
          }}
        >
          {loading ? (
            <Box className='p-2'>
              <TreeSkeleton nodes={12} showMultiLevel />
            </Box>
          ) : filteredData.length === 0 ? (
            <Typography variant='body2' color='text.secondary' className='text-center py-4'>
              {t('admin.noData')}
            </Typography>
          ) : (
            filteredData.map(node => renderNode(node))
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default DepartmentTree
