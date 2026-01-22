'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { Controller, Control, FieldError } from 'react-hook-form'
import classnames from 'classnames'
import { ChevronRight, ChevronDown, X } from 'lucide-react'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { RoleTreeNode } from './utils'

interface RoleSelectProps {
  /** 表单控制对象 */
  control: Control<any>
  /** 角色树 */
  roleTree: RoleTreeNode[]
  /** 是否必填 */
  required?: boolean
  /** 错误状态 */
  error?: FieldError
  /** 表单字段名，默认为 'parentId' */
  name?: string
  /** 排除的角色ID（编辑时排除自己） */
  excludeRoleId?: string | number
}

/**
 * 角色选择器组件
 * @param control - 表单控制对象
 * @param roleTree - 角色树
 * @param required - 是否必填
 * @param error - 错误状态
 * @param name - 表单字段名
 * @param excludeRoleId - 排除的角色ID
 */
const RoleSelect = ({ control, roleTree, required, error, name = 'parentId', excludeRoleId }: RoleSelectProps) => {
  const t = useTranslate()
  const [selectOpen, setSelectOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  /**
   * 初始化时展开所有有子节点的角色
   */
  useEffect(() => {
    if (selectOpen && roleTree.length > 0) {
      const ids = new Set<string>()
      const collectIds = (nodes: RoleTreeNode[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            ids.add(String(node.id))
            collectIds(node.children)
          }
        })
      }
      collectIds(roleTree)
      setExpandedIds(ids)
    }
  }, [selectOpen, roleTree])

  /**
   * 切换展开/收起
   */
  const toggleExpand = (roleId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      newSet.has(roleId) ? newSet.delete(roleId) : newSet.add(roleId)
      return newSet
    })
  }

  /**
   * 过滤掉排除的角色及其子角色
   */
  const filterRoleTree = (nodes: RoleTreeNode[]): RoleTreeNode[] => {
    if (!excludeRoleId) return nodes

    return nodes
      .filter(node => String(node.id) !== String(excludeRoleId))
      .map(node => {
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: filterRoleTree(node.children)
          }
        }
        return node
      })
  }

  const filteredRoleTree = filterRoleTree(roleTree)

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('admin.selectRole') } : {}}
      render={({ field, fieldState }) => {
        const value = field.value ?? ''

        /**
         * 渲染树节点
         */
        const renderRoleNode = (role: RoleTreeNode, level: number = 0, parentPath: string[] = []) => {
          const hasChildren = role.children && role.children.length > 0
          const isExpanded = expandedIds.has(String(role.id))
          const currentPath = [...parentPath, role.name]
          const pathString = currentPath.join(' / ')
          const isSelected = value === pathString

          return (
            <Box key={role.id}>
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
                      toggleExpand(String(role.id))
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
                  {role.name}
                  {hasChildren && ` (${role.children?.length || 0})`}
                </Typography>
              </Box>
              {hasChildren && isExpanded && (
                <Box>{role.children!.map(child => renderRoleNode(child, level + 1, currentPath))}</Box>
              )}
            </Box>
          )
        }

        return (
          <FormControl fullWidth required={required} error={!!(error || fieldState.error)}>
            <InputLabel>{t('admin.parentRole')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              label={t('admin.parentRole')}
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
                    <Typography className='flex-1'>{displayValue || t('admin.selectParentRole')}</Typography>
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
              <Box className='p-2'>{filteredRoleTree.map(role => renderRoleNode(role))}</Box>
            </Select>
          </FormControl>
        )
      }}
    />
  )
}

export default RoleSelect
