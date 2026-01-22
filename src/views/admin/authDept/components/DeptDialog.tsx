'use client'

// React Imports
import { useEffect } from 'react'

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
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { Controller, useForm } from 'react-hook-form'

// Component Imports
import DepartmentSelect from '@/views/admin/authUser/components/DepartmentSelect'
import type { DepartmentNode } from '@/views/admin/authUser/components/DepartmentTree'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Third-party Imports
import { toast } from 'react-toastify'

// Type Imports
import type { FlatDeptData } from './utils'
import { findDeptNode } from './utils'

interface DeptDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 部门数据（编辑时传入） */
  deptData?: FlatDeptData | null
  /** 父部门数据（新增子部门时传入） */
  parentDept?: FlatDeptData | null
  /** 部门树数据 */
  deptTree: DepartmentNode[]
}

/**
 * 部门编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param deptData - 部门数据
 * @param parentDept - 父部门数据
 * @param deptTree - 部门树数据
 */
const DeptDialog = ({ open, onClose, onSave, deptData, parentDept, deptTree }: DeptDialogProps) => {
  const t = useTranslate()
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      parentId: '',
      deptName: '',
      leader: '',
      phone: '',
      email: '',
      orderNum: 0,
      status: '1'
    }
  })

  const parentDeptPath = watch('parentId')

  /**
   * 构建部门路径
   */
  const buildDeptPath = (targetId: string | number, nodes: DepartmentNode[], path: string[] = []): string[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node.deptName]
      if (String(node.deptId) === String(targetId)) {
        return currentPath
      }
      if (node.children) {
        const found = buildDeptPath(targetId, node.children, currentPath)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (deptData) {
      // 编辑模式：查找父部门路径
      let parentPath = ''
      if (deptData.parentId) {
        const path = buildDeptPath(deptData.parentId, deptTree)
        if (path) {
          parentPath = path.join(' / ')
        }
      }
      reset({
        parentId: parentPath,
        deptName: deptData.deptName || '',
        leader: deptData.leader || '',
        phone: deptData.phone || '',
        email: deptData.email || '',
        orderNum: deptData.orderNum || 0,
        status: String(deptData.status) || '1'
      })
    } else if (parentDept) {
      // 新增子部门模式：设置父部门
      const path = buildDeptPath(parentDept.deptId, deptTree)
      reset({
        parentId: path ? path.join(' / ') : '',
        deptName: '',
        leader: '',
        phone: '',
        email: '',
        orderNum: 0,
        status: '1'
      })
    } else {
      // 新增根部门
      reset({
        parentId: '',
        deptName: '',
        leader: '',
        phone: '',
        email: '',
        orderNum: 0,
        status: '1'
      })
    }
  }, [deptData, parentDept, deptTree, reset, open])

  /**
   * 根据部门路径字符串找到部门ID
   */
  const findDepartmentIdByPath = (pathString: string): number | null => {
    if (!pathString || !deptTree.length) return null

    const pathParts = pathString.split(' / ')
    if (pathParts.length === 0) return null

    const findNode = (nodes: DepartmentNode[], targetName: string): DepartmentNode | null => {
      for (const node of nodes) {
        if (node.deptName === targetName) {
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
    const node = findNode(deptTree, targetName)

    return node ? Number(node.deptId) : null
  }

  /**
   * 提交表单
   */
  const onSubmit = (data: any) => {
    const parentId = data.parentId ? findDepartmentIdByPath(data.parentId) : 0

    const submitData: any = {
      deptName: data.deptName || '',
      parentId: parentId || 0,
      orderNum: Number(data.orderNum) || 0,
      status: data.status || '1',
      leader: data.leader || '',
      phone: data.phone || '',
      email: data.email || ''
    }

    if (deptData) {
      submitData.deptId = deptData.deptId
    }

    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {deptData ? t('admin.editDept') : t('admin.addDept')}
        <IconButton size='small' onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DepartmentSelect control={control} departments={deptTree} name='parentId' />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='deptName'
                control={control}
                rules={{ required: t('admin.enterDeptName') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.deptName')}
                    required
                    placeholder={t('admin.fillDeptName')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='leader'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label='负责人'
                    placeholder='请选择'
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Box
                          className='cursor-pointer text-primary px-2'
                          onClick={() => {
                            // TODO: 实现负责人选择功能
                            toast.info('负责人选择功能待实现')
                          }}
                        >
                          请选择
                        </Box>
                      )
                    }}
                  />
                )}
              />
            </Grid> */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='phone'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.phone')}
                    placeholder={t('admin.enterPhone')}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='orderNum'
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
                name='email'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.email')}
                    placeholder={t('admin.enterEmail')}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Box className='flex items-center gap-2'>
                    <Typography>{t('admin.deptStatus')}</Typography>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('admin.cancel')}</Button>
          <Button type='submit' variant='contained'>
            {deptData ? t('admin.save') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default DeptDialog
