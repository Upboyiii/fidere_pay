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
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getAdminPayeeList, type AdminPayeeItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

const AdminPayeeList = ({ mode }: { mode: Mode }) => {
  const t = useTranslate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<AdminPayeeItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userName: '',
    userNickname: '',
    accountType: '0' as string,
    searchKey: ''
  })

  const loadData = async (targetFilters?: typeof filters, targetPage?: number) => {
    setLoading(true)
    try {
      const currentFilters = targetFilters !== undefined ? targetFilters : filters
      const currentPage = targetPage !== undefined ? targetPage : page
      const res = await getAdminPayeeList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        userName: currentFilters.userName || undefined,
        userNickname: currentFilters.userNickname || undefined,
        accountType: currentFilters.accountType !== '0' ? Number(currentFilters.accountType) : undefined,
        searchKey: currentFilters.searchKey || undefined
      })
      const list = res.data?.list || []
      setData(list)
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载收款人列表失败:', error)
      toast.error(t('adminOtc.loadDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, rowsPerPage])

  const handleCopyAccount = (account: string) => {
    navigator.clipboard.writeText(account)
    toast.success(t('adminOtc.copied'))
  }

  const getAccountTypeLabel = (accountType: number) => {
    return accountType === 1 ? t('adminOtc.company') : accountType === 2 ? t('adminOtc.personal') : '-'
  }

  // remitType: 1=SWIFT 2=本地
  const getRemitTypeChipLabel = (remitType: number) => {
    return remitType === 1 ? 'SWIFT' : remitType === 2 ? t('remittance.localRemittance') : String(remitType)
  }

  const getRecipientName = (item: AdminPayeeItem) => {
    if (item.accountType === 1) {
      return item.companyName || item.accountName
    }
    return `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.accountName
  }

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-'
    const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
    return new Date(ts).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ width: '100%', borderRadius: '16px' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>{t('adminOtc.payeeListTitle')}</Typography>
              <Chip label={t('adminOtc.totalRecords', { count: total })} size='small' variant='outlined' />
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label={t('adminOtc.username')}
                value={filters.userName}
                onChange={e => setFilters({ ...filters, userName: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
                placeholder={t('adminOtc.usernameSearchPlaceholder')}
              />
              <TextField
                label={t('adminOtc.userNickname')}
                value={filters.userNickname}
                onChange={e => setFilters({ ...filters, userNickname: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
                placeholder={t('adminOtc.userNicknameSearchPlaceholder')}
              />
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='account-type-label'>{t('adminOtc.accountType')}</InputLabel>
                <Select
                  labelId='account-type-label'
                  value={filters.accountType}
                  onChange={e => setFilters({ ...filters, accountType: e.target.value })}
                  label={t('adminOtc.accountType')}
                >
                  <MenuItem value='0'>{t('adminOtc.all')}</MenuItem>
                  <MenuItem value='1'>{t('adminOtc.company')}</MenuItem>
                  <MenuItem value='2'>{t('adminOtc.personal')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('adminOtc.searchKey')}
                value={filters.searchKey}
                onChange={e => setFilters({ ...filters, searchKey: e.target.value })}
                size='small'
                sx={{ minWidth: 220 }}
                placeholder={t('adminOtc.searchKeyPlaceholder')}
              />
              <Button
                variant='contained'
                onClick={() => {
                  setPage(0)
                  loadData(undefined, 0)
                }}
                disabled={loading}
              >
                {t('adminOtc.search')}
              </Button>
              <Button
                variant='outlined'
                onClick={() => {
                  const resetFilters = {
                    userName: '',
                    userNickname: '',
                    accountType: '0',
                    searchKey: ''
                  }
                  setFilters(resetFilters)
                  setPage(0)
                  loadData(resetFilters, 0)
                }}
                disabled={loading}
              >
                {t('adminOtc.reset')}
              </Button>
            </Box>
            <Box
              sx={{
                overflowX: 'auto',
                overflowY: 'visible',
                '&::-webkit-scrollbar': { height: '10px' },
                '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: '5px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '5px' }
              }}
            >
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th>{t('adminOtc.username')}</th>
                    <th>{t('adminOtc.userNickname')}</th>
                    <th>{t('adminOtc.remitType')}</th>
                    <th>{t('adminOtc.accountType')}</th>
                    <th>{t('adminOtc.recipient')}</th>
                    <th>{t('adminOtc.bankInfo')}</th>
                    <th>{t('adminOtc.createTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        {t('adminOtc.loading')}
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='text-center'>
                        {t('adminOtc.noData')}
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {item.userName || '-'}
                          </Typography>
                        </td>
                        <td>
                          <Typography variant='body2' color='text.secondary'>
                            {item.userNickname || '-'}
                          </Typography>
                        </td>
                        <td>
                          <Chip
                            label={getRemitTypeChipLabel(item.remitType)}
                            size='small'
                            variant='outlined'
                            color='info'
                          />
                        </td>
                        <td>
                          <Chip
                            label={getAccountTypeLabel(item.accountType)}
                            size='small'
                            variant='outlined'
                          />
                        </td>
                        <td>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {getRecipientName(item)}
                          </Typography>
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {item.accountNo}
                            </Typography>
                            <IconButton size='small' sx={{ width: 24, height: 24, p: 0 }} onClick={() => handleCopyAccount(item.accountNo)}>
                              <i className='ri-file-copy-line' style={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                            {item.bankName}
                          </Typography>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {formatTime(item.createdAt || (item as any).createTime)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
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

export default AdminPayeeList
