'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
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

const RemittanceRecords = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    transactionId: '',
    orderStatus: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(true)

  // 模拟汇款记录数据
  const records = [
    {
      id: 1,
      recipient: {
        name: 'CHAU YEUNG SO',
        account: '32915070921',
        swift: 'SCBLHKHH'
      },
      debitedAmount: 160000,
      receivedAmount: 160000,
      remittanceMethod: 'SWIFT',
      status: '付款成功',
      transactionId: 'UR202601211745500133...',
      applicationTime: '2026-01-21 17:45:51'
    },
    {
      id: 2,
      recipient: {
        name: 'SURPLUS COME LIMITED',
        account: '035802319283831',
        swift: 'WIHBHKHH'
      },
      debitedAmount: 150000,
      receivedAmount: 150000,
      remittanceMethod: 'SWIFT',
      status: '付款成功',
      transactionId: 'UR202601211451440132...',
      applicationTime: '2026-01-21 14:51:45'
    }
  ]

  const getStatusColor = (status: string) => {
    if (status === '付款成功') return 'success'
    if (status === '处理中') return 'warning'
    if (status === '失败') return 'error'
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
                汇款记录
              </Typography>
              <Typography color='text.secondary'>
                查看和追踪您的所有跨境汇款订单
              </Typography>
            </Box>
            <Button 
              variant='contained' 
              startIcon={<i className='ri-add-line' />} 
              onClick={() => router.push('/remittance/create')}
              sx={{ borderRadius: '8px', px: 6 }}
            >
              发起新汇款
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
                <Grid container spacing={4}>
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
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>订单状态</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.orderStatus}
                        onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择状态</MenuItem>
                        <MenuItem value='success'>付款成功</MenuItem>
                        <MenuItem value='processing'>处理中</MenuItem>
                        <MenuItem value='failed'>失败</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>订单时间</Typography>
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
                  onClick={() => setFilters({ transactionId: '', orderStatus: '', startDate: '', endDate: '' })}
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

        {/* 汇款记录列表 */}
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
                所有汇款订单
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size='small'><i className='ri-refresh-line' /></IconButton>
                <IconButton size='small'><i className='ri-fullscreen-line' /></IconButton>
                <IconButton size='small'><i className='ri-settings-3-line' /></IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                overflowX: 'auto',
                overflowY: 'visible',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}
            >
              <table className={tableStyles.table} style={{ border: 'none', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fcfdfe' }}>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>收款方信息</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>扣款金额</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>收款金额</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>状态</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>交易ID</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>申请时间</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>{record.recipient.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {record.recipient.account} | SWIFT: {record.recipient.swift}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                          {record.debitedAmount.toLocaleString()} USDT
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {record.remittanceMethod}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                          {record.receivedAmount.toLocaleString()} USD
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Chip 
                          label={record.status} 
                          size='small' 
                          color={getStatusColor(record.status) as any} 
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                          {record.transactionId}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' color='text.secondary'>
                          {record.applicationTime}
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
            </Box>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='caption' color='text.disabled'>
                共 {records.length} 条记录
              </Typography>
              <TablePagination
                component='div'
                count={records.length}
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

export default RemittanceRecords
