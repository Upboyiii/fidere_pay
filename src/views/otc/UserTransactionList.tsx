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

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import { getUserTransactionList, type UserTransactionListItem } from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Hook Imports
import { useTranslate } from '@/contexts/DictionaryContext'

// Util Imports
import { getDateLocaleFromLang } from '@/utils/routeUtils'

const UserTransactionList = ({ mode }: { mode: Mode }) => {
  const params = useParams()
  const t = useTranslate()
  const dateLocale = getDateLocaleFromLang(params?.lang as string)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<UserTransactionListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    currencyCode: '',
    bizType: '',
    direction: '',
    startTime: '',
    endTime: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getUserTransactionList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        currencyCode: filters.currencyCode || undefined,
        bizType: filters.bizType ? Number(filters.bizType) : undefined,
        direction: filters.direction ? Number(filters.direction) : undefined,
        startTime: filters.startTime ? Math.floor(new Date(filters.startTime).getTime() / 1000) : undefined,
        endTime: filters.endTime ? Math.floor(new Date(filters.endTime).getTime() / 1000) : undefined
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

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>{t('assets.fundFlow')}</Typography>
            </Box>
            <Box className='flex items-center gap-4 mb-4 flex-wrap'>
              <TextField
                label={t('adminOtc.currencyCode')}
                value={filters.currencyCode}
                onChange={e => setFilters({ ...filters, currencyCode: e.target.value })}
                size='small'
              />
              <TextField
                label={t('adminOtc.bizType')}
                value={filters.bizType}
                onChange={e => setFilters({ ...filters, bizType: e.target.value })}
                size='small'
              />
              <TextField
                label={t('adminOtc.direction')}
                value={filters.direction}
                onChange={e => setFilters({ ...filters, direction: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value=''>{t('adminOtc.all')}</option>
                <option value='1'>{t('adminOtc.incoming')}</option>
                <option value='2'>{t('adminOtc.outgoing')}</option>
              </TextField>
              <TextField
                label={t('adminOtc.startDate')}
                type='datetime-local'
                value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })}
                size='small'
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={t('adminOtc.endDate')}
                type='datetime-local'
                value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })}
                size='small'
                InputLabelProps={{ shrink: true }}
              />
              <Button variant='contained' onClick={loadData}>
                {t('adminOtc.search')}
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>{t('adminOtc.currency')}</th>
                    <th>{t('adminOtc.bizType')}</th>
                    <th>{t('adminOtc.direction')}</th>
                    <th>{t('adminOtc.amount')}</th>
                    <th>{t('adminOtc.totalBalance')}</th>
                    <th>{t('adminOtc.createTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className='text-center'>
                        {t('adminOtc.loading')}
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='text-center'>
                        {t('adminOtc.noData')}
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.currencyCode}</td>
                        <td>{item.bizType}</td>
                        <td>{item.direction === 1 ? t('adminOtc.incoming') : t('adminOtc.outgoing')}</td>
                        <td className={item.direction === 1 ? 'text-green-600' : 'text-red-600'}>
                          {item.direction === 1 ? '+' : '-'}
                          {item.amount}
                        </td>
                        <td>{item.balance}</td>
                        <td>{new Date(item.createdAt).toLocaleString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
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

export default UserTransactionList
