'use client'

// React Imports
import { useState } from 'react'
import Link from 'next/link'

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
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Mode } from '@core/types'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const RecipientList = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    remittanceMethod: '',
    accountType: '',
    bankName: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(true)

  // 模拟收款人数据
  const recipients = [
    {
      id: 1,
      remittanceMethod: '国际汇款',
      accountType: '公司',
      name: 'UOB Kay Hian (Hong Kong) Ltd',
      account: '600360200274',
      bankName: 'THE HONGKONG AND SHANGHAI...',
      currency: 'USD',
      remark: 'Further credit to accoun...',
      createTime: '2026-01-19 14:34:34'
    },
    {
      id: 2,
      remittanceMethod: '国际汇款',
      accountType: '个人',
      name: 'Kassius Macdonald ROBERTS...',
      account: '431128693888',
      bankName: 'CAIXABANK, S.A.',
      currency: 'USD',
      remark: '',
      createTime: '2026-01-19 14:30:22'
    }
  ]

  const handleCopyAccount = (account: string) => {
    navigator.clipboard.writeText(account)
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
                收款人列表
              </Typography>
              <Typography color='text.secondary'>
                管理您的收款人信息，一键发起汇款
              </Typography>
            </Box>
            <Button 
              variant='contained' 
              startIcon={<i className='ri-add-line' />} 
              onClick={() => router.push('/remittance/recipients/new')}
              sx={{ borderRadius: '8px', px: 6 }}
            >
              新增收款人
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
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>汇款方式</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.remittanceMethod}
                        onChange={(e) => setFilters({ ...filters, remittanceMethod: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择汇款方式</MenuItem>
                        <MenuItem value='swift'>SWIFT汇款</MenuItem>
                        <MenuItem value='local'>本地汇款</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>账户类型</Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={filters.accountType}
                        onChange={(e) => setFilters({ ...filters, accountType: e.target.value })}
                        displayEmpty
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value=''>请选择账户类型</MenuItem>
                        <MenuItem value='personal'>个人</MenuItem>
                        <MenuItem value='company'>公司</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>银行名称</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='请输入银行名称'
                      value={filters.bankName}
                      onChange={(e) => setFilters({ ...filters, bankName: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>创建时间</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      type='date'
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
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
                  onClick={() => setFilters({ remittanceMethod: '', accountType: '', bankName: '', startDate: '', endDate: '' })}
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

        {/* 收款人列表 */}
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
                所有收款人
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
                    <th style={{ padding: '16px 24px' }}><Checkbox size='small' /></th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>汇款方式</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>账户类型</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>收款方名称</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>银行信息</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>币种</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>创建时间</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((recipient) => (
                    <tr key={recipient.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '16px 24px' }}><Checkbox size='small' /></td>
                      <td style={{ padding: '16px 24px' }}>
                        <Chip label={recipient.remittanceMethod} size='small' sx={{ bgcolor: 'primary.lightOpacity', color: 'primary.main', fontWeight: 600, borderRadius: '6px' }} />
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Chip
                          label={recipient.accountType}
                          size='small'
                          variant='outlined'
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>{recipient.name}</Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Box>
                          <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {recipient.account}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {recipient.bankName}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>{recipient.currency}</Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant='body2' color='text.secondary'>
                          {recipient.createTime}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size='small'
                            variant='text'
                            onClick={() => router.push(`/remittance/recipients/${recipient.id}/edit`)}
                            sx={{ fontWeight: 600 }}
                          >
                            编辑
                          </Button>
                          <Button
                            size='small'
                            variant='text'
                            color='error'
                            sx={{ fontWeight: 600 }}
                          >
                            删除
                          </Button>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='caption' color='text.disabled'>
                共 {recipients.length} 个收款人
              </Typography>
              <TablePagination
                component='div'
                count={recipients.length}
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

export default RecipientList
