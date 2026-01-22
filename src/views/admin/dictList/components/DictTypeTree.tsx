'use client'

// React Imports
import { useState, useMemo, useEffect, useCallback, memo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import classnames from 'classnames'
import { Search, ChevronDown, ChevronRight, Plus, Pencil, Trash2, ChevronsDown } from 'lucide-react'

// Component Imports
import { TreeSkeleton } from '@/components/skeletons'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { DictTypeNode } from '../utils'

interface DictTypeTreeProps {
  /** 字典类型数据 */
  data: DictTypeNode[]
  /** 选中的字典类型ID */
  selectedId?: string | number
  /** 选中变化回调 */
  onSelect?: (typeId: string | number, node: DictTypeNode) => void
  /** 新增回调 */
  onAdd?: () => void
  /** 编辑回调 */
  onEdit?: (node: DictTypeNode) => void
  /** 删除回调 */
  onDelete?: (node: DictTypeNode) => void
  /** 加载状态 */
  loading?: boolean
}

/**
 * 字典类型树组件
 * @param data - 字典类型数据
 * @param selectedId - 选中的字典类型ID
 * @param onSelect - 选中变化回调
 * @param onAdd - 新增回调
 * @param onEdit - 编辑回调
 * @param onDelete - 删除回调
 * @param loading - 加载状态
 */
const DictTypeTree = memo(
  ({ data, selectedId, onSelect, onAdd, onEdit, onDelete, loading = false }: DictTypeTreeProps) => {
    const t = useTranslate()
    // States
    const [searchValue, setSearchValue] = useState('')
    const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())
    const [isExpanded, setIsExpanded] = useState(true)

    /**
     * 初始化时展开所有节点
     */
    useEffect(() => {
      if (isExpanded) {
        const allIds = new Set<string | number>()
        const collectIds = (nodes: DictTypeNode[]) => {
          nodes.forEach(node => {
            if (node.dictId) {
              allIds.add(node.dictId)
            }
            if (node.children && node.children.length > 0) {
              collectIds(node.children)
            }
          })
        }
        collectIds(data)
        setExpandedIds(allIds)
      } else {
        setExpandedIds(new Set())
      }
    }, [data, isExpanded])

    /**
     * 过滤字典类型数据
     */
    const filteredData = useMemo(() => {
      if (!searchValue.trim()) return data

      const searchLower = searchValue.toLowerCase()
      const filterNode = (node: DictTypeNode): DictTypeNode | null => {
        const matchesSearch = node?.dictName.toLowerCase().includes(searchLower)
        const filteredChildren = node.children?.map(filterNode).filter(Boolean) as DictTypeNode[] | undefined

        if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
          return {
            ...node,
            children: filteredChildren
          }
        }

        return null
      }

      return data.map(filterNode).filter(Boolean) as DictTypeNode[]
    }, [data, searchValue])

    /**
     * 切换展开/收起
     */
    const toggleExpand = useCallback((id: string | number) => {
      setExpandedIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    }, [])

    /**
     * 切换全部展开/收起
     */
    const toggleAllExpand = useCallback(() => {
      setIsExpanded(prev => !prev)
    }, [])

    /**
     * 渲染树节点
     */
    const renderNode = useCallback(
      (node: DictTypeNode, level: number = 0) => {
        const hasChildren = node.children && node.children.length > 0
        const nodeId = node.dictId || node.dictType
        const isExpandedNode = expandedIds.has(nodeId)
        const isSelected = selectedId == nodeId

        return (
          <div key={nodeId}>
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
                  toggleExpand(nodeId)
                }
                onSelect?.(nodeId, node)
              }}
            >
              {hasChildren ? (
                isExpandedNode ? (
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
                {node?.dictName}
              </Typography>
              {isSelected && (
                <Box className='flex items-center gap-1' onClick={e => e.stopPropagation()}>
                  {onEdit && (
                    <Button size='small' variant='text' onClick={() => onEdit(node)} sx={{ minWidth: 'auto', p: 0.5 }}>
                      <Pencil size={14} />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size='small'
                      variant='text'
                      color='error'
                      onClick={() => onDelete(node)}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </Box>
              )}
            </Box>
            {hasChildren && isExpandedNode && <Box>{node.children!.map(child => renderNode(child, level + 1))}</Box>}
          </div>
        )
      },
      [expandedIds, selectedId, onSelect, onEdit, onDelete, toggleExpand]
    )

    return (
      <Card className='h-full flex flex-col'>
        <CardContent className='flex flex-col gap-2 h-full overflow-hidden'>
          {/* 操作按钮 */}
          <Box className='flex items-center gap-2 flex-shrink-0'>
            <Button
              variant='contained'
              color='primary'
              size='small'
              startIcon={<Plus size={16} />}
              onClick={onAdd}
              className='flex-1'
            >
              {t('admin.addDictTypeButton')}
            </Button>
            <Button
              variant='outlined'
              size='small'
              startIcon={<ChevronsDown size={16} />}
              onClick={toggleAllExpand}
              sx={{ minWidth: 'auto' }}
            >
              {isExpanded ? t('admin.collapse') : t('admin.expand')}
            </Button>
          </Box>

          {/* 搜索框 */}
          <TextField
            fullWidth
            size='small'
            placeholder={t('admin.enterDictNamePlaceholder')}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search size={16} />
                  </InputAdornment>
                )
              }
            }}
            className='flex-shrink-0'
          />

          {/* 树形列表 */}
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
)

DictTypeTree.displayName = 'DictTypeTree'

export default DictTypeTree
