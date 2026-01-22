'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { Controller, Control } from 'react-hook-form'
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react'
import classnames from 'classnames'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { DictTypeNode } from '../utils'
import { findNodeById } from '../utils'

interface DictTypeParentSelectProps {
  /** react-hook-form control */
  control: Control<any>
  /** 字典类型树数据 */
  dictTypeTree: DictTypeNode[]
  /** 字段名称 */
  name?: string
  /** 是否必填 */
  required?: boolean
  /** 错误信息 */
  error?: string
  /** 排除的字典类型ID（编辑时排除自己） */
  excludeDictId?: number
}

/**
 * 字典类型上级选择组件
 * @param control - react-hook-form control
 * @param dictTypeTree - 字典类型树数据
 * @param name - 字段名称
 * @param required - 是否必填
 * @param error - 错误信息
 * @param excludeDictId - 排除的字典类型ID
 */
const DictTypeParentSelect = ({
  control,
  dictTypeTree,
  name = 'parentId',
  required,
  error,
  excludeDictId
}: DictTypeParentSelectProps) => {
  const t = useTranslate()
  const [selectOpen, setSelectOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())

  /**
   * 过滤掉排除的字典类型及其子类型
   */
  const filteredDictTypeTree = useMemo(() => {
    if (!excludeDictId) return dictTypeTree

    const filterTree = (nodes: DictTypeNode[]): DictTypeNode[] => {
      return nodes
        .filter(node => node.dictId !== excludeDictId)
        .map(node => {
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: filterTree(node.children)
            }
          }
          return node
        })
    }

    return filterTree(dictTypeTree)
  }, [dictTypeTree, excludeDictId])

  /**
   * 初始化时展开所有有子节点的字典类型
   */
  useEffect(() => {
    if (selectOpen && filteredDictTypeTree.length > 0) {
      const ids = new Set<string | number>()
      const collectIds = (nodes: DictTypeNode[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            if (node.dictId) {
              ids.add(node.dictId)
            }
            collectIds(node.children)
          }
        })
      }
      collectIds(filteredDictTypeTree)
      setExpandedIds(ids)
    }
  }, [selectOpen, filteredDictTypeTree])

  /**
   * 切换展开/收起
   */
  const toggleExpand = useCallback((dictId: string | number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dictId)) {
        newSet.delete(dictId)
      } else {
        newSet.add(dictId)
      }
      return newSet
    })
  }, [])

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('admin.selectParent') } : {}}
      render={({ field, fieldState }) => {
        const value = field.value ?? ''
        const selectedNode = value ? findNodeById(filteredDictTypeTree, Number(value)) : null
        const displayValue = selectedNode ? selectedNode.dictName : ''

        /**
         * 过滤节点（根据搜索值）
         */
        const filterNode = (node: DictTypeNode): DictTypeNode | null => {
          const matchesSearch = !searchValue.trim() || node.dictName.toLowerCase().includes(searchValue.toLowerCase())
          const filteredChildren = node.children?.map(filterNode).filter(Boolean) as DictTypeNode[] | undefined

          if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
            return {
              ...node,
              children: filteredChildren
            }
          }

          return null
        }

        /**
         * 渲染树节点
         */
        const renderNode = (node: DictTypeNode, level: number = 0) => {
          const hasChildren = node.children && node.children.length > 0
          const isExpanded = expandedIds.has(node.dictId!)
          const isSelected = value === String(node.dictId)

          return (
            <Box key={node.dictId}>
              <Box
                className={classnames(
                  'flex items-center gap-2 p-2 hover:bg-actionHover transition-colors cursor-pointer',
                  {
                    'bg-actionHover': isSelected
                  }
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  field.onChange(String(node.dictId))
                  setTimeout(() => {
                    setSelectOpen(false)
                  }, 0)
                }}
              >
                {hasChildren ? (
                  <IconButton
                    size='small'
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleExpand(node.dictId!)
                    }}
                    sx={{ minWidth: 'auto', padding: 0.5 }}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </IconButton>
                ) : (
                  <Box className='w-5' />
                )}
                <Typography className='flex-1'>{node.dictName}</Typography>
              </Box>
              {hasChildren && isExpanded && <Box>{node.children!.map(child => renderNode(child, level + 1))}</Box>}
            </Box>
          )
        }

        return (
          <FormControl fullWidth required={required} error={!!(error || fieldState.error)}>
            <InputLabel>{t('admin.parent')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => {
                setSelectOpen(false)
                setSearchValue('')
              }}
              label={t('admin.parent')}
              value={value}
              onChange={e => {
                field.onChange(e.target.value)
              }}
              onBlur={field.onBlur}
              name={field.name}
              renderValue={() => {
                return (
                  <Box className='flex items-center justify-between w-full'>
                    <Typography className='flex-1'>{displayValue || t('admin.selectParent')}</Typography>
                    {displayValue && (
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          field.onChange('')
                        }}
                        onMouseDown={e => e.stopPropagation()}
                        sx={{ padding: 0.5, marginLeft: 1 }}
                      >
                        <X size={14} />
                      </IconButton>
                    )}
                  </Box>
                )
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                    width: 300
                  }
                }
              }}
            >
              <Box className='p-2' sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder={t('admin.searchDictType')}
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
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                />
              </Box>
              <Box
                className={classnames(
                  'flex items-center gap-2 p-2 hover:bg-actionHover transition-colors cursor-pointer',
                  {
                    'bg-actionHover': value === ''
                  }
                )}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  field.onChange('')
                  setTimeout(() => {
                    setSelectOpen(false)
                  }, 0)
                }}
              >
                <Typography color='text.secondary' className='flex-1'>
                  {t('admin.noParent')}
                </Typography>
              </Box>
              {(() => {
                const filteredTree = searchValue.trim()
                  ? (filteredDictTypeTree.map(filterNode).filter(Boolean) as DictTypeNode[])
                  : filteredDictTypeTree

                return filteredTree.length === 0 ? (
                  <Box className='p-2 text-center text-textSecondary'>
                    <Typography variant='body2'>{t('admin.noData')}</Typography>
                  </Box>
                ) : (
                  filteredTree.map((node: DictTypeNode) => renderNode(node))
                )
              })()}
            </Select>
            {(fieldState.error || error) && (
              <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'error.main' }}>{fieldState.error?.message || error}</Box>
            )}
          </FormControl>
        )
      }}
    />
  )
}

export default DictTypeParentSelect
