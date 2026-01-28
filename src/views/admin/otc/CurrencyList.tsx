'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'

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
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>币种管理</Typography>
              <Button variant='contained' onClick={handleInit}>
                初始化默认币种
              </Button>
            </Box>
            <Box className='flex items-center gap-4 mb-4'>
              <TextField
                label='币种类型'
                value={filters.currencyType}
                onChange={e => setFilters({ ...filters, currencyType: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value=''>全部</option>
                <option value='1'>法币</option>
                <option value='2'>数字货币</option>
              </TextField>
              <TextField
                label='状态'
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value='-1'>全部</option>
                <option value='0'>禁用</option>
                <option value='1'>启用</option>
              </TextField>
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
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
