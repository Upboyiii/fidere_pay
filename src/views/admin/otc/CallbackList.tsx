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
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getCallbackList, retryCallback, type CallbackListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Util Imports
import { getDateLocaleFromLang } from '@/utils/routeUtils'
import LocalizedDateField from '@/components/LocalizedDateField'

const CallbackList = ({ mode }: { mode: Mode }) => {
  const t = useTranslate()
  const params = useParams()
  const currentLang = (params?.lang as string) || undefined
  const dateLocale = getDateLocaleFromLang(currentLang)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<CallbackListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    callbackType: '',
    callbackStatus: '-1',
    startDate: '',
    endDate: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      // 转换日期为秒级时间戳
      // 开始时间：当天的 00:00:00
      // 结束时间：当天的 23:59:59（包含整天的数据）
      let startTime: number | undefined
      let endTime: number | undefined
      if (filters.startDate) {
        const [year, month, day] = filters.startDate.split('-').map(Number)
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
        startTime = Math.floor(startDate.getTime() / 1000)
      }
      if (filters.endDate) {
        const [year, month, day] = filters.endDate.split('-').map(Number)
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
        endTime = Math.floor(endDate.getTime() / 1000)
      }

      const res = await getCallbackList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined,
        callbackType: filters.callbackType ? Number(filters.callbackType) : undefined,
        callbackStatus: filters.callbackStatus !== '-1' ? Number(filters.callbackStatus) : undefined,
        startTime,
        endTime
      })
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
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

  const handleRetry = async (id: number) => {
    try {
      await retryCallback({ id })
      toast.success(t('adminOtc.retrySuccess') || '重试成功')
      loadData()
    } catch (error) {
      console.error('重试失败:', error)
      toast.error(t('adminOtc.retryFailed') || '重试失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>{t('adminOtc.callbackRecordList')}</Typography>
            </Box>
            <Box className='flex items-center gap-4 mb-6 flex-wrap'>
              <TextField
                label={t('adminOtc.callbackType') || '回调类型'}
                value={filters.callbackType}
                onChange={e => setFilters({ ...filters, callbackType: e.target.value })}
                size='small'
                sx={{ minWidth: 120 }}
              />
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='callback-status-label'>{t('adminOtc.callbackStatus') || '回调状态'}</InputLabel>
                <Select
                  labelId='callback-status-label'
                  value={filters.callbackStatus}
                  onChange={e => setFilters({ ...filters, callbackStatus: e.target.value })}
                  label={t('adminOtc.callbackStatus') || '回调状态'}
                >
                  <MenuItem value='-1'>{t('adminOtc.all')}</MenuItem>
                  <MenuItem value='0'>{t('adminOtc.pending')}</MenuItem>
                  <MenuItem value='1'>{t('common.success')}</MenuItem>
                  <MenuItem value='2'>{t('adminOtc.failed')}</MenuItem>
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
              <Button variant='contained' onClick={loadData}>
                {t('adminOtc.search')}
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper} style={{ overflowX: 'auto' }}>
              <table className={tableStyles.table} style={{ width: '100%', minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('adminOtc.callbackType') || '回调类型'}</th>
                    <th>{t('adminOtc.callbackStatus') || '回调状态'}</th>
                    <th>{t('adminOtc.callbackUrl')}</th>
                    <th>{t('adminOtc.retryCount') || '重试次数'}</th>
                    <th>{t('adminOtc.createTime')}</th>
                    <th>{t('common.actions') || '操作'}</th>
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
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.callbackType}</td>
                        <td>
                          <Chip
                            label={item.callbackStatus === 1 ? t('common.success') : item.callbackStatus === 2 ? t('adminOtc.failed') : t('adminOtc.pending')}
                            color={item.callbackStatus === 1 ? 'success' : item.callbackStatus === 2 ? 'error' : 'warning'}
                            size='small'
                          />
                        </td>
                        <td className='max-w-xs truncate'>{item.callbackUrl}</td>
                        <td>{item.retryCount}</td>
                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</td>
                        <td>
                          <Button size='small' onClick={() => handleRetry(item.id)}>
                            {t('adminOtc.retry') || '重试'}
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
