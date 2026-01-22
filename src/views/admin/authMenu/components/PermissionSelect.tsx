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
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import { Controller, Control, FieldError } from 'react-hook-form'
import classnames from 'classnames'
import { ChevronRight, ChevronDown, X } from 'lucide-react'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { RoleTreeNode } from '@/views/admin/authRoles/components/utils'

interface PermissionSelectProps {
  /** 表单控制对象 */
  control: Control<any>
  /** 角色树 */
  roleTree: RoleTreeNode[]
  /** 是否必填 */
  required?: boolean
  /** 错误状态 */
  error?: FieldError
  /** 表单字段名，默认为 'permission' */
  name?: string
}

/**
 * 权限标识选择器组件（多选角色）
 * @param control - 表单控制对象
 * @param roleTree - 角色树
 * @param required - 是否必填
 * @param error - 错误状态
 * @param name - 表单字段名
 */
const PermissionSelect = ({ control, roleTree, required, error, name = 'permission' }: PermissionSelectProps) => {
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

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('admin.selectPermission') } : {}}
      render={({ field, fieldState }) => {
        const value = Array.isArray(field.value) ? field.value : field.value ? [field.value] : []

        /**
         * 切换角色选中状态
         */
        const toggleRole = (roleId: string | number) => {
          const roleIdStr = String(roleId)
          const index = value.findIndex(id => String(id) === roleIdStr)
          if (index > -1) {
            field.onChange(value.filter(id => String(id) !== roleIdStr))
          } else {
            field.onChange([...value, roleId])
          }
        }

        /**
         * 检查角色是否选中
         */
        const isRoleSelected = (roleId: string | number): boolean => {
          return value.some(id => String(id) === String(roleId))
        }

        /**
         * 渲染树节点
         */
        const renderRoleNode = (role: RoleTreeNode, level: number = 0) => {
          const hasChildren = role.children && role.children.length > 0
          const isExpanded = expandedIds.has(String(role.id))
          const isChecked = isRoleSelected(role.id)

          return (
            <Box key={role.id}>
              <Box
                className={classnames('flex items-center gap-2 p-2 hover:bg-actionHover transition-colors', {
                  'bg-actionHover': isChecked
                })}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={() => toggleRole(role.id)}
                  size='small'
                  onClick={e => e.stopPropagation()}
                />
                {hasChildren ? (
                  <Box
                    className='cursor-pointer'
                    onClick={() => toggleExpand(String(role.id))}
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
                  className={classnames('flex-1 cursor-pointer', {
                    'text-primary font-medium': isChecked
                  })}
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                  {hasChildren && ` (${role.children?.length || 0})`}
                </Typography>
              </Box>
              {hasChildren && isExpanded && <Box>{role.children!.map(child => renderRoleNode(child, level + 1))}</Box>}
            </Box>
          )
        }

        /**
         * 获取选中角色的名称
         */
        const getSelectedRoleNames = (): string[] => {
          const names: string[] = []
          const findRoleName = (nodes: RoleTreeNode[], targetId: string | number): string | null => {
            for (const node of nodes) {
              if (String(node.id) === String(targetId)) {
                return node.name
              }
              if (node.children) {
                const found = findRoleName(node.children, targetId)
                if (found) return found
              }
            }
            return null
          }

          value.forEach(id => {
            const name = findRoleName(roleTree, id)
            if (name) names.push(name)
          })

          return names
        }

        return (
          <FormControl fullWidth required={required} error={!!(error || fieldState.error)}>
            <InputLabel>{t('admin.permissionIdentifier')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              multiple
              label={t('admin.permissionIdentifier')}
              value={value}
              onChange={e => {
                field.onChange(e.target.value)
              }}
              onBlur={field.onBlur}
              name={field.name}
              renderValue={selected => {
                const selectedValues = (selected as (string | number)[]) || []
                if (selectedValues.length === 0) {
                  return <Typography className='text-textSecondary'>{t('admin.selectRole')}</Typography>
                }
                return (
                  <Box className='flex flex-wrap gap-1'>
                    {getSelectedRoleNames().map((name, index) => (
                      <Chip
                        key={index}
                        label={name}
                        size='small'
                        onDelete={e => {
                          e.stopPropagation()
                          const roleId = value.find((id, idx) => {
                            const names = getSelectedRoleNames()
                            return names[idx] === name
                          })
                          if (roleId !== undefined) {
                            toggleRole(roleId)
                          }
                        }}
                        onMouseDown={e => e.stopPropagation()}
                      />
                    ))}
                  </Box>
                )
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                    width: 300
                  }
                },
                MenuListProps: {
                  style: {
                    padding: 0
                  }
                }
              }}
            >
              <Box className='p-2'>{roleTree.map(role => renderRoleNode(role))}</Box>
            </Select>
          </FormControl>
        )
      }}
    />
  )
}

export default PermissionSelect
