'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

// Third-party Imports
import { Upload } from 'lucide-react'
import TabFilters, { type SearchData } from '@/components/table/tableFilters'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Utils Imports
import { UPLOAD_TYPE_OPTIONS, UPLOAD_DRIVE_OPTIONS } from '../utils'

// Type Imports
interface SearchFiltersProps {
  /** 搜索参数 */
  params: {
    appId?: string
    kind?: string
    drive?: string
    ext?: string
    name?: string
    status?: boolean
  }
  /** 搜索变化回调 */
  onSearchChange?: (data: any) => void
  /** 重置回调 */
  onReset?: () => void
  /** 上传文件回调 */
  onUpload?: () => void
}

/**
 * 搜索筛选栏组件
 * @param params - 搜索参数
 * @param onSearchChange - 搜索变化回调
 * @param onReset - 重置回调
 * @param onUpload - 上传文件回调
 */
const SearchFilters = ({ params, onSearchChange, onReset, onUpload }: SearchFiltersProps) => {
  const t = useTranslate()
  /**
   * 搜索数据配置
   */
  const searchData: SearchData[] = useMemo(
    () => [
      {
        type: 'input',
        name: 'appId',
        placeholder: t('admin.enterAppId')
      },
      {
        type: 'select',
        name: 'kind',
        label: t('admin.uploadType'),
        placeholder: t('admin.selectUploadType'),
        options: UPLOAD_TYPE_OPTIONS.map(option => ({
          ...option,
          label: option.value === '' ? t('admin.all') : t(`admin.${option.value === 'doc' ? 'document' : option.value}`)
        }))
      },
      // {
      //   type: 'select',
      //   name: 'drive',
      //   label: t('admin.uploadDrive'),
      //   placeholder: t('admin.selectUploadDrive'),
      //   options: UPLOAD_DRIVE_OPTIONS
      // },
      {
        type: 'input',
        name: 'ext',
        placeholder: t('admin.enterExtensionType')
      },
      {
        type: 'input',
        name: 'name',
        placeholder: t('admin.enterFileName')
      }
    ],
    [t]
  )

  /**
   * 处理状态开关变化
   */
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    onSearchChange?.({ ...params, status: checked ? true : undefined })
  }

  return (
    <>
      <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData} />
      <CardContent>
        <Box className='flex items-center gap-4 flex-wrap'>
          <FormControlLabel
            control={<Switch checked={params.status === true} onChange={handleStatusChange} color='primary' />}
            label={t('admin.status')}
          />
          {/* <Button variant='contained' color='primary' startIcon={<Upload size={16} />} onClick={onUpload}>
            上传文件
          </Button> */}
          {/* <Button variant='outlined' onClick={onReset}>
            重置
          </Button> */}
        </Box>
      </CardContent>
    </>
  )
}

export default SearchFilters
