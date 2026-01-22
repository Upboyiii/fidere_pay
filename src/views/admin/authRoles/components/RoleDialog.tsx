'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import { Controller, useForm } from 'react-hook-form'
import classnames from 'classnames'
import { ChevronRight, ChevronDown, X } from 'lucide-react'
import { getRoleParams } from '@server/admin'

// Component Imports
import RoleSelect from './RoleSelect'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { RoleData, MenuNode, RoleTreeNode } from './utils'

interface RoleDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 角色数据（编辑时传入） */
  roleData?: RoleData | null
  /** 角色树数据 */
  roleTree: RoleTreeNode[]
  /** 菜单树数据 */
  menuTree: MenuNode[]
  /** 入口配置选项 */
  entranceOptions: Array<{ key: string; remark: string }>
}

/**
 * 表单默认值
 */
const defaultFormValues = {
  parentId: '',
  roleName: '',
  roleSort: 0,
  status: '1',
  remark: '',
  effectiveTime: 'none',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  menuIds: [] as (string | number)[],
  entrance: ''
}

/**
 * 角色编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param roleData - 角色数据
 * @param roleTree - 角色树数据
 * @param menuTree - 菜单树数据
 */
const RoleDialog = ({ open, onClose, onSave, roleData, roleTree, menuTree, entranceOptions }: RoleDialogProps) => {
  const t = useTranslate()
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: defaultFormValues
  })

  const [menuExpandedIds, setMenuExpandedIds] = useState<Set<string | number>>(new Set())
  const selectedMenuIds = watch('menuIds') || []

  /**
   * 递归收集菜单树的所有节点ID
   */
  const collectMenuIds = (nodes: MenuNode[], callback: (id: string | number) => void) => {
    nodes.forEach(node => {
      callback(node.id)
      if (node.children) {
        collectMenuIds(node.children, callback)
      }
    })
  }

  /**
   * 构建角色路径
   */
  const buildRolePath = (targetId: string | number, nodes: RoleTreeNode[], path: string[] = []): string[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node.name]
      if (String(node.id) === String(targetId)) {
        return currentPath
      }
      if (node.children) {
        const found = buildRolePath(targetId, node.children, currentPath)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (roleData) {
      // 编辑模式：查找父角色路径
      let parentPath = ''
      const parentId = roleData.parentId ?? roleData.pid
      if (parentId) {
        const path = buildRolePath(parentId, roleTree)
        if (path) {
          parentPath = path.join(' / ')
        }
      }
      getRoleParams({ id: roleData?.id })
        .then(res => {
          reset({ menuIds: res?.data?.menuIds || [] })
        })
        .catch(err => {})

      reset({
        parentId: parentPath,
        roleName: roleData.roleName ?? roleData.name ?? '',
        roleSort: roleData.roleSort ?? roleData.listOrder ?? 0,
        status: String(roleData.status) || '1',
        remark: roleData.remark || '',
        effectiveTime: 'none',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        entrance: (roleData as any).entranceCodes || ''
      })
    } else {
      // 新增模式
      reset(defaultFormValues)
    }
  }, [roleData, roleTree, reset, open])

  /**
   * 根据角色路径字符串找到角色ID
   */
  const findRoleIdByPath = (pathString: string): number | null => {
    if (!pathString || !roleTree.length) return null

    const pathParts = pathString.split(' / ')
    if (pathParts.length === 0) return null

    const findNode = (nodes: RoleTreeNode[], targetName: string): RoleTreeNode | null => {
      for (const node of nodes) {
        if (node.name === targetName) {
          return node
        }
        if (node.children) {
          const found = findNode(node.children, targetName)
          if (found) return found
        }
      }
      return null
    }

    const targetName = pathParts[pathParts.length - 1]
    const node = findNode(roleTree, targetName)

    return node ? Number(node.id) : null
  }

  /**
   * 切换菜单展开/收起
   */
  const toggleMenuExpand = (menuId: string | number) => {
    setMenuExpandedIds(prev => {
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
   * 切换菜单展开/折叠所有
   */
  const toggleMenuExpandAll = () => {
    if (menuExpandedIds.size > 0) {
      setMenuExpandedIds(new Set())
    } else {
      const ids = new Set<string | number>()
      // 只收集有子节点的节点ID
      const collectExpandableIds = (nodes: MenuNode[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            ids.add(node.id)
            collectExpandableIds(node.children)
          }
        })
      }
      collectExpandableIds(menuTree)
      setMenuExpandedIds(ids)
    }
  }

  /**
   * 递归操作子节点（选中或取消选中）
   */
  const operateChildren = (nodes: MenuNode[], selectedIds: (string | number)[], isAdd: boolean) => {
    nodes.forEach(node => {
      const index = selectedIds.findIndex(id => String(id) === String(node.id))
      if (isAdd && index === -1) {
        selectedIds.push(node.id)
      } else if (!isAdd && index > -1) {
        selectedIds.splice(index, 1)
      }
      if (node.children) {
        operateChildren(node.children, selectedIds, isAdd)
      }
    })
  }

  /**
   * 更新父节点状态
   */
  const updateParentNodes = (selectedIds: (string | number)[], isSelecting: boolean): (string | number)[] => {
    const updatedIds = [...selectedIds]

    /**
     * 递归检查并更新节点（从叶子节点向上）
     */
    const checkAndUpdate = (nodes: MenuNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          checkAndUpdate(node.children)

          const allDirectChildrenSelected = node.children.every(child => {
            return updatedIds.some(id => String(id) === String(child.id))
          })
          const isNodeSelected = updatedIds.some(id => String(id) === String(node.id))

          if (isSelecting) {
            // 选中时：所有子节点都被选中，但父节点未选中，则选中父节点
            if (allDirectChildrenSelected && !isNodeSelected) {
              updatedIds.push(node.id)
            }
          } else {
            // 取消选中时：不是所有子节点都被选中，但父节点被选中，则取消选中父节点
            if (!allDirectChildrenSelected && isNodeSelected) {
              const nodeIndex = updatedIds.findIndex(id => String(id) === String(node.id))
              if (nodeIndex > -1) {
                updatedIds.splice(nodeIndex, 1)
              }
            }
          }
        }
      })
    }

    checkAndUpdate(menuTree)
    return updatedIds
  }

  /**
   * 切换菜单选中状态
   */
  const toggleMenuSelect = (menuId: string | number, menu: MenuNode) => {
    const currentIds = [...selectedMenuIds]
    const index = currentIds.findIndex(id => String(id) === String(menuId))
    const isCurrentlySelected = index > -1

    if (isCurrentlySelected) {
      // 取消选中
      currentIds.splice(index, 1)
      // 同时取消选中所有子节点
      if (menu.children) {
        operateChildren(menu.children, currentIds, false)
      }
    } else {
      // 选中
      currentIds.push(menuId)
      // 同时选中所有子节点
      if (menu.children) {
        operateChildren(menu.children, currentIds, true)
      }
    }

    // 更新父节点状态
    const finalIds = updateParentNodes(currentIds, !isCurrentlySelected)
    setValue('menuIds', finalIds)
  }

  /**
   * 全选/全不选菜单
   */
  const toggleMenuSelectAll = () => {
    const allMenuIds: (string | number)[] = []
    collectMenuIds(menuTree, id => allMenuIds.push(id))

    if (selectedMenuIds.length === allMenuIds.length) {
      setValue('menuIds', [])
    } else {
      setValue('menuIds', allMenuIds)
    }
  }

  /**
   * 检查菜单是否选中
   */
  const isMenuSelected = (menuId: string | number): boolean => {
    return selectedMenuIds.some(id => String(id) === String(menuId))
  }

  /**
   * 检查菜单是否部分选中（有子节点被选中）
   */
  const isMenuIndeterminate = (menu: MenuNode): boolean => {
    if (!menu.children || menu.children.length === 0) return false

    const hasSelectedChild = menu.children.some(child => {
      if (isMenuSelected(child.id)) return true
      if (child.children) {
        return isMenuIndeterminate(child)
      }
      return false
    })

    return hasSelectedChild && !isMenuSelected(menu.id)
  }

  /**
   * 渲染菜单树节点
   */
  const renderMenuNode = (menu: MenuNode, level: number = 0) => {
    const hasChildren = menu.children && menu.children.length > 0
    const isExpanded = menuExpandedIds.has(menu.id)
    const isSelected = isMenuSelected(menu.id)
    const isIndeterminate = isMenuIndeterminate(menu)

    return (
      <Box key={menu.id}>
        <Box
          className={classnames('flex items-center gap-2 p-2 hover:bg-actionHover transition-colors', {
            'bg-actionHover': isSelected
          })}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <Checkbox
            checked={isSelected}
            indeterminate={isIndeterminate}
            onChange={() => toggleMenuSelect(menu.id, menu)}
            size='small'
            onClick={e => e.stopPropagation()}
          />
          {hasChildren ? (
            <Box
              className='cursor-pointer'
              onClick={() => toggleMenuExpand(menu.id)}
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
              'text-primary font-medium': isSelected
            })}
            onClick={() => toggleMenuSelect(menu.id, menu)}
          >
            {menu.label}
            {hasChildren && ` (${menu.children?.length || 0})`}
          </Typography>
        </Box>
        {hasChildren && isExpanded && <Box>{menu.children!.map(child => renderMenuNode(child, level + 1))}</Box>}
      </Box>
    )
  }

  /**
   * 提交表单
   */
  const onSubmit = (data: any) => {
    const parentId = data.parentId ? findRoleIdByPath(data.parentId) : 0

    const submitData: any = {
      name: data.roleName || '',
      parentId: parentId || 0,
      roleSort: Number(data.roleSort) || 0,
      status: data.status || '1',
      remark: data.remark || '',
      menuIds: data.menuIds || [],
      entrance: data.entrance || ''
    }

    if (roleData) {
      submitData.id = roleData?.id
    }

    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {roleData ? t('admin.editRole') : t('admin.addRole')}
        <IconButton size='small' onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RoleSelect
                control={control}
                roleTree={roleTree}
                name='parentId'
                excludeRoleId={roleData?.roleId ?? roleData?.id}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='roleName'
                control={control}
                rules={{ required: t('admin.enterRoleName') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.roleName')}
                    required
                    placeholder={t('admin.fillRoleName')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='roleSort'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? 0}
                    fullWidth
                    type='number'
                    label={t('admin.sort')}
                    placeholder={t('admin.enterSort')}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='entrance'
                control={control}
                rules={{ required: t('admin.selectEntranceRequired') }}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth required error={!!fieldState.error}>
                    <InputLabel id='entrance-select'>{t('admin.selectEntrance')}</InputLabel>
                    <Select
                      {...field}
                      id='entrance-select'
                      labelId='entrance-select'
                      value={field.value ?? ''}
                      label={t('admin.selectEntrance')}
                      error={!!fieldState.error}
                    >
                      {entranceOptions.map(option => (
                        <MenuItem key={option.key} value={option.key}>
                          {option.remark}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Box className='flex items-center gap-2'>
                    <Typography>{t('admin.roleStatus')}</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value === '1'}
                          onChange={e => field.onChange(e.target.checked ? '1' : '0')}
                          color='primary'
                        />
                      }
                      label={field.value === '1' ? t('admin.enabled') : t('admin.disabled')}
                      labelPlacement='end'
                    />
                  </Box>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='remark'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    multiline
                    rows={3}
                    label={t('admin.roleDescription')}
                    placeholder={t('admin.enterRoleDescription')}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box className='border rounded p-4'>
                <Box className='flex items-center justify-between mb-4'>
                  <Typography variant='h6'>{t('admin.menuPermission')}</Typography>
                  <Box className='flex items-center gap-4'>
                    <Button size='small' variant='outlined' onClick={toggleMenuExpandAll}>
                      {menuExpandedIds.size > 0 ? t('admin.collapse') : t('admin.expand')}
                    </Button>
                    <Button size='small' variant='outlined' onClick={toggleMenuSelectAll}>
                      {selectedMenuIds.length === 0 ? t('admin.selectAll') : t('admin.unselectAll')}
                    </Button>
                  </Box>
                </Box>
                <Box className='max-h-96 overflow-y-auto border rounded p-2'>
                  {menuTree.map(menu => renderMenuNode(menu))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('admin.cancel')}</Button>
          <Button type='submit' variant='contained'>
            {roleData ? t('admin.save') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RoleDialog
