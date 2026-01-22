'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { Controller, Control } from 'react-hook-form'
import classnames from 'classnames'
import { ChevronRight, ChevronDown } from 'lucide-react'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { RoleTreeNode } from './utils'

interface RoleSelectProps {
  /** 表单控制对象 */
  control: Control<any>
  /** 角色树 */
  roleTree: RoleTreeNode[]
}

/**
 * 角色选择器组件
 * @param control - 表单控制对象
 * @param roleTree - 角色树
 */
const RoleSelect = ({ control, roleTree }: RoleSelectProps) => {
  const t = useTranslate()
  const [selectOpen, setSelectOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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
      name='role'
      control={control}
      render={({ field }) => {
        const value = Array.isArray(field.value) ? field.value : []
        
        /**
         * 切换角色选中状态
         */
        const toggleRole = (roleName: string) => {
          const index = value.indexOf(roleName)
          if (index > -1) {
            field.onChange(value.filter((item: string) => item !== roleName))
          } else {
            field.onChange([...value, roleName])
          }
        }

        /**
         * 渲染树节点（递归处理所有层级）
         */
        const renderRoleNode = (role: RoleTreeNode, level: number = 0) => {
          const hasChildren = role.children && role.children.length > 0
          const isExpanded = expandedIds.has(role.id)
          const isChecked = value.indexOf(role.name) > -1

          return (
            <Box key={role.id}>
              <Box
                className={classnames('flex items-center gap-2 p-2 hover:bg-actionHover transition-colors', {
                  'bg-actionHover': false
                })}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={() => toggleRole(role.name)}
                  size='small'
                  onClick={e => e.stopPropagation()}
                />
                {hasChildren ? (
                  <Box
                    className='cursor-pointer'
                    onClick={() => toggleExpand(role.id)}
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
                    'text-primary': isChecked
                  })}
                  onClick={() => toggleRole(role.name)}
                >
                  {role.name}
                  {hasChildren && ` (${role.children?.length || 0})`}
                </Typography>
              </Box>
              {hasChildren && isExpanded && (
                <Box>{role.children!.map(child => renderRoleNode(child, level + 1))}</Box>
              )}
            </Box>
          )
        }

        return (
          <FormControl fullWidth>
            <InputLabel>{t('admin.relatedRole')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              multiple
              label={t('admin.relatedRole')}
              value={value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              renderValue={selected => (
                <Box className='flex flex-wrap gap-1'>
                  {(selected as string[]).map(val => (
                    <Chip
                      key={val}
                      label={val}
                      size='small'
                      onDelete={e => {
                        e.stopPropagation()
                        const newValue = value.filter((item: string) => item !== val)
                        field.onChange(newValue)
                      }}
                      onMouseDown={e => e.stopPropagation()}
                    />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                    width: 300
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

export default RoleSelect

