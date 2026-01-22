'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Third-party Imports
import { Plus } from 'lucide-react'
import TabFilters, { type SearchData } from '@/components/table/tableFilters'

// Utils Imports
import { JOB_GROUP_OPTIONS, STATUS_OPTIONS } from '../utils'

// Type Imports
interface SearchFiltersProps {
  /** 搜索参数 */
  params: {
    jobName?: string
    jobGroup?: string
    status?: string
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 重置回调 */
  onReset?: () => void
  /** 新增任务回调 */
  onAdd?: () => void
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onReset - 重置回调
 * @param onAdd - 新增任务回调
 */
const SearchFilters = ({ params, onSearchChange, onReset, onAdd }: SearchFiltersProps) => {
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'jobName',
        placeholder: '请输入任务名称'
      },
      {
        type: 'select',
        name: 'jobGroup',
        label: '任务组名',
        placeholder: '请选择任务组名',
        options: JOB_GROUP_OPTIONS
      },
      {
        type: 'select',
        name: 'status',
        label: '状态',
        placeholder: '请选择状态',
        options: STATUS_OPTIONS
      }
    ],
    []
  )

  return (
    <>
      <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData} />
      <CardContent>
        <Box className='flex items-center gap-2 flex-wrap'>
          <Button variant='contained' color='primary' startIcon={<Plus size={16} />} onClick={onAdd}>
            新增
          </Button>
        </Box>
      </CardContent>
    </>
  )
}

export default SearchFilters
