'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

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

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Util Imports
import { getDateLocaleFromLang } from '@/utils/routeUtils'
import LocalizedDateField from '@/components/LocalizedDateField'

const AdminTransactionList = ({ mode }: { mode: Mode }) => {
  const t = useTranslate()
  const params = useParams()
  const currentLang = (params?.lang as string) || undefined
  const dateLocale = getDateLocaleFromLang(currentLang)
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
    startDate: '',
    endDate: ''
  })

  const loadData = async (targetFilters?: typeof filters, targetPage?: number) => {
    setLoading(true)
    try {
      const currentFilters = targetFilters !== undefined ? targetFilters : filters
      const currentPage = targetPage !== undefined ? targetPage : page
      
      // 转换日期为秒级时间戳
      // 开始时间：当天的 00:00:00
      // 结束时间：当天的 23:59:59（包含整天的数据）
      let startTime: number | undefined
      let endTime: number | undefined
      if (currentFilters.startDate) {
        const [year, month, day] = currentFilters.startDate.split('-').map(Number)
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
        startTime = Math.floor(startDate.getTime() / 1000)
      }
      if (currentFilters.endDate) {
        const [year, month, day] = currentFilters.endDate.split('-').map(Number)
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
        endTime = Math.floor(endDate.getTime() / 1000)
      }

      const res = await getAdminTransactionList({
        pageNum: currentPage + 1,
        pageSize: rowsPerPage,
        userId: currentFilters.userId ? Number(currentFilters.userId) : undefined,
        userName: currentFilters.userName || undefined,
        currencyCode: currentFilters.currencyCode || undefined,
        bizType: currentFilters.bizType ? Number(currentFilters.bizType) : undefined,
        direction: currentFilters.direction ? Number(currentFilters.direction) : undefined,
        startTime,
        endTime
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
      toast.error(t('adminOtc.loadDataFailed'))
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
      {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
      </Grid> */}

      <Grid size={12}>
        <Card sx={{ width: '100%', borderRadius: '16px' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>{t('adminOtc.financialList')}</Typography>
              <Chip label={t('adminOtc.totalRecords', { count: total })} size='small' variant='outlined' />
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label={t('adminOtc.username')}
                value={filters.userName}
                onChange={e => setFilters({ ...filters, userName: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
              />
              <TextField
                label={t('adminOtc.currencyCode')}
                value={filters.currencyCode}
                onChange={e => setFilters({ ...filters, currencyCode: e.target.value })}
                size='small'
                sx={{ minWidth: 150 }}
                placeholder={t('adminOtc.currencyCodePlaceholder')}
              />
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='bizType-label'>{t('adminOtc.bizType')}</InputLabel>
                <Select
                  labelId='bizType-label'
                  value={filters.bizType}
                  onChange={e => setFilters({ ...filters, bizType: e.target.value })}
                  label={t('adminOtc.bizType')}
                >
                  <MenuItem value=''>{t('adminOtc.all')}</MenuItem>
                  <MenuItem value='1'>{t('adminOtc.recharge')}</MenuItem>
                  <MenuItem value='2'>{t('adminOtc.withdraw')}</MenuItem>
                  <MenuItem value='3'>{t('adminOtc.transfer')}</MenuItem>
                  <MenuItem value='5'>{t('adminOtc.adminAdjust')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel id='direction-label'>{t('adminOtc.direction')}</InputLabel>
                <Select
                  labelId='direction-label'
                  value={filters.direction}
                  onChange={e => setFilters({ ...filters, direction: e.target.value })}
                  label={t('adminOtc.direction')}
                >
                  <MenuItem value=''>{t('adminOtc.all')}</MenuItem>
                  <MenuItem value='1'>{t('adminOtc.incoming')}</MenuItem>
                  <MenuItem value='2'>{t('adminOtc.outgoing')}</MenuItem>
                </Select>
              </FormControl>
              <LocalizedDateField
                label={t('adminOtc.startDate')}
                placeholder={t('adminOtc.selectStartDate')}
                value={filters.startDate}
                onChange={v => setFilters({ ...filters, startDate: v })}
                size='small'
                labelAbove={false}
                sx={{ minWidth: 200 }}
              />
              <LocalizedDateField
                label={t('adminOtc.endDate')}
                placeholder={t('adminOtc.selectEndDate')}
                value={filters.endDate}
                onChange={v => setFilters({ ...filters, endDate: v })}
                minDate={filters.startDate ? new Date(filters.startDate + 'T00:00:00') : undefined}
                size='small'
                labelAbove={false}
                sx={{ minWidth: 200 }}
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
                    userId: '',
                    userName: '',
                    currencyCode: '',
                    bizType: '',
                    direction: '',
                    startDate: '',
                    endDate: ''
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
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '1400px' }}>
                <thead>
                  <tr>
                    <th>{t('adminOtc.orderNo')}</th>
                    <th>{t('adminOtc.userInfo')}</th>
                    <th>{t('adminOtc.currency')}</th>
                    <th>{t('adminOtc.bizType')}</th>
                    <th>{t('adminOtc.direction')}</th>
                    <th>{t('adminOtc.changeAmount')}</th>
                    <th>{t('adminOtc.availableBalanceChange')}</th>
                    <th>{t('adminOtc.frozenBalanceChange')}</th>
                    <th>{t('adminOtc.remark')}</th>
                    <th>{t('adminOtc.createTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className='text-center'>
                        {t('adminOtc.loading')}
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={10} className='text-center'>
                        {t('adminOtc.noData')}
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
                              item.bizType === 1 ? t('adminOtc.recharge') : 
                              item.bizType === 2 ? t('adminOtc.withdraw') : 
                              item.bizType === 3 ? t('adminOtc.transfer') : 
                              item.bizType === 5 ? t('adminOtc.adminAdjust') : 
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
                            label={item.direction === 1 ? t('adminOtc.incoming') : t('adminOtc.outgoing')}
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
                              {t('adminOtc.before')}: {item.availableBalanceBefore}
                            </span>
                            <span style={{ color: 'var(--mui-palette-text-primary)' }}>
                              {t('adminOtc.after')}: {item.availableBalanceAfter}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--mui-palette-text-secondary)' }}>
                              {t('adminOtc.before')}: {item.frozenBalanceBefore}
                            </span>
                            <span style={{ color: 'var(--mui-palette-text-primary)' }}>
                              {t('adminOtc.after')}: {item.frozenBalanceAfter}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Tooltip title={item.remark || t('adminOtc.noRemark')} arrow placement='top'>
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
                            // 兼容 createTime 和 createdAt 两个字段名，支持10位秒级和13位毫秒级时间戳
                            const timestamp = item.createTime || item.createdAt
                            if (!timestamp) return '-'
                            // 判断时间戳长度：10位是秒级，需要乘以1000；13位是毫秒级，直接使用
                            const timestampStr = String(timestamp)
                            const ms = timestampStr.length === 10 ? timestamp * 1000 : timestamp
                            return new Date(ms).toLocaleString(dateLocale, {
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
