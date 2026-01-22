'use client'

// React Imports
import { useEffect, useState, useCallback } from 'react'

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
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import { Controller, useForm } from 'react-hook-form'
import { X, HelpCircle } from 'lucide-react'

// API Imports
import { getSysJobDetail } from '@server/admin'
import { toast } from 'react-toastify'

// Type Imports
import { MISFIRE_POLICY_OPTIONS, STATUS_FORM_OPTIONS, JOB_GROUP_OPTIONS, CRON_EXAMPLES } from '../utils'

interface JobDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 保存回调 */
  onSave?: (data: any) => void
  /** 任务ID（编辑时传入） */
  jobId?: number | null
}

/**
 * 任务编辑/新增对话框组件
 * @param open - 是否打开
 * @param onClose - 关闭回调
 * @param onSave - 保存回调
 * @param jobId - 任务ID（编辑时传入）
 */
const JobDialog = ({ open, onClose, onSave, jobId }: JobDialogProps) => {
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      jobName: '',
      jobParams: '',
      jobGroup: '',
      invokeTarget: '',
      cronExpression: '',
      misfirePolicy: '1',
      status: '0',
      remark: ''
    }
  })

  /**
   * 加载任务详情
   */
  const loadJobDetail = useCallback(async () => {
    if (!jobId) {
      // 新增模式，重置表单
      reset({
        jobName: '',
        jobParams: '',
        jobGroup: '',
        invokeTarget: '',
        cronExpression: '',
        misfirePolicy: '1',
        status: '0',
        remark: ''
      })
      return
    }

    try {
      setLoading(true)
      const res = await getSysJobDetail({ jobId })
      const detail = res.data || {}

      reset({
        jobName: detail.jobName || '',
        jobParams: detail.jobParams || '',
        jobGroup: detail.jobGroup || '',
        invokeTarget: detail.invokeTarget || '',
        cronExpression: detail.cronExpression || '',
        misfirePolicy: String(detail.misfirePolicy) || '1',
        status: String(detail.status) || '1',
        remark: detail.remark || ''
      })
    } catch (error) {
      console.error('加载任务详情失败:', error)
      toast.error('加载任务详情失败')
    } finally {
      setLoading(false)
    }
  }, [jobId, reset])

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (open) {
      loadJobDetail()
    }
  }, [open, loadJobDetail])

  /**
   * 提交表单
   */
  const onSubmit = (data: any) => {
    const submitData = {
      jobId: jobId || 0,
      ...data,
      misfirePolicy: Number(data.misfirePolicy),
      status: Number(data.status)
    }

    onSave?.(submitData)
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle className='flex items-center justify-between'>
        {jobId ? '修改定时任务' : '添加定时任务'}
        <IconButton size='small' onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {loading ? (
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <Skeleton variant='text' width='30%' height={20} className='mb-2' />
                <Skeleton variant='rectangular' width='100%' height={56} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex items-center gap-1 mb-2'>
                  <Skeleton variant='text' width={80} height={20} />
                  <Skeleton variant='circular' width={16} height={16} />
                </Box>
                <Skeleton variant='rectangular' width='100%' height={56} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex items-center gap-1 mb-2'>
                  <Skeleton variant='text' width={80} height={20} />
                  <Skeleton variant='circular' width={16} height={16} />
                </Box>
                <Skeleton variant='rectangular' width='100%' height={56} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex items-center gap-1 mb-2'>
                  <Skeleton variant='text' width={100} height={20} />
                  <Skeleton variant='circular' width={16} height={16} />
                </Box>
                <Skeleton variant='rectangular' width='100%' height={56} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Skeleton variant='text' width='40%' height={20} className='mb-2' />
                <Skeleton variant='rectangular' width='100%' height={56} />
                <Box className='mt-2 p-3 bg-gray-50 rounded'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} variant='text' width={`${60 + index * 5}%`} height={20} className='mb-1' />
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Skeleton variant='text' width='30%' height={20} className='mb-2' />
                <Box className='flex gap-4'>
                  <Skeleton variant='rectangular' width={100} height={40} />
                  <Skeleton variant='rectangular' width={100} height={40} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Skeleton variant='text' width='20%' height={20} className='mb-2' />
                <Box className='flex gap-4'>
                  <Skeleton variant='rectangular' width={80} height={40} />
                  <Skeleton variant='rectangular' width={80} height={40} />
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='jobName'
                  control={control}
                  rules={{ required: '请输入任务名称' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      fullWidth
                      label='任务名称'
                      required
                      placeholder='请输入任务名称'
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex items-center gap-1'>
                  <FormLabel>执行参数</FormLabel>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant='body2'>以|分隔多个参数</Typography>
                        <Typography variant='body2'>示例: param1|param2</Typography>
                        <Typography variant='body2' sx={{ mt: 1 }}>
                          参数说明:支持字符串,布尔类型,长整型,浮点型,整型
                        </Typography>
                      </Box>
                    }
                    arrow
                  >
                    <HelpCircle size={16} className='text-gray-400 cursor-pointer' />
                  </Tooltip>
                </Box>
                <Controller
                  name='jobParams'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} fullWidth placeholder='请输入参数' sx={{ mt: 1 }} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex items-center gap-1'>
                  <FormLabel>任务组名</FormLabel>
                  <Tooltip title='示例: demo1' arrow>
                    <HelpCircle size={16} className='text-gray-400 cursor-pointer' />
                  </Tooltip>
                </Box>
                <Controller
                  name='jobGroup'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <Select
                        {...field}
                        displayEmpty
                        value={field.value || ''}
                        renderValue={value => {
                          if (!value || value === '') {
                            return <span style={{ color: '#9e9e9e' }}>请选择任务组名</span>
                          }
                          const selectedOption = JOB_GROUP_OPTIONS.find(opt => opt.value === value)
                          return selectedOption?.label || value
                        }}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.23)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.87)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        {JOB_GROUP_OPTIONS.filter(option => option.value !== '').map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box className='flex items-center gap-1'>
                  <FormLabel required>任务方法</FormLabel>
                  <Tooltip title='示例: demo1' arrow>
                    <HelpCircle size={16} className='text-gray-400 cursor-pointer' />
                  </Tooltip>
                </Box>
                <Controller
                  name='invokeTarget'
                  control={control}
                  rules={{ required: '请输入任务方法' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      fullWidth
                      required
                      placeholder='请输入任务方法'
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormLabel>cron执行表达式</FormLabel>
                <Controller
                  name='cronExpression'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      fullWidth
                      placeholder='请输入cron执行表达式'
                      sx={{ mt: 1 }}
                    />
                  )}
                />
                <Box className='mt-2 p-3 bg-gray-50 rounded'>
                  {CRON_EXAMPLES.map((example, index) => (
                    <Typography key={index} variant='body2' className='text-gray-600 mb-1'>
                      {example.expression}: {example.description}
                    </Typography>
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormLabel component='legend'>计划执行策略</FormLabel>
                <Controller
                  name='misfirePolicy'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row sx={{ mt: 1 }}>
                      {MISFIRE_POLICY_OPTIONS.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormLabel component='legend' required>
                  状态
                </FormLabel>
                <Controller
                  name='status'
                  control={control}
                  rules={{ required: '请选择状态' }}
                  render={({ field }) => (
                    <RadioGroup {...field} row sx={{ mt: 1 }}>
                      {STATUS_FORM_OPTIONS.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
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
                      label='备注信息'
                      placeholder='请输入备注信息'
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant='outlined' disabled={loading}>
            取消
          </Button>
          <Button type='submit' variant='contained' disabled={loading}>
            确定
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default JobDialog
