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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'

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
  const [statistics, setStatistics] = useState({
    totalIncome: 0,
    totalExpenditure: 0
  })
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
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
        userName: filters.userName || undefined,
        currencyCode: filters.currencyCode || undefined,
        bizType: filters.bizType ? Number(filters.bizType) : undefined,
        direction: filters.direction ? Number(filters.direction) : undefined,
        startTime: filters.startTime ? new Date(filters.startTime).getTime() : undefined,
        endTime: filters.endTime ? new Date(filters.endTime).getTime() : undefined
      })
      const list = res.data?.list || []
      setData(list)
      setTotal(res.data?.total || 0)
      
      // 计算统计数据
      const totalIncome = list
        .filter(item => item.direction === 1)
        .reduce((sum, item) => sum + Math.abs(item.changeAmount), 0)
      const totalExpenditure = list
        .filter(item => item.direction === 2)
        .reduce((sum, item) => sum + Math.abs(item.changeAmount), 0)
      setStatistics({ totalIncome, totalExpenditure })
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

  const netAmount = statistics.totalIncome - statistics.totalExpenditure

  return (
    <Grid container spacing={6}>
      {/* 统计卡片 - 简洁风格 */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'success.lighter', color: 'success.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-arrow-down-circle-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>总入账</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'success.main' }}>
              +{statistics.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'error.lighter', color: 'error.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-arrow-up-circle-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>总出账</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'error.main' }}>
              -{statistics.totalExpenditure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: netAmount >= 0 ? 'primary.lighter' : 'error.lighter', 
                color: netAmount >= 0 ? 'primary.main' : 'error.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-scales-3-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>净额</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: netAmount >= 0 ? 'primary.main' : 'error.main' }}>
              {netAmount >= 0 ? '+' : ''}{netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card sx={{ width: '100%', borderRadius: '16px' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>资金流水列表</Typography>
              <Chip label={`共 ${total} 条`} size='small' variant='outlined' />
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label='用户名'
                value={filters.userName}
                onChange={e => setFilters({ ...filters, userName: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
              />
              <TextField
                label='币种编码'
                value={filters.currencyCode}
                onChange={e => setFilters({ ...filters, currencyCode: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
                placeholder='如: USDT-TRC20'
              />
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='bizType-label'>业务类型</InputLabel>
                <Select
                  labelId='bizType-label'
                  value={filters.bizType}
                  onChange={e => setFilters({ ...filters, bizType: e.target.value })}
                  label='业务类型'
                >
                  <MenuItem value=''>全部</MenuItem>
                  <MenuItem value='1'>充值</MenuItem>
                  <MenuItem value='2'>提现</MenuItem>
                  <MenuItem value='3'>转账</MenuItem>
                  <MenuItem value='5'>管理员调整</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel id='direction-label'>方向</InputLabel>
                <Select
                  labelId='direction-label'
                  value={filters.direction}
                  onChange={e => setFilters({ ...filters, direction: e.target.value })}
                  label='方向'
                >
                  <MenuItem value=''>全部</MenuItem>
                  <MenuItem value='1'>入账</MenuItem>
                  <MenuItem value='2'>出账</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='开始时间'
                type='datetime-local'
                value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })}
                size='small'
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='结束时间'
                type='datetime-local'
                value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })}
                size='small'
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
              <Button 
                variant='outlined' 
                onClick={() => {
                  setFilters({
                    userId: '',
                    userName: '',
                    currencyCode: '',
                    bizType: '',
                    direction: '',
                    startTime: '',
                    endTime: ''
                  })
                  setPage(0)
                }}
              >
                重置
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '1400px' }}>
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>用户信息</th>
                    <th>币种</th>
                    <th>业务类型</th>
                    <th>方向</th>
                    <th>变动金额</th>
                    <th>可用余额变化</th>
                    <th>冻结余额变化</th>
                    <th>备注</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={10} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '0.85rem' }}>{item.orderNo}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600 }}>{item.userName}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--mui-palette-text-secondary)' }}>
                              {item.userNickname}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Chip 
                            label={item.currencyCode} 
                            size='small' 
                            variant='outlined'
                          />
                        </td>
                        <td>
                          <Chip 
                            label={
                              item.bizType === 1 ? '充值' : 
                              item.bizType === 2 ? '提现' : 
                              item.bizType === 3 ? '转账' : 
                              item.bizType === 5 ? '管理员调整' : 
                              String(item.bizType)
                            }
                            size='small'
                            color={
                              item.bizType === 1 ? 'success' :
                              item.bizType === 2 ? 'warning' :
                              item.bizType === 3 ? 'info' :
                              item.bizType === 5 ? 'secondary' :
                              'default'
                            }
                          />
                        </td>
                        <td>
                          <Chip 
                            label={item.direction === 1 ? '入账' : '出账'}
                            size='small'
                            color={item.direction === 1 ? 'success' : 'error'}
                            variant='filled'
                          />
                        </td>
                        <td>
                          <span style={{ 
                            color: item.direction === 1 ? '#4caf50' : '#ff5252',
                            fontWeight: 700
                          }}>
                            {item.direction === 1 ? '+' : '-'}{Math.abs(item.changeAmount)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--mui-palette-text-secondary)' }}>
                              前: {item.availableBalanceBefore}
                            </span>
                            <span style={{ color: 'var(--mui-palette-text-primary)' }}>
                              后: {item.availableBalanceAfter}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--mui-palette-text-secondary)' }}>
                              前: {item.frozenBalanceBefore}
                            </span>
                            <span style={{ color: 'var(--mui-palette-text-primary)' }}>
                              后: {item.frozenBalanceAfter}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Tooltip title={item.remark || '无备注'} arrow placement='top'>
                            <div style={{ 
                              maxWidth: '200px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}>
                              {item.remark || '-'}
                            </div>
                          </Tooltip>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {(() => {
                            // 兼容 createTime 和 createdAt 两个字段名，支持13位毫秒时间戳
                            const timestamp = item.createTime || item.createdAt
                            if (!timestamp) return '-'
                            return new Date(timestamp).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          })()}
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

export default AdminTransactionList
