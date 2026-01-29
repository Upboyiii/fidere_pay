'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getCurrencyList, initCurrency, type CurrencyListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const CurrencyList = ({ mode }: { mode: Mode }) => {
  const [data, setData] = useState<CurrencyListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    currencyType: '',
    status: '-1'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getCurrencyList({
        currencyType: filters.currencyType ? Number(filters.currencyType) : undefined,
        status: filters.status !== '-1' ? Number(filters.status) : undefined
      })
      setData(res.data?.list || [])
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters.currencyType, filters.status])

  const handleInit = async () => {
    try {
      await initCurrency()
      toast.success('初始化成功')
      loadData()
    } catch (error) {
      console.error('初始化失败:', error)
      toast.error('初始化失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>币种管理</Typography>
              <Button variant='contained' onClick={handleInit}>
                初始化默认币种
              </Button>
            </Box>
            <Box className='flex items-center gap-4 mb-6'>
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='currency-type-label'>币种类型</InputLabel>
                <Select
                  labelId='currency-type-label'
                  value={filters.currencyType}
                  onChange={e => setFilters({ ...filters, currencyType: e.target.value })}
                  label='币种类型'
                >
                  <MenuItem value=''>全部</MenuItem>
                  <MenuItem value='1'>法币</MenuItem>
                  <MenuItem value='2'>数字货币</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='currency-status-label'>状态</InputLabel>
                <Select
                  labelId='currency-status-label'
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  label='状态'
                >
                  <MenuItem value='-1'>全部</MenuItem>
                  <MenuItem value='0'>禁用</MenuItem>
                  <MenuItem value='1'>启用</MenuItem>
                </Select>
              </FormControl>
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>币种编码</th>
                    <th>币种名称</th>
                    <th>币种类型</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.currencyCode}</td>
                        <td>{item.currencyName}</td>
                        <td>{item.currencyType === 1 ? '法币' : '数字货币'}</td>
                        <td>
                          <Chip
                            label={item.status === 1 ? '启用' : '禁用'}
                            color={item.status === 1 ? 'success' : 'default'}
                            size='small'
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CurrencyList
