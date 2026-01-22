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

interface DictTypeTreeSelectProps {
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
}

/**
 * 将树形数据扁平化为选项列表
 */
const flattenTree = (nodes: DictTypeNode[]): Array<{ label: string; value: string; dictId?: number }> => {
  const result: Array<{ label: string; value: string; dictId?: number }> = []

  const traverse = (nodes: DictTypeNode[], level: number = 0) => {
    nodes.forEach(node => {
      const prefix = '  '.repeat(level)
      result.push({
        label: `${prefix}${node.dictName}`,
        value: node.dictType,
        dictId: node.dictId
      })
      if (node.children && node.children.length > 0) {
        traverse(node.children, level + 1)
      }
    })
  }

  traverse(nodes)
  return result
}

/**
 * 字典类型树选择组件（使用左侧树数据）
 * @param control - react-hook-form control
 * @param dictTypeTree - 字典类型树数据
 * @param name - 字段名称
 * @param required - 是否必填
 * @param error - 错误信息
 */
const DictTypeTreeSelect = ({ control, dictTypeTree, name = 'dictType', required, error }: DictTypeTreeSelectProps) => {
  const t = useTranslate()
  const [selectOpen, setSelectOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())

  /**
   * 将树形数据转换为选项列表
   */
  const options = useMemo(() => {
    return flattenTree(dictTypeTree)
  }, [dictTypeTree])

  /**
   * 过滤选项
   */
  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) return options
    return options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))
  }, [options, searchValue])

  /**
   * 初始化时展开所有有子节点的字典类型
   */
  useEffect(() => {
    if (selectOpen && dictTypeTree.length > 0) {
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
      collectIds(dictTypeTree)
      setExpandedIds(ids)
    }
  }, [selectOpen, dictTypeTree])

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
      rules={required ? { required: t('admin.selectDictType') } : {}}
      render={({ field, fieldState }) => {
        const value = field.value ?? ''
        const selectedOption = options.find(opt => opt.value === value)

        /**
         * 渲染树节点（用于下拉菜单中的树形展示）
         */
        const renderTreeNode = (node: DictTypeNode, level: number = 0): JSX.Element => {
          const hasChildren = node.children && node.children.length > 0
          const isExpanded = expandedIds.has(node.dictId!)
          const matchesSearch = !searchValue.trim() || node.dictName.toLowerCase().includes(searchValue.toLowerCase())

          if (
            searchValue.trim() &&
            !matchesSearch &&
            (!hasChildren ||
              !node.children?.some(
                child =>
                  child.dictName.toLowerCase().includes(searchValue.toLowerCase()) ||
                  child.children?.some(grandchild =>
                    grandchild.dictName.toLowerCase().includes(searchValue.toLowerCase())
                  )
              ))
          ) {
            return <></>
          }

          return (
            <Box key={node.dictId || node.dictType}>
              <Box
                className={classnames(
                  'flex items-center gap-2 p-2 hover:bg-actionHover transition-colors cursor-pointer',
                  {
                    'bg-actionHover': value === node.dictType
                  }
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  field.onChange(node.dictType)
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
              {hasChildren && isExpanded && <Box>{node.children!.map(child => renderTreeNode(child, level + 1))}</Box>}
            </Box>
          )
        }

        return (
          <FormControl fullWidth required={required} error={!!(error || fieldState.error)}>
            <InputLabel>{t('admin.dictType')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => {
                setSelectOpen(false)
                setSearchValue('')
              }}
              label={t('admin.dictType')}
              value={value}
              onChange={e => {
                field.onChange(e.target.value)
              }}
              onBlur={field.onBlur}
              name={field.name}
              renderValue={() => {
                const displayValue = selectedOption?.label?.replace(/^\s+/, '') || value || ''
                return (
                  <Box className='flex items-center justify-between w-full'>
                    <Typography className='flex-1'>{displayValue || t('admin.selectDictType')}</Typography>
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
              {searchValue.trim() ? (
                // 搜索模式下显示扁平列表
                filteredOptions.length === 0 ? (
                  <Box className='p-2 text-center text-textSecondary'>
                    <Typography variant='body2'>{t('admin.noData')}</Typography>
                  </Box>
                ) : (
                  filteredOptions.map(option => (
                    <Box
                      key={option.value}
                      className={classnames(
                        'flex items-center gap-2 p-2 hover:bg-actionHover transition-colors cursor-pointer',
                        {
                          'bg-actionHover': value === option.value
                        }
                      )}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        field.onChange(option.value)
                        setTimeout(() => {
                          setSelectOpen(false)
                        }, 0)
                      }}
                    >
                      <Typography className='flex-1'>{option.label}</Typography>
                    </Box>
                  ))
                )
              ) : // 正常模式下显示树形结构
              dictTypeTree.length === 0 ? (
                <Box className='p-2 text-center text-textSecondary'>
                  <Typography variant='body2'>{t('admin.noData')}</Typography>
                </Box>
              ) : (
                dictTypeTree.map(node => renderTreeNode(node))
              )}
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

export default DictTypeTreeSelect
