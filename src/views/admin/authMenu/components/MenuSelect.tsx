'use client'

// React Imports
import { useState, useEffect, useMemo, useRef } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { Controller, Control, FieldError, useWatch } from 'react-hook-form'
import classnames from 'classnames'
import { ChevronRight, ChevronDown, X } from 'lucide-react'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { MenuNode } from './utils'

interface MenuSelectProps {
  /** 表单控制对象 */
  control: Control<any>
  /** 菜单树 */
  menuTree: MenuNode[]
  /** 是否必填 */
  required?: boolean
  /** 错误状态 */
  error?: FieldError
  /** 表单字段名，默认为 'pid' */
  name?: string
  /** 排除的菜单ID（编辑时排除自己） */
  excludeMenuId?: string | number
}

/**
 * 菜单选择器组件
 * @param control - 表单控制对象
 * @param menuTree - 菜单树
 * @param required - 是否必填
 * @param error - 错误状态
 * @param name - 表单字段名
 * @param excludeMenuId - 排除的菜单ID
 */
const MenuSelect = ({ control, menuTree, required, error, name = 'pid', excludeMenuId }: MenuSelectProps) => {
  const t = useTranslate()
  const [selectOpen, setSelectOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const valueRef = useRef<string>('')

  /**
   * 过滤掉排除的菜单及其子菜单
   */
  const filteredMenuTree = useMemo(() => {
    if (!excludeMenuId) return menuTree

    const filterMenuTree = (nodes: MenuNode[]): MenuNode[] => {
      return nodes
        .filter(node => String(node.id) !== String(excludeMenuId))
        .map(node => {
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: filterMenuTree(node.children)
            }
          }
          return node
        })
    }

    return filterMenuTree(menuTree)
  }, [menuTree, excludeMenuId])

  /**
   * 初始化时展开所有有子节点的菜单，如果有选中值则展开到选中项
   */
  const updateExpandedIds = (value: string) => {
    if (!selectOpen || filteredMenuTree.length === 0) return

    const ids = new Set<string>()

    // 如果有选中值，展开到选中项的路径
    const expandToSelectedPath = (nodes: MenuNode[], targetPath: string, currentPath: string[] = []): boolean => {
      for (const node of nodes) {
        const nodeLabel = node.label ?? node.title ?? ''
        const newPath = [...currentPath, nodeLabel]
        const pathString = newPath.join(' / ')

        // 如果当前路径匹配或包含目标路径，展开所有父节点
        if (targetPath && (targetPath.startsWith(pathString) || pathString === targetPath)) {
          if (node.children && node.children.length > 0) {
            ids.add(String(node.id))
            // 继续展开子节点
            expandToSelectedPath(node.children, targetPath, newPath)
          }
          return true
        }

        // 递归查找子节点
        if (node.children && node.children.length > 0) {
          if (expandToSelectedPath(node.children, targetPath, newPath)) {
            ids.add(String(node.id))
            return true
          }
        }
      }
      return false
    }

    // 如果没有选中值，展开所有有子节点的菜单
    const expandAll = (nodes: MenuNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          ids.add(String(node.id))
          expandAll(node.children)
        }
      })
    }

    // 尝试展开到选中路径，如果没有选中值则展开所有
    const hasSelected = value ? expandToSelectedPath(filteredMenuTree, value) : false
    if (!hasSelected) {
      expandAll(filteredMenuTree)
    }

    setExpandedIds(ids)
  }

  /**
   * 切换展开/收起
   */
  const toggleExpand = (menuId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      newSet.has(menuId) ? newSet.delete(menuId) : newSet.add(menuId)
      return newSet
    })
  }

  /**
   * 监听 selectOpen 和 value 变化，更新展开状态
   * 注意：这里使用 useWatch 来获取表单值，避免在 render 中直接访问
   */
  const watchedValue = useWatch({ control, name })

  useEffect(() => {
    if (selectOpen && filteredMenuTree.length > 0) {
      const currentValue = watchedValue ?? ''
      if (valueRef.current !== currentValue || expandedIds.size === 0) {
        valueRef.current = currentValue
        updateExpandedIds(currentValue)
      }
    }
  }, [selectOpen, watchedValue, filteredMenuTree])

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('admin.selectMenu') } : {}}
      render={({ field, fieldState }) => {
        const value = field.value ?? ''

        // 使用 useEffect 来处理展开状态更新，避免在渲染期间调用 setState
        useEffect(() => {
          if (selectOpen && filteredMenuTree.length > 0) {
            if (valueRef.current !== value || expandedIds.size === 0) {
              valueRef.current = value
              updateExpandedIds(value)
            }
          }
        }, [selectOpen, value, filteredMenuTree])

        /**
         * 渲染树节点
         */
        const renderMenuNode = (menu: MenuNode, level: number = 0, parentPath: string[] = []) => {
          const hasChildren = menu.children && menu.children.length > 0
          const isExpanded = expandedIds.has(String(menu.id))
          const nodeLabel = menu.label ?? menu.title ?? ''
          const currentPath = [...parentPath, nodeLabel]
          const pathString = currentPath.join(' / ')
          const isSelected = value === pathString

          return (
            <Box key={menu.id}>
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
                  field.onChange(pathString)
                  setTimeout(() => {
                    setSelectOpen(false)
                  }, 0)
                }}
              >
                {hasChildren ? (
                  <Box
                    className='cursor-pointer'
                    onClick={e => {
                      e.stopPropagation()
                      toggleExpand(String(menu.id))
                    }}
                    onMouseDown={e => e.stopPropagation()}
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
                <Typography
                  className={classnames('flex-1', {
                    'text-primary font-medium': isSelected
                  })}
                >
                  {nodeLabel}
                  {hasChildren && ` (${menu.children?.length || 0})`}
                </Typography>
              </Box>
              {hasChildren && isExpanded && (
                <Box>{menu.children!.map(child => renderMenuNode(child, level + 1, currentPath))}</Box>
              )}
            </Box>
          )
        }

        return (
          <FormControl fullWidth required={required} error={!!(error || fieldState.error)}>
            <InputLabel>{t('admin.parentMenu')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => {
                setSelectOpen(true)
                valueRef.current = value
                updateExpandedIds(value)
              }}
              onClose={() => setSelectOpen(false)}
              label={t('admin.parentMenu')}
              value={value}
              onChange={e => {
                field.onChange(e.target.value)
              }}
              onBlur={field.onBlur}
              name={field.name}
              renderValue={selected => {
                const displayValue = (selected as string) || ''
                return (
                  <Box className='flex items-center justify-between w-full'>
                    <Typography className='flex-1'>{displayValue || t('admin.mainCategory')}</Typography>
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
              <Box className='p-2'>
                <Box
                  className='flex items-center gap-2 p-2 hover:bg-actionHover transition-colors cursor-pointer'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    field.onChange('')
                    setTimeout(() => {
                      setSelectOpen(false)
                    }, 0)
                  }}
                >
                  <Typography className='flex-1 text-textSecondary'>{t('admin.mainCategory')}</Typography>
                </Box>
                {filteredMenuTree.map(menu => renderMenuNode(menu))}
              </Box>
            </Select>
          </FormControl>
        )
      }}
    />
  )
}

export default MenuSelect
