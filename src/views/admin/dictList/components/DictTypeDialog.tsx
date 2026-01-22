'use client'

// React Imports
import { useEffect, memo } from 'react'

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
import type { DictTypeNode } from '../utils'
import DictTypeParentSelect from './DictTypeParentSelect'

interface DictTypeDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 字典类型数据（编辑时传入） */
  dictTypeData?: DictTypeNode | null
  /** 字典类型树数据 */
  dictTypeTree?: DictTypeNode[]
}

/**
 * 字典类型表单默认值
 */
const TYPE_FORM_DEFAULT_VALUES = {
  parentId: '',
  dictName: '',
  dictType: '',
  status: '1',
  remark: ''
}

/**
 * 字典类型编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param dictTypeData - 字典类型数据
 * @param dictTypeTree - 字典类型树数据
 */
const DictTypeDialog = memo(({ open, onClose, onSave, dictTypeData, dictTypeTree = [] }: DictTypeDialogProps) => {
  const t = useTranslate()
  const { control, handleSubmit, reset } = useForm({
    defaultValues: TYPE_FORM_DEFAULT_VALUES
  })

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (dictTypeData) {
      reset({
        parentId: String((dictTypeData as any).pid || (dictTypeData as any).parentId || ''),
        dictName: dictTypeData.dictName || '',
        dictType: dictTypeData.dictType || '',
        status: String((dictTypeData as any).status ?? '1'),
        remark: (dictTypeData as any).remark || ''
      })
    } else {
      reset(TYPE_FORM_DEFAULT_VALUES)
    }
  }, [dictTypeData, reset, open])

  /**
   * 提交表单
   */
  const onSubmit = (data: typeof TYPE_FORM_DEFAULT_VALUES) => {
    const submitData: any = {
      dictName: data.dictName || '',
      dictType: data.dictType || '',
      status: Number(data.status) || 1,
      remark: data.remark || ''
    }

    // 添加上级ID
    if (data.parentId) {
      submitData.pid = Number(data.parentId)
    } else {
      submitData.pid = 0
    }

    // 如果是编辑，添加 dictId
    if (dictTypeData?.dictId) {
      submitData.dictId = dictTypeData.dictId
    }

    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {dictTypeData ? t('admin.editDictType') : t('admin.addDictType')}
        <IconButton size='small' onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <DictTypeParentSelect
                control={control}
                dictTypeTree={dictTypeTree}
                name='parentId'
                excludeDictId={dictTypeData?.dictId}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='dictName'
                control={control}
                rules={{ required: t('admin.enterDictName') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.dictName')}
                    required
                    placeholder={t('admin.fillDictName')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='dictType'
                control={control}
                rules={{ required: t('admin.enterDictType') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.dictType')}
                    required
                    placeholder={t('admin.fillDictType')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={!!dictTypeData}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormLabel component='legend' required>
                {t('admin.status')}
              </FormLabel>
              <Controller
                name='status'
                control={control}
                rules={{ required: t('admin.selectStatus') }}
                render={({ field }) => (
                  <RadioGroup {...field} row sx={{ mt: 1 }}>
                    <FormControlLabel value='1' control={<Radio />} label={t('admin.enabled')} />
                    <FormControlLabel value='0' control={<Radio />} label={t('admin.disabled')} />
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
                    placeholder={t('admin.enterRemarkPlaceholder')}
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
            {dictTypeData ? t('admin.edit') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
})

DictTypeDialog.displayName = 'DictTypeDialog'

export default DictTypeDialog
