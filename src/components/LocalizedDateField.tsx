'use client'

/**
 * 根据当前语言显示对应格式的日期选择控件
 * 使用 react-datepicker，切换语言后占位符和日历会显示对应语言（如英文显示 MM/dd/yyyy）
 * 解决原生 input type="date" 显示「年/月/日」不随应用语言切换的问题
 */

import { useParams } from 'next/navigation'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { getDateFnsLocaleFromLang } from '@/utils/dateLocale'

type LocalizedDateFieldProps = {
  /** 当前值，格式 YYYY-MM-DD */
  value: string
  /** 值变化回调 */
  onChange: (value: string) => void
  /** 标签文字 */
  label: string
  /** 占位符文字（为空时显示） */
  placeholder?: string
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium'
  /** 是否显示独立标签（使用 Typography 在输入框上方） */
  labelAbove?: boolean
  /** 额外 sx */
  sx?: object
}

export default function LocalizedDateField({
  value,
  onChange,
  label,
  placeholder,
  minDate,
  maxDate,
  disabled,
  size = 'small',
  labelAbove = true,
  sx
}: LocalizedDateFieldProps) {
  const params = useParams()
  const currentLang = (params?.lang as string) || undefined
  const locale = getDateFnsLocaleFromLang(currentLang)
  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  const handleChange = (date: Date | null) => {
    if (!date) {
      onChange('')
      return
    }
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
  }

  const input = (
    <AppReactDatepicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat='yyyy-MM-dd'
      placeholderText={placeholder || 'YYYY-MM-DD'}
      locale={locale}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      customInput={
        <TextField
          fullWidth
          size={size}
          label={labelAbove ? undefined : label}
          placeholder={placeholder}
          disabled={disabled}
          slotProps={{
            input: { readOnly: true }
          }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            ...(sx as object)
          }}
        />
      }
    />
  )

  if (labelAbove) {
    return (
      <Box sx={{ minWidth: '200px', ...(sx as object) }}>
        <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
          {label}
        </Typography>
        {input}
      </Box>
    )
  }

  return (
    <Box sx={{ minWidth: '200px', ...(sx as object) }}>
      {input}
    </Box>
  )
}
