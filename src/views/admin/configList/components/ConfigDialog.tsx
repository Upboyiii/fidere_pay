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
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import IconButton from '@mui/material/IconButton'
import { Controller, useForm } from 'react-hook-form'
import { X } from 'lucide-react'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Type Imports
import type { ConfigData } from './ConfigTable'
import { FORM_DEFAULT_VALUES } from '../utils'

interface ConfigDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 参数数据（编辑时传入） */
  configData?: ConfigData | null
}

/**
 * 参数编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param configData - 参数数据
 */
const ConfigDialog = ({ open, onClose, onSave, configData }: ConfigDialogProps) => {
  const t = useTranslate()
  const { control, handleSubmit, reset } = useForm({
    defaultValues: FORM_DEFAULT_VALUES
  })

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (configData) {
      reset({
        configName: configData.configName || '',
        configKey: configData.configKey || '',
        configValue: configData.configValue || '',
        configType: configData.configType || '0',
        remark: configData.remark || ''
      })
    } else {
      reset(FORM_DEFAULT_VALUES)
    }
  }, [configData, reset, open])

  /**
   * 提交表单
   */
  const onSubmit = (data: typeof FORM_DEFAULT_VALUES) => {
    const submitData = {
      configId: configData?.configId || 0,
      ...data
    }

    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {configData ? t('admin.editConfig') : t('admin.addConfig')}
        <IconButton size='small' onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='configName'
                control={control}
                rules={{ required: t('admin.enterConfigName') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.configName')}
                    required
                    placeholder={t('admin.fillConfigName')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='configKey'
                control={control}
                rules={{ required: t('admin.enterConfigKey') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.configKey')}
                    required
                    placeholder={t('admin.fillConfigKey')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='configValue'
                control={control}
                rules={{ required: t('admin.enterConfigValue') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.configValue')}
                    required
                    placeholder={t('admin.fillConfigValue')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormLabel component='legend' required>
                {t('admin.systemBuiltIn')}
              </FormLabel>
              <Controller
                name='configType'
                control={control}
                rules={{ required: t('admin.selectSystemBuiltIn') }}
                render={({ field }) => (
                  <RadioGroup {...field} row sx={{ mt: 1 }}>
                    <FormControlLabel value='1' control={<Radio />} label={t('admin.yes')} />
                    <FormControlLabel value='0' control={<Radio />} label={t('admin.no')} />
                  </RadioGroup>
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
                    label={t('admin.remark')}
                    placeholder={t('admin.enterRemark')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant='outlined'>
            {t('admin.cancel')}
          </Button>
          <Button type='submit' variant='contained'>
            {configData ? t('admin.edit') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ConfigDialog
