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
  // const [list, setList] = useState<any[]>([])
  // useEffect(() => {}, [])

  const searchData: SearchData[] = [
    {
      name: 'keyword',
      type: 'input',
      label: t('kycDashboard.searchPlaceholder'), // 搜索客户名称、审核类型...
      placeholder: t('kycDashboard.searchPlaceholder') // 搜索客户名称、审核类型...
    }
    // {
    //   name: 'coinType',
    //   type: 'select',
    //   label: '地址类型',
    //   placeholder: '选择地址类型',
    //   options: [{ label: '全部类型', value: '' }, ...list?.map(item => ({ label: item.coinName, value: item.id }))]
    // }
  ]

  return (
    <>
      <TableFilter params={params} onSearchChange={onSearchChange} searchData={searchData} CardContentSx={{ px: 2 }} />
    </>
  )
}

export default TableFilters
