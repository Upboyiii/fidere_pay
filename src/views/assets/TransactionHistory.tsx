'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Mode } from '@core/types'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const TransactionHistory = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    transactionId: '',
    transactionType: '',
    currency: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(true)

  // 模拟交易数据
  const transactions = [
    {
      id: '2013914565066862594',
      type: '充值',
      currency: 'USDT',
      amount: '+15000',
      status: '成功',
      createTime: '2026-01-21 18:00:24'
    },
    {
      id: '2013907480774160385',
      type: '充值',
      currency: 'USDT',
      amount: '+160580',
      status: '成功',
      createTime: '2026-01-21 17:32:15'
    },
    {
      id: '2013865558210752514',
      type: '充值',
      currency: 'USDT',
      amount: '+150545',
      status: '成功',
      createTime: '2026-01-21 14:45:40'
    },
    {
      id: '2013160999066775553',
      type: '充值',
      currency: 'USDT',
      amount: '+2.0071',
      status: '成功',
      createTime: '2026-01-19 16:06:00'
    },
    {
      id: '2013150999066775554',
      type: '汇款',
      currency: 'USDT',
      amount: '-5000',
      status: '处理中',
      createTime: '2026-01-19 15:30:00'
    },
    {
      id: '2013140999066775555',
      type: '汇款',
      currency: 'USDT',
      amount: '-1000',
      status: '成功',
      createTime: '2026-01-19 14:20:00'
    }
  ]

  const getStatusColor = (status: string) => {
    if (status === '成功') return 'success'
    if (status === '失败') return 'error'
    if (status === '处理中') return 'warning'
    return 'default'
  }

  const getTypeColor = (type: string) => {
    if (type === '充值') return 'primary'
    if (type === '汇款') return 'warning'
    return 'default'
  }

  return (
    <Box 
      sx={{ 
        p: 6, 
        position: 'relative', 
        minHeight: '100%',
        backgroundColor: '#f8fafc' 
      }}
    >
      {/* 现代感网格背景 */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
        }}
      />

      <Grid container spacing={6} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                交易流水
              </Typography>
              <Typography color='text.secondary'>
                查看所有交易记录和流水明细
              </Typography>
            </Box>
            <Button
              variant='contained'
              startIcon={<i className='ri-download-line' />}
              sx={{ borderRadius: '8px', px: 6 }}
            >
              导出记录
            </Button>
          </Box>
        </Grid>

        {/* 筛选栏 */}
        {showFilters && (
          <Grid size={{ xs: 12 }}>
            <Card 
              sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <CardContent>
                <Grid container spacing={4} alignItems='flex-end'>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>交易ID</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入交易ID'
                      value={filters.transactionId}
                      onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>交易类型</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.transactionType}
                        onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择</MenuItem>
                        <MenuItem value='recharge'>充值</MenuItem>
                        <MenuItem value='remittance'>汇款</MenuItem>
                        <MenuItem value='withdraw'>提现</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>币种</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.currency}
                        onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择币种</MenuItem>
                        <MenuItem value='USDT'>USDT</MenuItem>
                        <MenuItem value='USD'>USD</MenuItem>
                        <MenuItem value='HKD'>HKD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>开始日期</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>结束日期</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 4 }}>
                <Button
                  variant='text'
                  size='small'
                  onClick={() => setFilters({ transactionId: '', transactionType: '', currency: '', startDate: '', endDate: '' })}
                  sx={{ color: 'text.secondary' }}
                >
                  重置
                </Button>
                <Button variant='contained' size='small' startIcon={<i className='ri-search-line' />} sx={{ borderRadius: '8px', px: 6 }}>
                  查询
                </Button>
                <Button variant='text' size='small' onClick={() => setShowFilters(false)} startIcon={<i className='ri-arrow-up-line' />}>
                  收起
                </Button>
              </Box>
            </Card>
          </Grid>
        )}

        {/* 交易列表 */}
        <Grid size={{ xs: 12 }}>
          <Card 
            sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 6, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                交易记录
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size='small'><i className='ri-refresh-line' /></IconButton>
                <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton>
                <IconButton size='small'><i className='ri-settings-3-line' /></IconButton>
              </Box>
            </Box>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table} style={{ border: 'none' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fcfdfe' }}>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易ID</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易类型</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>币种</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>金额</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>状态</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>创建时间</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {tx.id}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography
                          variant='body2'
                          sx={{
                            color: tx.type === '充值' ? 'primary.main' : 'warning.main',
                            fontWeight: 600
                          }}
                        >
                          {tx.type}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2'>{tx.currency}</Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 700,
                            color: tx.amount.startsWith('+') ? '#4caf50' : '#ff5252'
                          }}
                        >
                          {tx.amount}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Chip 
                          label={tx.status} 
                          size='small' 
                          color={getStatusColor(tx.status) as any} 
                          sx={{ borderRadius: '6px', fontWeight: 600 }}
                        />
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' color='text.secondary'>
                          {tx.createTime}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Button 
                          size='small' 
                          variant='text' 
                          sx={{ fontWeight: 600 }}
                          onClick={() => {}}
                        >
                          详情
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='caption' color='text.disabled'>
                共 {transactions.length} 条记录
              </Typography>
              <TablePagination
                component='div'
                count={transactions.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage=''
                sx={{ border: 'none' }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TransactionHistory
