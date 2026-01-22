'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { Controller, Control, FieldError } from 'react-hook-form'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

interface PasswordFieldProps {
  /** 表单控制对象 */
  control: Control<any>
  /** 是否禁用 */
  disabled?: boolean
  /** 是否必填 */
  required?: boolean
  /** 错误状态 */
  error?: FieldError
}

/**
 * 密码输入框组件
 * @param control - 表单控制对象
 * @param disabled - 是否禁用
 * @param required - 是否必填
 * @param error - 错误状态
 */
const PasswordField = ({ control, disabled, required, error }: PasswordFieldProps) => {
  const t = useTranslate()
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  /**
   * 切换密码显示/隐藏
   */
  const handleClickShowPassword = () => {
    setIsPasswordShown(!isPasswordShown)
  }

  return (
    <Controller
      name='password'
      control={control}
      rules={required ? { required: t('admin.enterAccountPassword') } : {}}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          fullWidth
          type={isPasswordShown ? 'text' : 'password'}
          label={t('admin.accountPassword')}
          required={required}
          placeholder={t('admin.enterPassword')}
          error={!!(error || fieldState.error)}
          helperText={error?.message || fieldState.error?.message}
          disabled={disabled}
          slotProps={{
            input: {
              endAdornment: !disabled ? (
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
              ) : undefined
            }
          }}
        />
      )}
    />
  )
}

export default PasswordField

