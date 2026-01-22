'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { Controller, useForm } from 'react-hook-form'

// API Imports
import { resetMemberPassword } from '@server/userManagementTable'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Utils Imports
import { toast } from 'react-toastify'

interface ResetPasswordDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 用户ID */
  userId: number
  /** 用户名称（用于显示） */
  userName?: string
  /** 保存成功回调 */
  onSuccess?: () => void
}

/**
 * 重置密码对话框组件
 */
const ResetPasswordDialog = ({ open, onClose, userId, userName, onSuccess }: ResetPasswordDialogProps) => {
  const t = useTranslate()
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  /**
   * 关闭对话框并重置表单
   */
  const handleClose = () => {
    reset()
    setIsNewPasswordShown(false)
    setIsConfirmPasswordShown(false)
    onClose()
  }

  /**
   * 提交表单
   */
  const onSubmit = async (data: { newPassword: string; confirmNewPassword: string }) => {
    // 验证两次密码是否一致
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    // 验证密码长度（根据实际需求调整）
    if (data.newPassword.length < 6) {
      toast.error('密码长度至少为6位')
      return
    }

    try {
      setLoading(true)
      await resetMemberPassword(userId, data.newPassword, data.confirmNewPassword)
      toast.success('密码修改成功')
      handleClose()
      onSuccess?.()
    } catch (error: any) {
      console.error('密码修改失败:', error)
      toast.error(error?.message || '密码修改失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog fullWidth maxWidth='sm' open={open} onClose={handleClose}>
      <DialogTitle className='flex items-center justify-between'>
        修改密码
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {userName && (
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='用户名称'
                  value={userName}
                  disabled
                  variant='outlined'
                />
              </Grid>
            </Grid>
          )}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='newPassword'
                control={control}
                rules={{
                  required: '请输入新密码',
                  minLength: {
                    value: 6,
                    message: '密码长度至少为6位'
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={isNewPasswordShown ? 'text' : 'password'}
                    label='新密码'
                    required
                    placeholder='请输入新密码'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              size='small'
                              edge='end'
                              onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <i className={isNewPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='confirmNewPassword'
                control={control}
                rules={{
                  required: '请确认新密码',
                  validate: (value, formValues) => {
                    if (value !== formValues.newPassword) {
                      return '两次输入的密码不一致'
                    }
                    return true
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={isConfirmPasswordShown ? 'text' : 'password'}
                    label='确认新密码'
                    required
                    placeholder='请再次输入新密码'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              size='small'
                              edge='end'
                              onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='gap-2'>
          <Button variant='outlined' onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? '提交中...' : '确定'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ResetPasswordDialog


