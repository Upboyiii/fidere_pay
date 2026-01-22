'use client'
// MUI Imports
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { getCoinTypes } from '@server/whitelists'
import { useEffect, useState } from 'react'
import TableFilter, { SearchData } from '@/components/table/tableFilters'
import { useTranslate } from '@/contexts/DictionaryContext'
type TableFiltersProps = {
  params: any
  onSearchChange: (data: any) => void
}

const TableFilters = ({ params, onSearchChange }: TableFiltersProps) => {
  const t = useTranslate()
  const [list, setList] = useState<any[]>([])
  useEffect(() => {
    getCoinTypes().then(res => {
      setList(res.data?.list || [])
    })
  }, [])

  const searchData: SearchData[] = [
    {
      name: 'keyword',
      type: 'input',
      label: t('kycWhitelists.searchPlaceholder'), // 搜索地址ID、用户名、地址...
      placeholder: t('kycWhitelists.searchPlaceholder') // 搜索地址ID、用户名、地址...
    },

    {
      name: 'coinType',
      type: 'select',
      label: t('kycWhitelists.addressType'), // 地址类型
      placeholder: t('kycWhitelists.selectAddressType'), // 选择地址类型
      options: [
        { label: t('kycWhitelists.allTypes'), value: '' }, // 全部类型
        ...list?.map(item => ({ label: item.coinName, value: item.id }))
      ]
    }
  ]

  return (
    <>
      <TableFilter params={params} onSearchChange={onSearchChange} searchData={searchData} />
    </>
  )
}

export default TableFilters
