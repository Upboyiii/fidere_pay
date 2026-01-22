'use client'

// React Imports
import { useEffect, useMemo, memo } from 'react'

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

// Component Imports
import DictTypeTreeSelect from './DictTypeTreeSelect'

// Type Imports
import type { DictData } from './DictTable'
import type { DictTypeNode } from '../utils'
import { FORM_DEFAULT_VALUES, findNodeById } from '../utils'

interface DictDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 字典数据（编辑时传入） */
  dictData?: DictData | null
  /** 字典类型树数据 */
  dictTypeTree?: DictTypeNode[]
  /** 当前选中的字典类型ID */
  selectedTypeId?: string | number
}

/**
 * 字典编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param dictData - 字典数据
 * @param dictTypeTree - 字典类型树数据
 * @param selectedTypeId - 当前选中的字典类型ID
 */
const DictDialog = memo(({ open, onClose, onSave, dictData, dictTypeTree = [], selectedTypeId }: DictDialogProps) => {
  const t = useTranslate()
  const { control, handleSubmit, reset } = useForm({
    defaultValues: FORM_DEFAULT_VALUES
  })

  /**
   * 计算默认字典类型
   */
  const defaultDictType = useMemo(() => {
    if (selectedTypeId && dictTypeTree.length > 0) {
      const selectedNode = findNodeById(dictTypeTree, Number(selectedTypeId))
      return selectedNode?.dictType || ''
    }
    return ''
  }, [selectedTypeId, dictTypeTree])

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (dictData) {
      // 编辑模式：使用字典数据
      reset({
        dictType: dictData.dictType || '',
        dictLabel: dictData.dictLabel || '',
        dictValue: dictData.dictValue || '',
        dictSort: dictData.dictSort || 0,
        cssClass: '',
        listClass: '',
        isDefault: (dictData as any).isDefault ?? 0,
        status: dictData.status ?? 1,
        remark: dictData.remark || ''
      })
    } else {
      // 新增模式：如果有选中的字典类型，设置默认值
      reset({
        ...FORM_DEFAULT_VALUES,
        dictType: defaultDictType
      })
    }
  }, [dictData, reset, open, defaultDictType])

  /**
   * 提交表单
   */
  const onSubmit = (data: typeof FORM_DEFAULT_VALUES) => {
    const submitData = {
      dictCode: dictData?.dictCode || 0,
      ...data
    }

    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {dictData ? t('admin.editDict') : t('admin.addDict')}
        <IconButton size='small' onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <DictTypeTreeSelect control={control} dictTypeTree={dictTypeTree} name='dictType' required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='dictLabel'
                control={control}
                rules={{ required: t('admin.enterDictLabel') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.dictLabel')}
                    required
                    placeholder={t('admin.fillDictLabel')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='dictValue'
                control={control}
                rules={{ required: t('admin.enterDictValue') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={t('admin.dictValue')}
                    required
                    placeholder={t('admin.fillDictValue')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='dictSort'
                control={control}
                rules={{ required: t('admin.enterDictSort') }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? 0}
                    fullWidth
                    type='number'
                    label={t('admin.dictSort')}
                    required
                    placeholder={t('admin.fillDictSort')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormLabel component='legend'>{t('admin.systemDefault')}</FormLabel>
              <Controller
                name='isDefault'
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row sx={{ mt: 1 }} value={field.value ?? 0}>
                    <FormControlLabel value={1} control={<Radio />} label={t('admin.yes')} />
                    <FormControlLabel value={0} control={<Radio />} label={t('admin.no')} />
                  </RadioGroup>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormLabel component='legend'>{t('admin.status')}</FormLabel>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row sx={{ mt: 1 }} value={field.value ?? 1}>
                    <FormControlLabel value={1} control={<Radio />} label={t('admin.enabled')} />
                    <FormControlLabel value={0} control={<Radio />} label={t('admin.disabled')} />
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
            {dictData ? t('admin.edit') : t('admin.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
})

DictDialog.displayName = 'DictDialog'

export default DictDialog
