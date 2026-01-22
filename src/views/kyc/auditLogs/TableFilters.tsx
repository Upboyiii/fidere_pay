import TabFilters, { SearchData } from '@components/table/tableFilters'
import { useTranslate } from '@/contexts/DictionaryContext'
import { useState, useEffect, forwardRef } from 'react'
import Grid from '@mui/material/Grid2'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { Calendar } from 'lucide-react'
import InputAdornment from '@mui/material/InputAdornment'
import { formatDate } from 'date-fns'

type TableFiltersProps = {
  onSearchChange?: (data: any) => void
  params: any
}

type CustomInputProps = {
  label?: string
  start?: Date | null
  end?: Date | null
  value?: string
  onClick?: () => void
  placeholder?: string
}

/**
 * 自定义日期范围输入组件
 */
const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
  const { start, end, label, onClick, placeholder } = props
  const startDate = start ? formatDate(start, 'yyyy-MM-dd') : ''
  const endDate = end ? formatDate(end, 'yyyy-MM-dd') : ''
  const value = startDate && endDate ? `${startDate} - ${endDate}` : startDate || ''

  return (
    <TextField
      fullWidth
      inputRef={ref}
      label={label}
      placeholder={placeholder}
      value={value}
      onClick={onClick}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <Calendar size={16} />
            </InputAdornment>
          ),
          readOnly: true
        }
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: '56px'
        }
      }}
    />
  )
})

CustomInput.displayName = 'CustomInput'

const TableFilters = ({ onSearchChange, params }: TableFiltersProps) => {
  const t = useTranslate()
  // 从 params.dateRange 数组或 params.startDate/endDate 初始化日期范围
  const getInitialDateRange = (): [Date | null, Date | null] => {
    if (params.dateRange && Array.isArray(params.dateRange) && params.dateRange.length >= 2) {
      return [
        params.dateRange[0] ? new Date(params.dateRange[0]) : null,
        params.dateRange[1] ? new Date(params.dateRange[1]) : null
      ]
    }
    if (params.startDate && params.endDate) {
      return [new Date(params.startDate), new Date(params.endDate)]
    }
    return [null, null]
  }

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(getInitialDateRange())

  /**
   * 同步 params 变化到日期范围
   */
  useEffect(() => {
    if (params.dateRange && Array.isArray(params.dateRange) && params.dateRange.length >= 2) {
      setDateRange([
        params.dateRange[0] ? new Date(params.dateRange[0]) : null,
        params.dateRange[1] ? new Date(params.dateRange[1]) : null
      ])
    } else if (params.startDate && params.endDate) {
      setDateRange([new Date(params.startDate), new Date(params.endDate)])
    } else {
      setDateRange([null, null])
    }
  }, [params.dateRange, params.startDate, params.endDate])

  /**
   * 处理日期范围变化
   */
  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    setDateRange(dates)
    const [startDate, endDate] = dates
    // 转换为 dateRange 数组格式
    const dateRangeArray: string[] = []
    if (startDate) {
      dateRangeArray.push(formatDate(startDate, 'yyyy-MM-dd'))
    }
    if (endDate) {
      dateRangeArray.push(formatDate(endDate, 'yyyy-MM-dd'))
    }

    // 移除旧的 startDate 和 endDate，使用 dateRange
    const { startDate: _, endDate: __, ...restParams } = params
    onSearchChange?.({
      ...restParams,
      dateRange: dateRangeArray.length > 0 ? dateRangeArray : undefined
    })
  }

  const searchData: SearchData[] = [
    {
      name: 'operName',
      type: 'input',
      label: t('auditLogs.operator'), // 操作人员
      placeholder: t('auditLogs.searchOperator') // 搜索操作人员
    },
    // {
    //   name: 'operUrl',
    //   type: 'input',
    //   label: t('auditLogs.requestUrl'), // 请求URL
    //   placeholder: t('auditLogs.searchRequestUrl') // 搜索请求URL
    // },
    {
      name: 'requestMethod',
      type: 'select',
      label: t('auditLogs.requestMethod'), // 请求方式
      placeholder: t('auditLogs.allRequestMethods'), // 全部请求方式
      options: [
        { label: t('auditLogs.allRequestMethods'), value: '' }, // 全部请求方式
        { label: t('auditLogs.add'), value: 'POST' }, // 新增
        { label: t('auditLogs.read'), value: 'GET' }, // 读取
        { label: t('auditLogs.update'), value: 'PUT' }, // 修改
        { label: t('auditLogs.deleteAction'), value: 'DELETE' } // 删除
      ]
    }
  ] as const

  return (
    <>
      <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData as unknown as any[]} />
      {/* <Grid container spacing={5} sx={{ px: 4, pb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <AppReactDatepicker
              selected={dateRange[0]}
              onChange={handleDateRangeChange}
              startDate={dateRange[0] || undefined}
              endDate={dateRange[1] || undefined}
              selectsRange
              dateFormat='yyyy-MM-dd'
              placeholderText='开始日期 - 结束日期'
              shouldCloseOnSelect={false}
              customInput={
                <CustomInput
                  label={t('auditLogs.operationTime')}
                  start={dateRange[0]}
                  end={dateRange[1]}
                  placeholder='开始日期 - 结束日期'
                />
              }
            />
          </FormControl>
        </Grid>
      </Grid> */}
    </>
  )
}

export default TableFilters
