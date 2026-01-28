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
import Chip from '@mui/material/Chip'

// Type Imports
import type { Mode } from '@core/types'

// API Imports
import {
  getFeeConfigList,
  setFeeConfig,
  deleteFeeConfig,
  type FeeConfigListItem
} from '@server/otc-api'
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const FeeConfigList = ({ mode }: { mode: Mode }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<FeeConfigListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FeeConfigListItem | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    fixedFee: '',
    ratioFee: '',
    status: '1',
    remark: ''
  })
  const [filters, setFilters] = useState({
    userId: '',
    status: '-1'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getFeeConfigList({
        pageNum: page + 1,
        pageSize: rowsPerPage,
        userId: filters.userId ? Number(filters.userId) : undefined,
        status: filters.status !== '-1' ? Number(filters.status) : undefined
      })
      setData(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, rowsPerPage, filters.userId, filters.status])

  const handleOpenDialog = (item?: FeeConfigListItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        userId: String(item.userId),
        fixedFee: String(item.fixedFee),
        ratioFee: String(item.ratioFee),
        status: String(item.status),
        remark: item.remark || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        userId: '',
        fixedFee: '',
        ratioFee: '',
        status: '1',
        remark: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      await setFeeConfig({
        userId: Number(formData.userId),
        fixedFee: formData.fixedFee ? Number(formData.fixedFee) : undefined,
        ratioFee: formData.ratioFee ? Number(formData.ratioFee) : undefined,
        status: Number(formData.status),
        remark: formData.remark
      })
      toast.success('保存成功')
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败')
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('确定要删除吗？')) return
    try {
      await deleteFeeConfig({ userId })
      toast.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h5'>手续费配置</Typography>
              <Button variant='contained' onClick={() => handleOpenDialog()}>
                新增配置
              </Button>
            </Box>
            <Box className='flex items-center gap-4 mb-4'>
              <TextField
                label='用户ID'
                value={filters.userId}
                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                size='small'
              />
              <TextField
                label='状态'
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                size='small'
                select
                SelectProps={{ native: true }}
              >
                <option value='-1'>全部</option>
                <option value='0'>禁用</option>
                <option value='1'>启用</option>
              </TextField>
              <Button variant='contained' onClick={loadData}>
                查询
              </Button>
            </Box>
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>用户ID</th>
                    <th>固定手续费</th>
                    <th>比例手续费</th>
                    <th>状态</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className='text-center'>
                        加载中...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='text-center'>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    data.map(item => (
                      <tr key={item.id}>
                        <td>{item.userId}</td>
                        <td>{item.fixedFee}</td>
                        <td>{item.ratioFee ? `${(item.ratioFee * 100).toFixed(2)}%` : '-'}</td>
                        <td>
                          <Chip
                            label={item.status === 1 ? '启用' : '禁用'}
                            color={item.status === 1 ? 'success' : 'default'}
                            size='small'
                          />
                        </td>
                        <td>{item.remark}</td>
                        <td>
                          <Button size='small' onClick={() => handleOpenDialog(item)}>
                            编辑
                          </Button>
                          <Button size='small' color='error' onClick={() => handleDelete(item.userId)}>
                            删除
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{editingItem ? '编辑手续费配置' : '新增手续费配置'}</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4 mt-4'>
            <TextField
              label='用户ID'
              value={formData.userId}
              onChange={e => setFormData({ ...formData, userId: e.target.value })}
              required
              disabled={!!editingItem}
            />
            <TextField
              label='固定手续费'
              value={formData.fixedFee}
              onChange={e => setFormData({ ...formData, fixedFee: e.target.value })}
              type='number'
            />
            <TextField
              label='比例手续费 (0.001=0.1%)'
              value={formData.ratioFee}
              onChange={e => setFormData({ ...formData, ratioFee: e.target.value })}
              type='number'
            />
            <TextField
              label='状态'
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              select
              SelectProps={{ native: true }}
            >
              <option value='0'>禁用</option>
              <option value='1'>启用</option>
            </TextField>
            <TextField
              label='备注'
              value={formData.remark}
              onChange={e => setFormData({ ...formData, remark: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant='contained' onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default FeeConfigList
