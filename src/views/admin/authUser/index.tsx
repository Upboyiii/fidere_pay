'use client'

// React Imports
import { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
// Component Imports
import DepartmentTree, { type DepartmentNode } from './components/DepartmentTree'
import SearchFilters from './components/SearchFilters'
import UserTable, { type UserData } from './components/UserTable'
import UserDialog from './components/UserDialog'
import { TableInstance } from '@/components/table'
import {
  getDepartmentTree,
  getUserList,
  updateUserStatus,
  deleteUserApi,
  resetPwdUser,
  addUserApi,
  editUser
} from '@server/admin'
import { setFeeConfig } from '@server/otc-api'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

/**
 * 用户管理页面
 */
export default function AuthUser() {
  const t = useTranslate()
  // States
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<any>('')
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    mobile: '',
    status: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    deptId: undefined as any
  })
  const [userData, setUserData] = useState<UserData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<UserData | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [treeData, setTreeData] = useState<DepartmentNode[]>([])
  const [treeLoading, setTreeLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const tableRef = useRef<TableInstance>(null)
  
  // 手续费配置相关状态
  const [feeConfigDialogOpen, setFeeConfigDialogOpen] = useState(false)
  const [feeConfigUser, setFeeConfigUser] = useState<UserData | null>(null)
  const [feeConfigData, setFeeConfigData] = useState({
    fixedFee: '',
    ratioFee: '',
    status: 1,
    remark: ''
  })
  useEffect(() => {
    setTreeLoading(true)
    getDepartmentTree({ showOwner: true })
      .then(res => {
        setTreeData(res.data?.deps ?? [])
        setTreeLoading(false)
      })
      .catch(err => {
        console.error(err)
        setTreeLoading(false)
      })
  }, [])

  /**
   * 加载用户数据
   */
  const loadUserData = async (params = {}) => {
    setLoading(true)
    setUserData([])
    try {
      const res = await getUserList({ ...searchParams, ...params })
      setUserData(res.data?.userList ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (error) {
      console.error('加载用户数据失败:', error)
      toast.error(t('admin.loadUserDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 部门选择变化
   */
  const handleDepartmentSelect = useCallback((id: string) => {
    setSelectedDepartmentId(id)
    setSearchParams({
      ...searchParams,
      deptId: id
    })
    loadUserData({
      pageNum: 1,
      pageSize: tableRef?.current?.getState()?.pagination?.pageSize,
      ...searchParams,
      deptId: id
    })
  }, [])

  /**
   * 搜索变化
   */
  const handleSearchChange = (params: typeof searchParams) => {
    setSearchParams(params)
    tableRef?.current?.resetPage?.()
    loadUserData({ pageNum: 1, pageSize: tableRef?.current?.getState()?.pagination?.pageSize, ...params })
  }

  /**
   * 新增用户
   */
  const handleAddUser = useCallback(() => {
    setEditingUser(null)
    setDialogOpen(true)
  }, [])

  /**
   * 编辑用户
   */
  const handleEditUser = useCallback((user: UserData) => {
    setEditingUser(user)
    setDialogOpen(true)
  }, [])

  /**
   * 删除用户
   */
  const handleDeleteUser = useCallback((user: UserData) => {
    setDeleteUser(user)
    setDeleteDialogOpen(true)
  }, [])

  /**
   * 确认删除用户
   */
  const handleConfirmDelete = async () => {
    try {
      setBtnLoading(true)
      const res = await deleteUserApi({ ids: [deleteUser?.id] })
      setDeleteDialogOpen(false)
      setDeleteUser(null)
      loadUserData({ pageNum: 1, pageSize: 10, ...searchParams })
      toast.success(t('admin.operationSuccess'))
    } catch (error) {
      console.error(error)
      toast.error(t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }

  /**
   * 重置密码
   */
  const handleResetPassword = useCallback((user: UserData) => {
    setResetPasswordUser(user)
    setResetPasswordDialogOpen(true)
    setNewPassword('')
    setIsPasswordShown(false)
  }, [])

  /**
   * 切换密码显示/隐藏
   */
  const handleClickShowPassword = () => {
    setIsPasswordShown(!isPasswordShown)
  }

  /**
   * 确认重置密码
   */
  const handleConfirmResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error(t('admin.enterNewPassword'))
      return
    }
    try {
      setBtnLoading(true)
      const res = await resetPwdUser({ userId: resetPasswordUser?.id, password: newPassword })
      setResetPasswordDialogOpen(false)
      setResetPasswordUser(null)
      loadUserData({ pageNum: 1, pageSize: tableRef?.current?.getState()?.pagination?.pageSize, ...searchParams })
      toast.success(t('admin.operationSuccess'))
    } catch (error) {
      console.error(error)
      toast.error(t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }

  /**
   * 状态切换
   */
  const handleStatusChange = useCallback((user: UserData, status: boolean) => {
    setDeleteUser(user)
    setStatusDialogOpen(true)
  }, [])
  /**
   * 确认停用/启用用户
   */
  const handleConfirmStatus = async () => {
    try {
      setBtnLoading(true)
      const res = await updateUserStatus({ userId: deleteUser?.id, status: !deleteUser?.userStatus })
      setStatusDialogOpen(false)
      setDeleteUser(null)
      loadUserData({ pageNum: 1, pageSize: tableRef?.current?.getState()?.pagination?.pageSize, ...searchParams })
      toast.success(t('admin.operationSuccess'))
    } catch (error) {
      console.error(error)
      toast.error(t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }
  /**
   * 保存用户
   */
  const handleSaveUser = async (data: Partial<UserData>) => {
    try {
      const api = data?.userId ? editUser : addUserApi
      const res = await api(data)
      setDialogOpen(false)
      setEditingUser(null)
      toast.success(t('admin.operationSuccess'))
      loadUserData({ pageNum: 1, pageSize: tableRef?.current?.getState()?.pagination?.pageSize, ...searchParams })
    } catch (error: any) {
      toast.error(error?.message || t('admin.operationFailed'))
    }
    // loadUserData({ pageNum: 1, pageSize: 10 })
  }

  /**
   * 分页变化
   */
  const handlePageChange = (params: { pageNum: number; pageSize: number }) => {
    loadUserData({ pageNum: params?.pageNum, pageSize: params?.pageSize, ...searchParams })
  }

  /**
   * 配置手续费
   */
  const handleFeeConfig = useCallback((user: UserData) => {
    setFeeConfigUser(user)
    setFeeConfigData({
      fixedFee: '',
      ratioFee: '',
      status: 1,
      remark: ''
    })
    setFeeConfigDialogOpen(true)
  }, [])

  /**
   * 确认配置手续费
   */
  const handleConfirmFeeConfig = async () => {
    if (!feeConfigUser?.id) return
    
    try {
      setBtnLoading(true)
      await setFeeConfig({
        userId: Number(feeConfigUser.id),
        fixedFee: feeConfigData.fixedFee ? Number(feeConfigData.fixedFee) : undefined,
        ratioFee: feeConfigData.ratioFee ? Number(feeConfigData.ratioFee) : undefined,
        status: feeConfigData.status,
        remark: feeConfigData.remark || undefined
      })
      setFeeConfigDialogOpen(false)
      setFeeConfigUser(null)
      toast.success(t('admin.operationSuccess'))
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || t('admin.operationFailed'))
    } finally {
      setBtnLoading(false)
    }
  }

  // 初始化加载数据
  useEffect(() => {
    loadUserData({ pageNum: 1, pageSize: 10 })
  }, [])

  return (
    <Box className='flex flex-col gap-4 '>
      <Grid container spacing={4}>
        {/* 左侧部门树 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box className='h-[calc(100vh-200px)]'>
            <DepartmentTree
              data={treeData}
              selectedId={selectedDepartmentId}
              loading={treeLoading}
              onSelect={handleDepartmentSelect}
            />
          </Box>
        </Grid>

        {/* 右侧内容区 */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Box className='flex flex-col gap-4'>
            {/* 搜索筛选栏 */}
            <Card>
              <SearchFilters params={searchParams} onSearchChange={handleSearchChange} onAddUser={handleAddUser} />

              {/* 用户表格 */}
              <UserTable
                data={userData}
                loading={loading}
                total={total}
                onPageChange={handlePageChange}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onStatusChange={handleStatusChange}
                onFeeConfig={handleFeeConfig}
                tableRef={tableRef}
              />
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* 用户编辑对话框 */}
      <UserDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingUser(null)
        }}
        onSave={handleSaveUser}
        userData={editingUser}
        departments={treeData}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.confirmDeleteUser')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.confirmDeleteUserMessagePrefix')} <strong>{deleteUser?.userNickname}</strong>{' '}
            {t('admin.confirmDeleteUserMessageSuffix')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('admin.cancel')}</Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error' disabled={btnLoading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      {/* 停用/启用确认对话框 */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle sx={{ width: '400px' }}>
          {deleteUser?.userStatus ? t('admin.disableUser') : t('admin.enableUser')}
        </DialogTitle>
        <DialogContent sx={{ width: '400px' }}>
          <Typography>
            {deleteUser?.userStatus
              ? t('admin.confirmDisableUserMessagePrefix')
              : t('admin.confirmEnableUserMessagePrefix')}{' '}
            <strong>{deleteUser?.userNickname}</strong> {t('admin.confirmDisableUserMessageSuffix')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>{t('admin.cancel')}</Button>
          <Button onClick={handleConfirmStatus} variant='contained' color='error' disabled={btnLoading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 重置密码对话框 */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle className='flex items-center justify-between'>
          {t('admin.resetPasswordTitle')}
          <IconButton size='small' onClick={() => setResetPasswordDialogOpen(false)}>
            <i className='ri-close-line' />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography className='mb-4'>
            {t('admin.resetPasswordMessagePrefix')}
            <strong>"{resetPasswordUser?.userNickname || resetPasswordUser?.userName}"</strong>
            {t('admin.newPassword')}
          </Typography>
          <TextField
            fullWidth
            type={isPasswordShown ? 'text' : 'password'}
            label={t('admin.newPassword')}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder={t('admin.enterNewPassword')}
            autoFocus
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle password visibility'
                    >
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>{t('admin.cancel')}</Button>
          <Button onClick={handleConfirmResetPassword} variant='contained' disabled={btnLoading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 配置手续费对话框 */}
      <Dialog open={feeConfigDialogOpen} onClose={() => setFeeConfigDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle className='flex items-center justify-between'>
          配置手续费
          <IconButton size='small' onClick={() => setFeeConfigDialogOpen(false)}>
            <i className='ri-close-line' />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography className='mb-4' color='text.secondary'>
            为用户 <strong>"{feeConfigUser?.userNickname || feeConfigUser?.userName}"</strong> 配置专属手续费
          </Typography>
          <Box className='flex flex-col gap-4 mt-4'>
            <TextField
              fullWidth
              type='number'
              label='固定手续费'
              value={feeConfigData.fixedFee}
              onChange={e => setFeeConfigData({ ...feeConfigData, fixedFee: e.target.value })}
              placeholder='请输入固定手续费'
              helperText='每笔交易的固定费用'
              slotProps={{
                input: {
                  inputProps: { min: 0, step: 0.01 }
                }
              }}
            />
            <TextField
              fullWidth
              type='number'
              label='比例手续费'
              value={feeConfigData.ratioFee}
              onChange={e => setFeeConfigData({ ...feeConfigData, ratioFee: e.target.value })}
              placeholder='请输入比例手续费，如 0.001'
              helperText='0.001 = 0.1%，即每100元收取0.1元'
              slotProps={{
                input: {
                  inputProps: { min: 0, step: 0.0001 }
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select
                value={feeConfigData.status}
                label='状态'
                onChange={e => setFeeConfigData({ ...feeConfigData, status: e.target.value as number })}
              >
                <MenuItem value={1}>启用</MenuItem>
                <MenuItem value={0}>禁用</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={2}
              label='备注'
              value={feeConfigData.remark}
              onChange={e => setFeeConfigData({ ...feeConfigData, remark: e.target.value })}
              placeholder='请输入备注信息（可选）'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeConfigDialogOpen(false)}>{t('admin.cancel')}</Button>
          <Button onClick={handleConfirmFeeConfig} variant='contained' disabled={btnLoading}>
            {t('admin.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
