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
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getCallbackList, retryCallback, type CallbackListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const CallbackList = ({ mode }: { mode: Mode }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<CallbackListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    callbackType: '',
    callbackStatus: '-1',
    startTime: '',
    endTime: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getCallbackList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined,
        callbackType: filters.callbackType ? Number(filters.callbackType) : undefined,
        callbackStatus: filters.callbackStatus !== '-1' ? Number(filters.callbackStatus) : undefined,
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

  const handleRetry = async (id: number) => {
    try {
      await retryCallback({ id })
      toast.success('重试成功')
      loadData()
    } catch (error) {
      console.error('重试失败:', error)
      toast.error('重试失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>回调记录列表</Typography>
            </Box>
            <Box className='flex items-center gap-4 mb-4 flex-wrap'>
              <TextField
                label='用户ID'
                value={filters.userId}
                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                size='small'
              />
              <TextField
                label='回调类型'
                value={filters.callbackType}
                onChange={e => setFilters({ ...filters, callbackType: e.target.value })}
                size='small'
              />
              <TextField
                label='回调状态'
                value={filters.callbackStatus}
                onChange={e => setFilters({ ...filters, callbackStatus: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value='-1'>全部</option>
                <option value='0'>待处理</option>
                <option value='1'>成功</option>
                <option value='2'>失败</option>
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
                    <th>ID</th>
                    <th>用户ID</th>
                    <th>回调类型</th>
                    <th>回调状态</th>
                    <th>回调URL</th>
                    <th>重试次数</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.userId}</td>
                        <td>{item.callbackType}</td>
                        <td>
                          <Chip
                            label={item.callbackStatus === 1 ? '成功' : item.callbackStatus === 2 ? '失败' : '待处理'}
                            color={item.callbackStatus === 1 ? 'success' : item.callbackStatus === 2 ? 'error' : 'warning'}
                            size='small'
                          />
                        </td>
                        <td className='max-w-xs truncate'>{item.callbackUrl}</td>
                        <td>{item.retryCount}</td>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                        <td>
                          <Button size='small' onClick={() => handleRetry(item.id)}>
                            重试
                          </Button>
                        </td>
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

export default CallbackList
