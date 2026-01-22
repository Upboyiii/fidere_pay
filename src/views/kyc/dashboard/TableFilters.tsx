// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { TextFieldProps } from '@mui/material/TextField'
import TextField from '@mui/material/TextField'
import { useTranslate } from '@/contexts/DictionaryContext'
// Type Imports
type PendingReview = {
  id: string
  client: string
  reviewType: string
  priority: string
  dueDate: string
  assignedTo: string
  status: string
  submitTime: string
  riskLevel: string
  accountType: string
  overdueDays?: number
}

type RejectedCase = {
  id: string
  type: string
  name: string
  nationality: string
  riskLevel: string
  sumsubStatus: string
  documensoStatus: string
  submitTime: string
  slaRemaining?: string
  returnCount: number
  reviewer: { name: string; avatar: string }
  tempClientNo: string
  status: string
  priority?: string
  completedTime?: string
  rejectReason?: string
  processingTime?: string
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
  setPendingData: (data: PendingReview[]) => void
  setRejectedData: (data: RejectedCase[]) => void
  pendingData?: PendingReview[]
  rejectedData?: RejectedCase[]
  onSearchChange?: (searchQuery: string) => void
}

const TableFilters = ({
  setPendingData,
  setRejectedData,
  pendingData,
  rejectedData,
  onSearchChange
}: TableFiltersProps) => {
  const t = useTranslate()
  // States
  const [priority, setPriority] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [assignee, setAssignee] = useState<string>('')
  const [riskLevel, setRiskLevel] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    // 筛选待处理审核数据
    const filteredPendingData = pendingData?.filter(review => {
      if (priority && review.priority !== priority) return false
      if (status && review.status !== status) return false
      if (assignee && review.assignedTo !== assignee) return false
      if (riskLevel && review.riskLevel !== riskLevel) return false
      return true
    })

    // 筛选拒绝用户数据
    const filteredRejectedData = rejectedData?.filter(case_ => {
      if (riskLevel && case_.riskLevel !== riskLevel) return false
      return true
    })

    setPendingData(filteredPendingData || [])
    setRejectedData(filteredRejectedData || [])
  }, [priority, status, assignee, riskLevel, pendingData, rejectedData, setPendingData, setRejectedData])

  // 处理搜索变化
  const handleSearchChange = (value: string | number) => {
    const searchValue = String(value)
    setSearchQuery(searchValue)
    onSearchChange?.(searchValue)
  }

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth>
            <DebouncedInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('kycDashboard.searchPlaceholder')} // 搜索客户名称、审核类型...
              className='max-sm:is-full'
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '56px' // 匹配 Select 的高度
                }
              }}
            />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth>
            <InputLabel id='priority-select'>{t('kycDashboard.priority')}</InputLabel> {/* 优先级 */}
            <Select
              fullWidth
              id='select-priority'
              value={priority}
              onChange={e => setPriority(e.target.value)}
              label={t('kycDashboard.priority')} // 优先级
              labelId='priority-select'
              inputProps={{ placeholder: t('kycDashboard.selectPriority') }} // 选择优先级
            >
              <MenuItem value=''>{t('kycDashboard.allPriority')}</MenuItem> {/* 全部优先级 */}
              <MenuItem value='Critical'>{t('kycDashboard.critical')}</MenuItem> {/* 紧急 */}
              <MenuItem value='High'>{t('kycDashboard.high')}</MenuItem> {/* 高 */}
              <MenuItem value='Medium'>{t('kycDashboard.medium')}</MenuItem> {/* 中 */}
              <MenuItem value='Low'>{t('kycDashboard.low')}</MenuItem> {/* 低 */}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>{t('kycDashboard.status')}</InputLabel> {/* 状态 */}
            <Select
              fullWidth
              id='select-status'
              label={t('kycDashboard.status')} // 状态
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
              inputProps={{ placeholder: t('kycDashboard.selectStatus') }} // 选择状态
            >
              <MenuItem value=''>{t('kycDashboard.allStatus')}</MenuItem> {/* 全部状态 */}
              <MenuItem value='审核中'>{t('kycDashboard.reviewing')}</MenuItem> {/* 审核中 */}
              <MenuItem value='逾期'>{t('kycDashboard.overdue')}</MenuItem> {/* 逾期 */}
              <MenuItem value='待分配'>{t('kycDashboard.unassigned')}</MenuItem> {/* 待分配 */}
              <MenuItem value='已安排'>{t('kycDashboard.assigned')}</MenuItem> {/* 已安排 */}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth>
            <InputLabel id='assignee-select'>{t('kycDashboard.assignee')}</InputLabel> {/* 审核员 */}
            <Select
              fullWidth
              id='select-assignee'
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              label={t('kycDashboard.assignee')} // 审核员
              labelId='assignee-select'
              inputProps={{ placeholder: t('kycDashboard.selectAssignee') }} // 选择审核员
            >
              <MenuItem value=''>{t('kycDashboard.allAssignees')}</MenuItem> {/* 全部审核员 */}
              <MenuItem value='李审核员'>李审核员</MenuItem>
              <MenuItem value='王审核员'>王审核员</MenuItem>
              <MenuItem value='陈审核员'>陈审核员</MenuItem>
              <MenuItem value='赵审核员'>赵审核员</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
