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
import { ChevronRight, ChevronDown } from 'lucide-react'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { DepartmentNode } from './DepartmentTree'

interface DepartmentSelectProps {
  /** 表单控制对象 */
  control: Control<any>
  /** 部门列表 */
  departments: DepartmentNode[]
  /** 是否必填 */
  required?: boolean
  /** 错误状态 */
  error?: FieldError
  /** 表单字段名，默认为 'department' */
  name?: string
}

/**
 * 部门选择器组件
 * @param control - 表单控制对象
 * @param departments - 部门列表
 * @param required - 是否必填
 * @param error - 错误状态
 * @param name - 表单字段名，默认为 'department'
 */
const DepartmentSelect = ({ control, departments, required, error, name = 'department' }: DepartmentSelectProps) => {
  const t = useTranslate()
  const [selectOpen, setSelectOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  /**
   * 初始化时展开所有有子节点的部门
   */
  useEffect(() => {
    if (selectOpen && departments.length > 0) {
      const ids = new Set<string>()
      const collectIds = (nodes: DepartmentNode[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            ids.add(node.deptId)
            collectIds(node.children)
          }
        })
      }
      collectIds(departments)
      setExpandedIds(ids)
    }
  }, [selectOpen, departments])

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

  return (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('admin.selectDept') } : {}}
      render={({ field, fieldState }) => {
        const value = field.value ?? ''

        /**
         * 渲染树节点
         */
        const renderDepartmentNode = (dept: DepartmentNode, level: number = 0, parentPath: string[] = []) => {
          const hasChildren = dept.children && dept.children.length > 0
          const isExpanded = expandedIds.has(dept.deptId)
          const currentPath = [...parentPath, dept.deptName]
          const pathString = currentPath.join(' / ')
          const isSelected = value === pathString

          return (
            <Box key={dept.deptId}>
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
                      toggleExpand(dept.deptId)
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
                  {dept.deptName}
                  {hasChildren && ` (${dept.children?.length || 0})`}
                </Typography>
              </Box>
              {hasChildren && isExpanded && (
                <Box>{dept.children!.map(child => renderDepartmentNode(child, level + 1, currentPath))}</Box>
              )}
            </Box>
          )
        }

        return (
          <FormControl fullWidth required={required} error={!!(error || fieldState.error)}>
            <InputLabel>{t('admin.parentDept')}</InputLabel>
            <Select
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              label={t('admin.parentDept')}
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
                    <Typography className='flex-1'>{displayValue}</Typography>
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
                        <i className='ri-close-line text-sm' />
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
              <Box className='p-2'>{departments.map(dept => renderDepartmentNode(dept))}</Box>
            </Select>
          </FormControl>
        )
      }}
    />
  )
}

export default DepartmentSelect
