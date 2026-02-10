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

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

const AdminAssetList = ({ mode }: { mode: Mode }) => {
  const t = useTranslate()
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
    totalFrozen: 0,
    totalAvailable: 0
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

  const loadData = async (customFilters?: typeof filters, customPage?: number) => {
    setLoading(true)
    try {
      const currentFilters = customFilters || filters
      const currentPage = customPage !== undefined ? customPage : page
      const res = await getAdminAssetList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        userId: currentFilters.userId ? Number(currentFilters.userId) : undefined,
        userName: currentFilters.userName || undefined,
        userNickname: currentFilters.userNickname || undefined
      })
      const list: AdminAssetListItem[] = res.data?.list || []
      setData(list)
      setTotal(res.data?.total || 0)
      
      // 计算统计数据
      const totalFrozen = list.reduce((sum: number, item: AdminAssetListItem) => sum + (item.frozenBalance || 0), 0)
      const totalAvailable = list.reduce((sum: number, item: AdminAssetListItem) => sum + (item.availableBalance || 0), 0)
      setStatistics({
        totalFrozen,
        totalAvailable
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
      toast.error(t('adminOtc.enterValidAmount'))
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
      toast.success(t('adminOtc.adjustSuccess'))
      handleCloseAdjustDialog()
      loadData() // 刷新列表
    } catch (error: any) {
      console.error('资产调整失败:', error)
      toast.error(error?.message || t('adminOtc.adjustFailed'))
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
      {/* <Grid size={{ xs: 12, sm: 6, md: 6 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
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
      </Grid> */}

      <Grid size={12}>
        <Card sx={{ width: '100%', borderRadius: '16px' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>{t('adminOtc.userAssetList')}</Typography>
              <Chip label={t('adminOtc.totalRecords', { count: total })} size='small' variant='outlined' />
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label={t('adminOtc.username')}
                value={filters.userName}
                onChange={e => setFilters({ ...filters, userName: e.target.value })}
                size='small'
                sx={{ minWidth: 120 }}
                placeholder={t('adminOtc.fuzzySearchPlaceholder')}
              />
              <TextField
                label={t('adminOtc.userNickname')}
                value={filters.userNickname}
                onChange={e => setFilters({ ...filters, userNickname: e.target.value })}
                size='small'
                sx={{ minWidth: 120 }}
                placeholder={t('adminOtc.fuzzySearchPlaceholder')}
              />
              <Button variant='contained' onClick={loadData}>
                {t('adminOtc.search')}
              </Button>
              <Button 
                variant='outlined' 
                onClick={() => {
                  const resetFilters = {
                    userId: '',
                    userName: '',
                    userNickname: ''
                  }
                  setFilters(resetFilters)
                  setPage(0)
                  loadData(resetFilters, 0)
                }}
              >
                {t('adminOtc.reset')}
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>{t('adminOtc.username')}</th>
                    <th>{t('adminOtc.userNickname')}</th>
                    <th>{t('adminOtc.currency')}</th>
                    {/* <th>余额</th> */}
                    <th>{t('adminOtc.availableBalance')}</th>
                    <th>{t('adminOtc.frozenBalance')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className='text-center'>
                        {t('adminOtc.loading')}
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='text-center'>
                        {t('adminOtc.noData')}
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={`${item.userId}-${item.currencyCode}`}>
                        <td>{item.userName || '-'}</td>
                        <td>{item.userNickname || '-'}</td>
                        <td>{item.currencyCode}</td>
                        {/* <td>{item.balance}</td> */}
                        <td>{item.availableBalance}</td>
                        <td>{item.frozenBalance}</td>
                        <td>
                          <Button
                            size='small'
                            variant='outlined'
                            color='primary'
                            onClick={() => handleOpenAdjustDialog(item)}
                          >
                            {t('adminOtc.adjustAsset')}
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
        <DialogTitle>{t('adminOtc.adjustUserAsset')}</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label={t('adminOtc.username')}
                  value={selectedItem.userName || '-'}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
                <TextField
                  label={t('adminOtc.currency')}
                  value={selectedItem.currencyCode}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label={t('adminOtc.currentBalance')}
                  value={selectedItem.balance}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
                <TextField
                  label={t('adminOtc.availableBalance')}
                  value={selectedItem.availableBalance}
                  size='small'
                  disabled
                  sx={{ flex: 1 }}
                />
              </Box>
              <FormControl size='small' fullWidth>
                <InputLabel>{t('adminOtc.adjustType')}</InputLabel>
                <Select
                  value={adjustForm.adjustType}
                  label={t('adminOtc.adjustType')}
                  onChange={e => setAdjustForm({ ...adjustForm, adjustType: e.target.value as 1 | 2 })}
                >
                  <MenuItem value={1}>{t('adminOtc.add')}</MenuItem>
                  <MenuItem value={2}>{t('adminOtc.deduct')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('adminOtc.adjustAmount')}
                type='number'
                value={adjustForm.amount}
                onChange={e => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                size='small'
                fullWidth
                required
                inputProps={{ min: 0, step: '0.01' }}
                placeholder={t('adminOtc.enterAdjustAmount')}
              />
              <TextField
                label={t('adminOtc.adjustReason')}
                value={adjustForm.remark}
                onChange={e => setAdjustForm({ ...adjustForm, remark: e.target.value })}
                size='small'
                fullWidth
                multiline
                rows={3}
                placeholder={t('adminOtc.enterAdjustReason')}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAdjustDialog} disabled={adjusting}>
            {t('adminOtc.cancel')}
          </Button>
          <Button variant='contained' onClick={handleAdjustSubmit} disabled={adjusting}>
            {adjusting ? t('adminOtc.submitting') : t('adminOtc.confirmAdjust')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AdminAssetList
