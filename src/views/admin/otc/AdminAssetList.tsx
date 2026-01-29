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
import { getAdminAssetList, type AdminAssetListItem } from '@server/otc-api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const AdminAssetList = ({ mode }: { mode: Mode }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<AdminAssetListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAdminAssetList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined
      })
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, rowsPerPage, filters.userId])

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>用户资产列表</Typography>
            </Box>
            <Box className='flex items-center gap-4 mb-6'>
              <TextField
                label='用户ID'
                value={filters.userId}
                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
              />
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>用户ID</th>
                    <th>币种</th>
                    <th>余额</th>
                    <th>冻结余额</th>
                    <th>可用余额</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={`${item.userId}-${item.currencyCode}`}>
                        <td>{item.userId}</td>
                        <td>{item.currencyCode}</td>
                        <td>{item.balance}</td>
                        <td>{item.frozenBalance}</td>
                        <td>{item.availableBalance}</td>
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

export default AdminAssetList
