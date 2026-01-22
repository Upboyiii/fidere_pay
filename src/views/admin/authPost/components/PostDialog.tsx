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
import IconButton from '@mui/material/IconButton'
import { Controller, useForm } from 'react-hook-form'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { PostData } from './PostTable'

interface PostDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 岗位数据（编辑时传入） */
  postData?: PostData | null
}

/**
 * 岗位编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param postData - 岗位数据
 */
const PostDialog = ({ open, onClose, onSave, postData }: PostDialogProps) => {
  const t = useTranslate()
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      postCode: '',
      postName: '',
      postSort: 0,
      status: '1',
      remark: ''
    }
  })

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (postData) {
      reset({
        postCode: postData.postCode || '',
        postName: postData.postName || '',
        postSort: postData.postSort || 0,
        status: String(postData.status) || '1',
        remark: postData.remark || ''
      })
    } else {
      reset({
        postCode: '',
        postName: '',
        postSort: 0,
        status: '1',
        remark: ''
      })
    }
  }, [postData, reset, open])

  /**
   * 提交表单
   */
  const onSubmit = (data: any) => {
    const submitData: any = {
      postCode: data.postCode || '',
      postName: data.postName || '',
      postSort: Number(data.postSort) || 0,
      status: data.status || '1',
      remark: data.remark || '',
      postId: postData?.postId || 0
    }

    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {postData ? t('admin.editPost') : t('admin.addPost')}
        <IconButton size='small' onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='postName'
                control={control}
                rules={{ required: t('admin.enterPostName') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.postName')}
                    required
                    placeholder={t('admin.fillPostName')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='postCode'
                control={control}
                rules={{ required: t('admin.enterPostCode') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.postCode')}
                    required
                    placeholder={t('admin.fillPostCode')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    // disabled={!!postData}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='postSort'
                control={control}
                rules={{ required: t('admin.enterSort') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? 0}
                    fullWidth
                    type='number'
                    label={t('admin.sort')}
                    required
                    placeholder={t('admin.enterSort')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('admin.postStatus')}</InputLabel>
                    <Select {...field} value={field.value ?? '1'} label={t('admin.postStatus')}>
                      <MenuItem value={1}>{t('admin.enabled')}</MenuItem>
                      <MenuItem value={0}>{t('admin.disabled')}</MenuItem>
                    </Select>
                  </FormControl>
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
                    rows={4}
                    label={t('admin.postDescription')}
                    placeholder={t('admin.enterPostDescription')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('admin.cancel')}</Button>
          <Button type='submit' variant='contained'>
            {postData ? t('admin.save') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default PostDialog
