'use client'

import { useMemo } from 'react'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { Plus } from 'lucide-react'
import TabFilters, { type SearchData } from '@/components/table/tableFilters'
import { useTranslate } from '@/contexts/DictionaryContext'

interface SearchFiltersProps {
  params: {
    configName?: string
    configKey?: string
    configType?: string
    startDate?: Date | null
    endDate?: Date | null
  }
  onSearchChange?: (data: any) => void
  onReset?: () => void
  onAddConfig?: () => void
}

const SearchFilters = ({ params, onSearchChange, onReset, onAddConfig }: SearchFiltersProps) => {
  const t = useTranslate()
  const searchData: SearchData[] = useMemo(
    () => [
      { type: 'input', name: 'configName', placeholder: t('admin.configNamePlaceholder') },
      { type: 'input', name: 'configKey', placeholder: t('admin.configKeyPlaceholder') },
      {
        type: 'select',
        name: 'configType',
        label: t('admin.systemBuiltIn'),
        placeholder: t('admin.systemBuiltInPlaceholder'),
        options: [
          { label: t('admin.all'), value: '' },
          { label: t('admin.yes'), value: '1' },
          { label: t('admin.no'), value: '0' }
        ]
      }
    ],
    [t]
  )

  return (
    <>
      <TabFilters params={params} onSearchChange={onSearchChange} searchData={searchData} />
      <CardContent>
        <Box className='flex items-center gap-2 flex-wrap'>
          <Button variant='contained' color='primary' startIcon={<Plus size={16} />} onClick={onAddConfig}>
            {t('admin.addConfigButton')}
          </Button>
          {onReset && (
            <Button variant='outlined' onClick={onReset}>
              {t('admin.resetButton')}
            </Button>
          )}
        </Box>
      </CardContent>
    </>
  )
}

export default SearchFilters
