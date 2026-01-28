'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getAdminTransactionList, type AdminTransactionListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const AdminTransactionList = ({ mode }: { mode: Mode }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<AdminTransactionListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    currencyCode: '',
    bizType: '',
    direction: '',
    startTime: '',
    endTime: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAdminTransactionList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined,
        currencyCode: filters.currencyCode || undefined,
        bizType: filters.bizType ? Number(filters.bizType) : undefined,
        direction: filters.direction ? Number(filters.direction) : undefined,
        startTime: filters.startTime ? new Date(filters.startTime).getTime() : undefined,
        endTime: filters.endTime ? new Date(filters.endTime).getTime() : undefined
      })
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, rowsPerPage])

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>资金流水列表</Typography>
            </Box>
            <Box className='flex items-center gap-4 mb-4 flex-wrap'>
              <TextField
                label='用户ID'
                value={filters.userId}
                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                size='small'
              />
              <TextField
                label='币种编码'
                value={filters.currencyCode}
                onChange={e => setFilters({ ...filters, currencyCode: e.target.value })}
                size='small'
              />
              <TextField
                label='业务类型'
                value={filters.bizType}
                onChange={e => setFilters({ ...filters, bizType: e.target.value })}
                size='small'
              />
              <TextField
                label='方向'
                value={filters.direction}
                onChange={e => setFilters({ ...filters, direction: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value=''>全部</option>
                <option value='1'>入账</option>
                <option value='2'>出账</option>
              </TextField>
              <TextField
                label='开始时间'
                type='datetime-local'
                value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })}
                size='small'
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='结束时间'
                type='datetime-local'
                value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })}
                size='small'
                InputLabelProps={{ shrink: true }}
              />
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>用户ID</th>
                    <th>币种</th>
                    <th>业务类型</th>
                    <th>方向</th>
                    <th>金额</th>
                    <th>余额</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.userId}</td>
                        <td>{item.currencyCode}</td>
                        <td>{item.bizType}</td>
                        <td>{item.direction === 1 ? '入账' : '出账'}</td>
                        <td>{item.amount}</td>
                        <td>{item.balance}</td>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              component='div'
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={e => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminTransactionList
