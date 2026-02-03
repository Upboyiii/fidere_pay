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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

// Third Party Imports
import { toast } from 'react-toastify'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getAdminAssetList, adjustAsset, type AdminAssetListItem } from '@server/otc-api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const AdminAssetList = ({ mode }: { mode: Mode }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<AdminAssetListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    userNickname: ''
  })

  // 统计数据
  const [statistics, setStatistics] = useState({
    totalBalance: 0,
    totalFrozen: 0,
    totalAvailable: 0,
    userCount: 0
  })

  // 调整资产弹窗状态
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [adjusting, setAdjusting] = useState(false)
  const [selectedItem, setSelectedItem] = useState<AdminAssetListItem | null>(null)
  const [adjustForm, setAdjustForm] = useState({
    adjustType: 1 as 1 | 2,
    amount: '',
    remark: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAdminAssetList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined,
        userName: filters.userName || undefined,
        userNickname: filters.userNickname || undefined
      })
      const list: AdminAssetListItem[] = res.data?.list || []
      setData(list)
      setTotal(res.data?.total || 0)
      
      // 计算统计数据
      const totalBalance = list.reduce((sum: number, item: AdminAssetListItem) => sum + (item.balance || 0), 0)
      const totalFrozen = list.reduce((sum: number, item: AdminAssetListItem) => sum + (item.frozenBalance || 0), 0)
      const totalAvailable = list.reduce((sum: number, item: AdminAssetListItem) => sum + (item.availableBalance || 0), 0)
      const uniqueUsers = new Set(list.map((item: AdminAssetListItem) => item.userId))
      setStatistics({
        totalBalance,
        totalFrozen,
        totalAvailable,
        userCount: uniqueUsers.size
      })
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 打开调整资产弹窗
  const handleOpenAdjustDialog = (item: AdminAssetListItem) => {
    setSelectedItem(item)
    setAdjustForm({
      adjustType: 1,
      amount: '',
      remark: ''
    })
    setAdjustDialogOpen(true)
  }

  // 关闭调整资产弹窗
  const handleCloseAdjustDialog = () => {
    setAdjustDialogOpen(false)
    setSelectedItem(null)
  }

  // 提交资产调整
  const handleAdjustSubmit = async () => {
    if (!selectedItem) return

    if (!adjustForm.amount || Number(adjustForm.amount) <= 0) {
      toast.error('请输入有效的调整金额')
      return
    }

    setAdjusting(true)
    try {
      await adjustAsset({
        userId: selectedItem.userId,
        currencyCode: selectedItem.currencyCode,
        adjustType: adjustForm.adjustType,
        amount: Number(adjustForm.amount),
        remark: adjustForm.remark || undefined
      })
      toast.success('资产调整成功')
      handleCloseAdjustDialog()
      loadData() // 刷新列表
    } catch (error: any) {
      console.error('资产调整失败:', error)
      toast.error(error?.message || '资产调整失败')
    } finally {
      setAdjusting(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, rowsPerPage])

  return (
    <Grid container spacing={6}>
      {/* 统计卡片 - 简洁风格 */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'primary.lighter', color: 'primary.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-wallet-3-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>总余额</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {statistics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'success.lighter', color: 'success.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-check-double-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>可用余额</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'success.main' }}>
              {statistics.totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'warning.lighter', color: 'warning.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-lock-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>冻结余额</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'warning.main' }}>
              {statistics.totalFrozen.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: '12px', 
                bgcolor: 'info.lighter', color: 'info.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className='ri-team-line' style={{ fontSize: 22 }} />
              </Box>
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>用户数量</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'info.main' }}>
              {statistics.userCount}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card sx={{ width: '100%', borderRadius: '16px' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>用户资产列表</Typography>
              <Chip label={`共 ${total} 条`} size='small' variant='outlined' />
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label='用户名'
                value={filters.userName}
                onChange={e => setFilters({ ...filters, userName: e.target.value })}
                size='small'
                sx={{ minWidth: 120 }}
                placeholder='模糊搜索'
              />
              <TextField
                label='用户昵称'
                value={filters.userNickname}
                onChange={e => setFilters({ ...filters, userNickname: e.target.value })}
                size='small'
                sx={{ minWidth: 120 }}
                placeholder='模糊搜索'
              />
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>用户名</th>
                    <th>用户昵称</th>
                    <th>币种</th>
                    <th>余额</th>
                    <th>冻结余额</th>
                    <th>可用余额</th>
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
                      <tr key={`${item.userId}-${item.currencyCode}`}>
                        <td>{item.userName || '-'}</td>
                        <td>{item.userNickname || '-'}</td>
                        <td>{item.currencyCode}</td>
                        <td>{item.balance}</td>
                        <td>{item.frozenBalance}</td>
                        <td>{item.availableBalance}</td>
                        <td>
                          <Button
                            size='small'
                            variant='outlined'
                            color='primary'
                            onClick={() => handleOpenAdjustDialog(item)}
                          >
                            调整资产
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

      {/* 调整资产弹窗 */}
      <Dialog open={adjustDialogOpen} onClose={handleCloseAdjustDialog} maxWidth='sm' fullWidth>
        <DialogTitle>调整用户资产</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label='用户名'
                  value={selectedItem.userName || '-'}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
                <TextField
                  label='币种'
                  value={selectedItem.currencyCode}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label='当前余额'
                  value={selectedItem.balance}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
                <TextField
                  label='可用余额'
                  value={selectedItem.availableBalance}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
              </Box>
              <FormControl size='small' fullWidth>
                <InputLabel>调整类型</InputLabel>
                <Select
                  value={adjustForm.adjustType}
                  label='调整类型'
                  onChange={e => setAdjustForm({ ...adjustForm, adjustType: e.target.value as 1 | 2 })}
                >
                  <MenuItem value={1}>增加</MenuItem>
                  <MenuItem value={2}>扣减</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='调整金额'
                type='number'
                value={adjustForm.amount}
                onChange={e => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                size='small'
                fullWidth
                required
                inputProps={{ min: 0, step: '0.01' }}
                placeholder='请输入调整金额'
              />
              <TextField
                label='调整原因/备注'
                value={adjustForm.remark}
                onChange={e => setAdjustForm({ ...adjustForm, remark: e.target.value })}
                size='small'
                fullWidth
                multiline
                rows={3}
                placeholder='请输入调整原因（选填）'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAdjustDialog} disabled={adjusting}>
            取消
          </Button>
          <Button variant='contained' onClick={handleAdjustSubmit} disabled={adjusting}>
            {adjusting ? '提交中...' : '确认调整'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AdminAssetList
