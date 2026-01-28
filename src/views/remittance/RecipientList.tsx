'use client'

// React Imports
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// Util Imports
import { getLocalizedPath } from '@/utils/routeUtils'

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
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getPayeeList, deletePayee, type PayeeItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const RecipientList = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const params = useParams()
  const currentLang = (params?.lang as string) || undefined
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PayeeItem | null>(null)
  const [filters, setFilters] = useState({
    remittanceMethod: '',
    accountType: '',
    searchKey: ''
  })
  const [showFilters, setShowFilters] = useState(true)
  const [recipients, setRecipients] = useState<PayeeItem[]>([])
  const [total, setTotal] = useState(0)

  // 加载收款人列表
  const loadRecipients = async () => {
    setLoading(true)
    try {
      const res = await getPayeeList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        remitType: filters.remittanceMethod ? Number(filters.remittanceMethod) : undefined,
        accountType: filters.accountType ? Number(filters.accountType) : undefined,
        status: 1, // 只显示启用的
        searchKey: filters.searchKey || undefined
      })
      setRecipients(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载收款人列表失败:', error)
      toast.error('加载收款人列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecipients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filters.remittanceMethod, filters.accountType, filters.searchKey])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePayee({ id: deleteTarget.id })
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      loadRecipients()
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const handleCopyAccount = (account: string) => {
    navigator.clipboard.writeText(account)
    toast.success('已复制')
  }

  const getRemitTypeLabel = (remitType: number) => {
    return remitType === 1 ? 'SWIFT汇款' : '本地汇款'
  }

  const getAccountTypeLabel = (accountType: number) => {
    return accountType === 1 ? '公司' : '个人'
  }

  const getRecipientName = (recipient: PayeeItem) => {
    if (recipient.accountType === 1) {
      return recipient.companyName || recipient.accountName
    } else {
      return `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.accountName
    }
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
              onClick={() => router.push(getLocalizedPath('/remittance/recipients/new', currentLang))}
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
                        <MenuItem value=''>全部</MenuItem>
                        <MenuItem value='1'>SWIFT汇款</MenuItem>
                        <MenuItem value='2'>本地汇款</MenuItem>
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
                        <MenuItem value=''>全部</MenuItem>
                        <MenuItem value='2'>个人</MenuItem>
                        <MenuItem value='1'>公司</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='caption' sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>搜索关键词</Typography>
                    <TextField
                      fullWidth
                      size='small'
                      placeholder='收款人名称、银行名称等'
                      value={filters.searchKey}
                      onChange={(e) => setFilters({ ...filters, searchKey: e.target.value })}
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
                  onClick={() => {
                    setFilters({ remittanceMethod: '', accountType: '', searchKey: '' })
                    setPage(0)
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  重置
                </Button>
                <Button 
                  variant='contained' 
                  size='small' 
                  startIcon={<i className='ri-search-line' />} 
                  sx={{ borderRadius: '8px', px: 6 }}
                  onClick={loadRecipients}
                  disabled={loading}
                >
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
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 6, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  所有收款人
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton size='small' onClick={loadRecipients} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                  </IconButton>
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
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>创建时间</th>
                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center' }}>
                        <CircularProgress />
                      </td>
                    </tr>
                  ) : recipients.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        暂无收款人
                      </td>
                    </tr>
                  ) : (
                    recipients.map((recipient) => (
                      <tr key={recipient.id} className='hover:bg-actionHover transition-colors' style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <td style={{ padding: '16px 24px' }}><Checkbox size='small' /></td>
                        <td style={{ padding: '16px 24px' }}>
                          <Chip 
                            label={getRemitTypeLabel(recipient.remitType)} 
                            size='small' 
                            sx={{ bgcolor: 'primary.lightOpacity', color: 'primary.main', fontWeight: 600, borderRadius: '6px' }} 
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Chip
                            label={getAccountTypeLabel(recipient.accountType)}
                            size='small'
                            variant='outlined'
                            sx={{ fontWeight: 600, borderRadius: '6px' }}
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {getRecipientName(recipient)}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                {recipient.accountNo}
                              </Typography>
                              <IconButton 
                                size='small' 
                                onClick={() => handleCopyAccount(recipient.accountNo)}
                                sx={{ p: 0.5 }}
                              >
                                <i className='ri-file-copy-line text-sm' />
                              </IconButton>
                            </Box>
                            <Typography variant='caption' color='text.secondary'>
                              {recipient.bankName}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Typography variant='body2' color='text.secondary'>
                            {(() => {
                              const timeValue = (recipient as any).createTime || recipient.createdAt
                              if (!timeValue) return '-'
                              const timestamp = typeof timeValue === 'string' ? parseInt(timeValue) : timeValue
                              const date = timestamp.toString().length === 10 ? new Date(timestamp * 1000) : new Date(timestamp)
                              return date.toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })
                            })()}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size='small'
                              variant='text'
                              component={Link}
                              href={getLocalizedPath(`/remittance/recipients/${recipient.id}/edit`, currentLang)}
                              sx={{ fontWeight: 600 }}
                            >
                              编辑
                            </Button>
                            <Button
                              size='small'
                              variant='text'
                              color='error'
                              onClick={() => {
                                setDeleteTarget(recipient)
                                setDeleteDialogOpen(true)
                              }}
                              sx={{ fontWeight: 600 }}
                            >
                              删除
                            </Button>
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='caption' color='text.disabled'>
                  共 {total} 个收款人
                </Typography>
                <TablePagination
                  component='div'
                  count={total}
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除收款人 "{deleteTarget ? getRecipientName(deleteTarget) : ''}" 吗？此操作不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDelete} color='error' variant='contained'>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RecipientList
