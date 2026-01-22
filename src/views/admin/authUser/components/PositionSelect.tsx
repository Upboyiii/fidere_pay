'use client'

// React Imports
import { Controller, Control } from 'react-hook-form'

// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

interface PositionOption {
  /** 岗位ID */
  postId: number
  /** 岗位名称 */
  postName: string
}

interface PositionSelectProps {
  /** 表单控制对象 */
  control: Control<any>
  /** 岗位列表 */
  positions: PositionOption[]
}

/**
 * 岗位选择器组件
 * @param control - 表单控制对象
 * @param positions - 岗位列表
 */
const PositionSelect = ({ control, positions }: PositionSelectProps) => {
  const t = useTranslate()
  return (
    <Controller
      name='position'
      control={control}
      render={({ field }) => {
        const value = Array.isArray(field.value) ? field.value : []
        return (
          <FormControl fullWidth>
            <InputLabel>{t('admin.position')}</InputLabel>
            <Select
              multiple
              label={t('admin.position')}
              value={value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              renderValue={selected => (
                <Box className='flex flex-wrap gap-1'>
                  {(selected as number[]).map(val => {
                    const post = positions.find(pos => pos.postId === val)
                    return (
                      <Chip
                        key={val}
                        label={post?.postName || val}
                        size='small'
                        onDelete={e => {
                          e.stopPropagation()
                          const newValue = value.filter((item: number) => item !== val)
                          field.onChange(newValue)
                        }}
                        onMouseDown={e => e.stopPropagation()}
                      />
                    )
                  })}
                </Box>
              )}
            >
              {positions.map(pos => (
                <MenuItem key={pos.postId} value={pos.postId}>
                  <Checkbox checked={value.indexOf(pos.postId) > -1} />
                  <ListItemText primary={pos.postName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      }}
    />
  )
}

export default PositionSelect
