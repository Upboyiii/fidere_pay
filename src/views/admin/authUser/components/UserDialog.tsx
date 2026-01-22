'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid2'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { Controller, useForm } from 'react-hook-form'

// API Imports
import { getEditUserInfo, getUserParams } from '@server/admin'

// Component Imports
import DepartmentSelect from './DepartmentSelect'
import RoleSelect from './RoleSelect'
import PositionSelect from './PositionSelect'
import PasswordField from './PasswordField'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Utils Imports
import { buildRoleTree, findDepartmentPath, findDepartmentIdByPath, findRoleIdsByNames } from './utils'

// Type Imports
import type { UserData } from './UserTable'
import type { DepartmentNode } from './DepartmentTree'

interface UserDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 用户数据（编辑时传入） */
  userData?: UserData | null
  /** 部门列表 */
  departments?: DepartmentNode[]
}
/**
 * 用户编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param userData - 用户数据
 * @param departments - 部门列表
 */
const UserDialog = ({ open, onClose, onSave, userData, departments = [] }: UserDialogProps) => {
  const t = useTranslate()
  const [allOptions, setAllOptions] = useState<any>({})

  const genderOptions = [
    { value: 1, label: t('admin.male') },
    { value: 2, label: t('admin.female') }
  ]

  /**
   * 转换后的角色树形结构
   */
  const roleTree = useMemo(() => {
    return buildRoleTree(allOptions?.roleList || [])
  }, [allOptions?.roleList])

  /**
   * 初始化时加载选项数据
   */
  useEffect(() => {
    getUserParams()
      .then(res => {
        setAllOptions(res.data)
      })
      .catch(() => {})
  }, [])

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      userName: '',
      userNickname: '',
      department: '',
      email: '',
      position: [] as number[],
      password: '',
      role: [] as string[],
      mobile: '',
      gender: '',
      userStatus: true,
      userType: 1,
      description: ''
    }
  })

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (userData) {
      // 查找部门路径
      let departmentPath = ''
      if (userData.dept?.deptName && departments.length > 0) {
        const path = findDepartmentPath(departments, userData.dept.deptName)
        if (path) {
          departmentPath = path.join(' / ')
        } else {
          departmentPath = userData.dept.deptName
        }
      }
      const infoCode = (_data: any) => {
        reset({
          userName: _data?.user?.userName || userData.userName || '',
          userNickname: _data?.user?.userNickname || userData.userNickname || '',
          department: departmentPath,
          email: _data?.user?.userEmail || (userData as any)?.userEmail || '',
          position: Array.isArray(_data?.checkedPosts) ? _data.checkedPosts : [],
          role: userData.roleInfo?.map((r: any) => r.name) || [],
          mobile: userData.mobile || '',
          gender: _data?.user?.sex || (userData as any).sex,
          userStatus: userData?.userStatus,
          userType: (userData as any).userType || 1,
          description: _data?.user?.remark || (userData as any).description
        })
      }
      getEditUserInfo({ id: userData.id })
        .then(res => {
          infoCode(res?.data)
        })
        .catch(err => {})
    } else {
      reset({
        userName: '',
        userNickname: '',
        department: '',
        email: '',
        position: [],
        password: '',
        role: [],
        mobile: '',
        gender: '',
        userStatus: true,
        userType: 1,
        description: ''
      })
    }
  }, [userData, reset, open, departments])

  /**
   * 提交表单
   */
  const onSubmit = (data: any) => {
    // 转换部门路径为部门ID
    const deptId = findDepartmentIdByPath(data.department, departments)
    if (!deptId) {
      console.error(t('admin.selectDept'))
      return
    }

    // 转换角色名称为角色ID数组
    const roleIds = findRoleIdsByNames(data.role || [], roleTree)

    // 转换岗位ID为数组
    const postIds = Array.isArray(data.position) ? data.position.map((id: any) => Number(id)) : []

    // 转换用户状态
    const status = data.userStatus ? 1 : 0

    // 构建提交数据
    const submitData: any = {
      userId: userData?.id || 0,
      deptId: deptId,
      email: data.email || '',
      isAdmin: data.userType,
      mobile: data.mobile || '',
      nickName: data.userNickname || '',
      password: data.password || '',
      postIds: postIds,
      remark: data.description || '',
      roleIds: roleIds,
      sex: data.gender,
      status: status,
      userName: data.userName || ''
    }

    // 如果是编辑用户且没有修改密码，则不传 password 字段
    if (userData && !data.password) {
      delete submitData.password
    }

    console.log('submitData', submitData)
    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {userData ? t('admin.editUser') : t('admin.addUser')}
        <IconButton size='small' onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* 左列 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='userName'
                control={control}
                rules={{ required: t('admin.enterUserName') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.userName')}
                    required
                    placeholder={t('admin.fillUserName')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={!!userData}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='userNickname'
                control={control}
                rules={{ required: t('admin.userNicknameRequired') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.userNickname')}
                    required
                    placeholder={t('admin.fillUserNickname')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DepartmentSelect control={control} departments={departments} required />
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
              <PositionSelect control={control} positions={allOptions.posts || []} />
            </Grid>

            {/* 右列 */}
            {!userData && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <PasswordField control={control} required />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <RoleSelect control={control} roleTree={roleTree} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='mobile'
                control={control}
                rules={{
                  required: t('admin.enterPhone'),
                  pattern: {
                    value: /^1[3-9]\d{9}$/,
                    message: t('admin.enterPhone')
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.phone')}
                    required
                    placeholder={t('admin.enterPhone')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='gender'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('admin.gender')}</InputLabel>
                    <Select {...field} value={field.value ?? ''} label={t('admin.gender')}>
                      <MenuItem value=''>{t('admin.selectGender')}</MenuItem>
                      {genderOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='userStatus'
                control={control}
                render={({ field }) => (
                  <Box className='flex items-center gap-2'>
                    <Typography>{t('admin.userStatus')}</Typography>
                    <FormControlLabel
                      control={<Switch {...field} checked={!!field.value} color='primary' />}
                      label={field.value ? t('admin.enabled') : t('admin.disabled')}
                      labelPlacement='end'
                    />
                  </Box>
                )}
              />
            </Grid>

            {/* 底部全宽字段 */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name='userType'
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>{t('admin.userType')}</FormLabel>
                    <RadioGroup row {...field} name='userType'>
                      <FormControlLabel value={1} control={<Radio />} label={t('admin.backendAdmin')} />
                      <FormControlLabel value={0} control={<Radio />} label={t('admin.frontendUser')} />
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    multiline
                    rows={4}
                    label={t('admin.userDescription')}
                    placeholder={t('admin.enterUserDescription')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('admin.cancel')}</Button>
          <Button type='submit' variant='contained'>
            {userData ? t('admin.save') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UserDialog
