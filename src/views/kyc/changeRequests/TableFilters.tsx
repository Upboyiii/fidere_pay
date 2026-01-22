// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'

// Type Imports
type ChangeRequest = {
  id: string
  userId: string
  userName: string
  requestType: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  changedFields: number
  reviewer?: string
  riskLevel?: string
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

type TableFiltersProps = {
  setData: (data: ChangeRequest[]) => void
  tableData?: ChangeRequest[]
  onSearchChange?: (searchQuery: string) => void
}

const TableFilters = ({ setData, tableData, onSearchChange }: TableFiltersProps) => {
  // States
  const [status, setStatus] = useState<ChangeRequest['status']>('')
  const [priority, setPriority] = useState<ChangeRequest['priority']>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    const filteredData = tableData?.filter(request => {
      if (status && request.status !== status) return false
      if (priority && request.priority !== priority) return false
      return true
    })

    setData(filteredData || [])
  }, [status, priority, tableData, setData])

  // 处理搜索变化
  const handleSearchChange = (value: string | number) => {
    const searchValue = String(value)
    setSearchQuery(searchValue)
    onSearchChange?.(searchValue)
  }

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <DebouncedInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder='搜索工单ID、用户名、用户ID...'
              className='max-sm:is-full'
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '56px'
                }
              }}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>状态筛选</InputLabel>
            <Select
              fullWidth
              id='select-status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              label='状态筛选'
              labelId='status-select'
              inputProps={{ placeholder: '选择状态' }}
            >
              <MenuItem value=''>全部状态</MenuItem>
              <MenuItem value='pending'>待处理</MenuItem>
              <MenuItem value='in_review'>审核中</MenuItem>
              <MenuItem value='approved'>已批准</MenuItem>
              <MenuItem value='rejected'>已拒绝</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='priority-select'>优先级筛选</InputLabel>
            <Select
              fullWidth
              id='select-priority'
              value={priority}
              onChange={e => setPriority(e.target.value)}
              label='优先级筛选'
              labelId='priority-select'
              inputProps={{ placeholder: '选择优先级' }}
            >
              <MenuItem value=''>全部优先级</MenuItem>
              <MenuItem value='urgent'>紧急</MenuItem>
              <MenuItem value='high'>高</MenuItem>
              <MenuItem value='medium'>中</MenuItem>
              <MenuItem value='low'>低</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
